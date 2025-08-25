const Bill = require('../../models/Bill/BillUser');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');
const User = require('../../models/User');
const mongoose = require('mongoose');
const { notifyClientData, notifyClientDataUpdate, EVENT_TYPES } = require('../../utils/realTimeNotifier');
const emailService = require('../../services/emailService');

// Socket function to notify admin about order creation and stock reduction
const notifyAdminOrderCreated = (req, orderData) => {
  if (req.io) {
    req.io.emit('order_created', {
      orderId: orderData.orderId,
      totalAmount: orderData.tong_tien,
      productCount: orderData.danh_sach_san_pham.length,
      username: req.user.name || req.user.username || 'Khách hàng',
      timestamp: new Date()
    });

    // Thông báo cho từng sản phẩm đã giảm tồn kho
    orderData.danh_sach_san_pham.forEach(item => {
      req.io.emit('stock_reduced', {
        productId: item.san_pham_id,
        productName: item.ten_san_pham,
        quantity: item.so_luong,
        color: item.mau_sac,
        size: item.kich_thuoc,
        username: req.user.name || req.user.username || 'Khách hàng',
        timestamp: new Date()
      });
    });
  }
};

class BillController {
  async getList(req, res) {
    try {
      const userId = req.user.id;
      const bills = await Bill.find({ nguoi_dung_id: userId })
        .populate('nguoi_dung_id', 'name email phone')
        .populate('nguoi_huy.id', 'name')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        })
        .sort({ ngay_tao: -1 });
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  async addBill(req, res) {
    try {
      const {
        dia_chi_giao_hang,
        phuong_thuc_thanh_toan,
        ghi_chu,
        receiver_name,
        receiver_phone,
        receiver_email,
        // shippingFee, // Không nhận từ client nữa
        danh_sach_san_pham: selectedItems,
        discount = 0,
        voucher = null,
        orderId // vẫn nhận orderId nếu có
      } = req.body;
      const nguoi_dung_id = req.user.id;
      // Nếu không có orderId từ client, tự sinh orderId
      const finalOrderId = orderId || Date.now().toString();
      // Log thông tin tạo đơn hàng
      console.log(`[ADD BILL] userId: ${nguoi_dung_id}, time: ${new Date().toISOString()}, ip: ${req.ip}`);
      const cart = await Cart.findOne({ userId: nguoi_dung_id }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống hoặc không tồn tại' });
      }
      let subtotal = 0;
      let danh_sach_san_pham = [];
      if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
        // Lọc các item trong cart theo selectedItems gửi lên
        danh_sach_san_pham = cart.items
          .filter(item => selectedItems.some(sel =>
            String(item.productId?._id || item.productId) === String(sel.id) &&
            item.color === sel.color &&
            item.size === sel.size
          ))
          .map(item => {
            const product = item.productId;
            if (!product) {
              throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
            }
            // Lấy giá biến thể nếu có
            let variantPrice = product.price;
            if (Array.isArray(product.variants) && product.variants.length > 0) {
              const variant = product.variants.find(v =>
                v.attributes && v.attributes.color === item.color && v.attributes.size === item.size
              );
              if (variant && typeof variant.price === 'number') {
                variantPrice = variant.price;
              }
            }
            subtotal += variantPrice * item.quantity;
            return {
              san_pham_id: product._id,
              ten_san_pham: product.name,
              so_luong: item.quantity,
              gia: variantPrice,
              mau_sac: item.color,
              kich_thuoc: item.size,
            };
          });
      } else {
        // Lấy toàn bộ cart như cũ
        danh_sach_san_pham = cart.items
          .filter(item => item.productId && typeof item.productId === 'object' && item.productId._id)
          .map(item => {
            const product = item.productId;
            if (!product) {
              throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
            }
            // Lấy giá biến thể nếu có
            let variantPrice = product.price;
            if (Array.isArray(product.variants) && product.variants.length > 0) {
              const variant = product.variants.find(v =>
                v.attributes && v.attributes.color === item.color && v.attributes.size === item.size
              );
              if (variant && typeof variant.price === 'number') {
                variantPrice = variant.price;
              }
            }
            subtotal += variantPrice * item.quantity;
            return {
              san_pham_id: product._id,
              ten_san_pham: product.name,
              so_luong: item.quantity,
              gia: variantPrice,
              mau_sac: item.color,
              kich_thuoc: item.size,
            };
          });
      }
      if (danh_sach_san_pham.length === 0) {
        return res.status(400).json({ message: 'Không có sản phẩm hợp lệ để tạo đơn hàng.' });
      }
      // Áp dụng voucher nếu có
      let voucherDoc = null;
      let discountAmount = 0;
      if (voucher && voucher.code) {
        const Voucher = require('../../models/Voucher');
        voucherDoc = await Voucher.findOne({ code: voucher.code, isActive: true });
        if (voucherDoc) {
          // Kiểm tra số lượng còn lại
          if (voucherDoc.usedCount >= voucherDoc.quantity) {
            return res.status(400).json({ message: 'Voucher đã hết lượt sử dụng.' });
          }
          if (voucherDoc.discountType === 'percent') {
            discountAmount = Math.round(subtotal * voucherDoc.discountValue / 100);
            if (voucherDoc.maxDiscount && discountAmount > voucherDoc.maxDiscount) {
              discountAmount = voucherDoc.maxDiscount;
            }
          } else if (voucherDoc.discountType === 'amount') {
            discountAmount = voucherDoc.discountValue;
          }
        } else {
          return res.status(400).json({ message: 'Voucher không hợp lệ.' });
        }
      }
      // Tính phí vận chuyển luôn là 30,000 cho mỗi đơn hàng
      let shippingFee = 30000;
      const tong_tien = subtotal + shippingFee - discountAmount;

      // --- BẮT ĐẦU: TRỪ KHO (Atomic) ---
      for (const item of danh_sach_san_pham) {
        console.log(`[ADD BILL] Reducing stock for product ${item.san_pham_id}, color: ${item.mau_sac}, size: ${item.kich_thuoc}, quantity: ${item.so_luong}`);

        const updateResult = await Product.updateOne(
          {
            _id: item.san_pham_id,
            "variants": {
              $elemMatch: {
                "attributes.color": item.mau_sac,
                "attributes.size": item.kich_thuoc,
                "stock": { $gte: item.so_luong }
              }
            }
          },
          {
            $inc: { "variants.$.stock": -item.so_luong }
          }
        );

        // Nếu không cập nhật được biến thể, thử cập nhật sản phẩm gốc (không có biến thể)
        if (updateResult.modifiedCount === 0) {
          console.log(`[ADD BILL] Variant not found, trying to update main product stock`);
          const fallbackUpdateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }],
              stock: { $gte: item.so_luong }
            },
            {
              $inc: { stock: -item.so_luong }
            }
          );

          // Nếu cả hai đều không thành công, sản phẩm không đủ hàng hoặc không tồn tại
          if (fallbackUpdateResult.modifiedCount === 0) {
            const product = await Product.findById(item.san_pham_id).lean();
            const variant = product.variants.find(v => v.attributes.color === item.mau_sac && v.attributes.size === item.kich_thuoc);
            if (!variant) {
              return res.status(400).json({ message: `Sản phẩm ${product.name} với thuộc tính đã chọn không tồn tại.` });
            }
            return res.status(400).json({ message: `Sản phẩm ${product.name} (${item.mau_sac} - ${item.kich_thuoc}) không đủ hàng. Tồn kho: ${variant.stock}, Cần: ${item.so_luong}` });
          } else {
            console.log(`[ADD BILL] Successfully reduced main product stock for ${item.san_pham_id}`);
          }
        } else {
          console.log(`[ADD BILL] Successfully reduced variant stock for product ${item.san_pham_id}`);
        }
      }
      // --- KẾT THÚC: TRỪ KHO ---

      const newBill = new Bill({
        nguoi_dung_id,
        dia_chi_giao_hang,
        receiver_name,
        receiver_phone,
        receiver_email,
        tong_tien,
        phuong_thuc_thanh_toan,
        ghi_chu,
        danh_sach_san_pham,
        shippingFee, // Lưu shippingFee đã tính
        discount: discountAmount,
        voucher: voucherDoc ? { ...voucherDoc.toObject(), code: voucherDoc.code } : undefined,
        orderId: finalOrderId
      });
      await newBill.save();
      // Nếu có voucher, tăng usedCount
      if (voucherDoc) {
        await voucherDoc.updateOne({ $inc: { usedCount: 1 } });
      }
      // Xóa các sản phẩm đã đặt khỏi giỏ hàng, giữ lại sản phẩm chưa đặt
      if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
        cart.items = cart.items.filter(item =>
          !selectedItems.some(sel =>
            String(item.productId?._id || item.productId) === String(sel.id) &&
            item.color === sel.color &&
            item.size === sel.size
          )
        );
        await cart.save();
      } else {
        await Cart.findByIdAndDelete(cart._id);
      }

      // Notify admin about order creation and stock reduction
      notifyAdminOrderCreated(req, {
        orderId: finalOrderId,
        tong_tien,
        danh_sach_san_pham
      });

      // Gửi email xác nhận đơn hàng
      try {
        const user = await User.findById(nguoi_dung_id);
        if (!user) {
          throw new Error('Không tìm thấy người dùng để gửi email.');
        }

        const orderEmailData = {
          customerName: receiver_name || user.name || user.username || 'Khách hàng',
          customerEmail: receiver_email || user.email,
          customerPhone: receiver_phone || user.phone,
          orderId: finalOrderId,
          orderDate: new Date(),
          shippingAddress: dia_chi_giao_hang,
          paymentMethod: phuong_thuc_thanh_toan === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPay',
          products: danh_sach_san_pham.map(p => ({
            ...p,
            gia: p.gia_ban // Đảm bảo giá đúng được gửi đi
          })),
          subtotal: subtotal,
          shippingFee: shippingFee,
          discount: discountAmount,
          totalAmount: tong_tien,
          voucher: voucherDoc
        };

        await emailService.sendOrderConfirmation(orderEmailData);
        console.log(`Email xác nhận đơn hàng đã được gửi tới: ${user.email}`);
      } catch (emailError) {
        console.error('Lỗi khi gửi email xác nhận đơn hàng:', emailError);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }

      res.status(201).json({ message: 'Tạo hóa đơn thành công', bill: newBill });
    } catch (error) {
      console.error('[ADD BILL ERROR]', error);
      res.status(500).json({ message: 'Lỗi server khi tạo hóa đơn', error: error.message });
    }
  }

  async cancelBill(req, res) {
    try {
      const { id } = req.params;
      const { ly_do_huy } = req.body;
      const userId = req.user.id;
      const bill = await Bill.findOne({ _id: id, nguoi_dung_id: userId });
      if (!bill) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }
      if (bill.trang_thai !== 'chờ xác nhận' && bill.trang_thai !== 'đã xác nhận') {
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận hoặc đã xác nhận' });
      }

      bill.trang_thai = 'đã hủy';
      bill.ly_do_huy = ly_do_huy || '';
      bill.nguoi_huy = { id: userId, loai: 'User' };
      await bill.save();

      // --- BẮT ĐẦU: HOÀN KHO (Atomic) ---
      for (const item of bill.danh_sach_san_pham) {
        console.log(`[CANCEL BILL] Restoring stock for product ${item.san_pham_id}, color: ${item.mau_sac}, size: ${item.kich_thuoc}, quantity: ${item.so_luong}`);

        // Thử cập nhật biến thể trước
        const updateResult = await Product.updateOne(
          {
            _id: item.san_pham_id,
            "variants": {
              $elemMatch: {
                "attributes.color": item.mau_sac,
                "attributes.size": item.kich_thuoc
              }
            }
          },
          {
            $inc: { "variants.$.stock": item.so_luong }
          }
        );

        // Nếu không cập nhật được biến thể, thử cập nhật sản phẩm gốc
        if (updateResult.modifiedCount === 0) {
          console.log(`[CANCEL BILL] Variant not found, trying to update main product stock`);
          const fallbackUpdateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
            },
            {
              $inc: { stock: item.so_luong }
            }
          );

          if (fallbackUpdateResult.modifiedCount === 0) {
            console.log(`[CANCEL BILL] Failed to restore stock for product ${item.san_pham_id}`);
          } else {
            console.log(`[CANCEL BILL] Successfully restored main product stock for ${item.san_pham_id}`);
          }
        } else {
          console.log(`[CANCEL BILL] Successfully restored variant stock for product ${item.san_pham_id}`);
        }
      }
      // --- KẾT THÚC: HOÀN KHO ---

      res.status(200).json({ message: 'Hủy đơn hàng thành công', bill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng', error: error.message });
    }
  }

  // Lấy tất cả đơn hàng (admin)
  async getAll(req, res) {
    try {
      const { search, status, paymentMethod, startDate, endDate } = req.query;
      const filter = {};

      // Remove status filter here, it will be handled by frontend for tab counts
      // if (status && status !== 'all') {
      //   filter.trang_thai = status;
      // }

      if (paymentMethod) {
        filter.phuong_thuc_thanh_toan = paymentMethod;
      }

      if (search) {
        const searchOrConditions = [
          { orderId: { $regex: search, $options: 'i' } },
          { 'danh_sach_san_pham.ten_san_pham': { $regex: search, $options: 'i' } }
        ];

        // Find users by name or phone and add their IDs to the filter
        const matchingUsers = await mongoose.model('User').find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');

        const userIds = matchingUsers.map(user => user._id);
        if (userIds.length > 0) {
          searchOrConditions.push({ nguoi_dung_id: { $in: userIds } });
        }

        filter.$or = searchOrConditions;
      }

      if (startDate || endDate) {
        filter.ngay_tao = {};
        if (startDate) {
          filter.ngay_tao.$gte = new Date(startDate);
        }
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          filter.ngay_tao.$lte = endOfDay;
        }
      }

      const bills = await Bill.find(filter)
        .populate('nguoi_dung_id', 'name email phone')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        })
        .sort({ ngay_tao: -1 });
      res.json({ bills });
    } catch (error) {
      console.error('Error getting all bills (filtered):', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // Lấy chi tiết đơn hàng theo id (admin)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const bill = await Bill.findById(id)
        .populate('nguoi_dung_id', 'name email phone')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        });
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  async getByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const bill = await Bill.findOne({ orderId, nguoi_dung_id: userId })
        .populate('nguoi_dung_id', 'name email phone')
        .populate('nguoi_huy.id', 'name')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        });

      if (!bill) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // Cập nhật trạng thái đơn hàng (admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { trang_thai, ly_do_huy, thanh_toan } = req.body;

      console.log('Update status request:', { id, trang_thai, ly_do_huy, thanh_toan });

      if (!id) {
        return res.status(400).json({ message: 'ID đơn hàng không được cung cấp' });
      }

      if (!trang_thai) {
        return res.status(400).json({ message: 'Trạng thái không được cung cấp' });
      }

      const bill = await Bill.findById(id);
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      console.log('Found bill:', bill._id, 'Current status:', bill.trang_thai);

      const oldStatus = bill.trang_thai; // Lưu lại trạng thái cũ

      // --- KHÔNG CẦN TRỪ KHO KHI XÁC NHẬN VÌ ĐÃ TRỪ KHI TẠO ĐƠN HÀNG ---
      // Stock đã được trừ ngay khi khách hàng đặt hàng để tránh overselling

      // Nếu huỷ đơn và trước đó đơn hàng chưa bị huỷ
      if (trang_thai === 'đã hủy' && oldStatus !== 'đã hủy') {
        bill.ly_do_huy = ly_do_huy || '';
        bill.nguoi_huy = {
          id: req.user.id,
          loai: req.user.role === 'admin' ? 'Admin' : 'User'
        };

        // --- BẮT ĐẦU: HOÀN KHO KHI ADMIN HUỶ ---
        for (const item of bill.danh_sach_san_pham) {
          // Thử cập nhật biến thể trước
          const updateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              "variants": {
                $elemMatch: {
                  "attributes.color": item.mau_sac,
                  "attributes.size": item.kich_thuoc
                }
              }
            },
            {
              $inc: { "variants.$.stock": item.so_luong }
            }
          );

          // Nếu không cập nhật được biến thể, thử cập nhật sản phẩm gốc
          if (updateResult.modifiedCount === 0) {
            console.log(`[ADMIN CANCEL BILL] Variant not found, trying to update main product stock`);
            const fallbackUpdateResult = await Product.updateOne(
              {
                _id: item.san_pham_id,
                $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
              },
              {
                $inc: { stock: item.so_luong }
              }
            );

            if (fallbackUpdateResult.modifiedCount === 0) {
              console.log(`[ADMIN CANCEL BILL] Failed to restore stock for product ${item.san_pham_id}`);
            } else {
              console.log(`[ADMIN CANCEL BILL] Successfully restored main product stock for ${item.san_pham_id}`);
            }
          } else {
            console.log(`[ADMIN CANCEL BILL] Successfully restored variant stock for product ${item.san_pham_id}`);
          }
        }
        // --- KẾT THÚC: HOÀN KHO KHI ADMIN HUỶ ---
      }

      // Nếu admin hoặc client chuyển sang hoàn thành thì luôn cập nhật đã thanh toán
      if (trang_thai === 'hoàn thành') {
        bill.thanh_toan = 'đã thanh toán';
      }

      // Cập nhật trạng thái thanh toán nếu có
      if (thanh_toan) {
        bill.thanh_toan = thanh_toan;
      }

      bill.trang_thai = trang_thai;
      await bill.save();

      console.log('Bill updated successfully:', bill._id, 'New status:', bill.trang_thai);

      // Notify clients about order status update
      notifyClientDataUpdate(req, EVENT_TYPES.ORDER_STATUS_UPDATED, {
        orderId: bill.orderId || bill._id,
        billId: bill._id,
        oldStatus: oldStatus,
        newStatus: trang_thai,
        adminUser: req.user?.name || req.user?.username || 'Admin',
        cancelReason: ly_do_huy || null
      });

      // Gửi email thông báo thay đổi trạng thái
      try {
        const populatedBill = await Bill.findById(bill._id).populate('nguoi_dung_id', 'name email');
        if (populatedBill && populatedBill.nguoi_dung_id && populatedBill.nguoi_dung_id.email) {
          const emailData = {
            customerName: populatedBill.nguoi_dung_id.name || 'Khách hàng',
            customerEmail: populatedBill.nguoi_dung_id.email,
            orderId: bill.orderId || bill._id.toString().slice(-8),
            oldStatus: oldStatus,
            newStatus: trang_thai
          };

          await emailService.sendOrderStatusUpdate(emailData);
          console.log(`Email thông báo trạng thái đã được gửi tới: ${populatedBill.nguoi_dung_id.email}`);
        }
      } catch (emailError) {
        console.error('Lỗi khi gửi email thông báo trạng thái:', emailError);
        // Không throw error để không ảnh hưởng đến việc cập nhật trạng thái
      }

      res.json({ message: 'Cập nhật trạng thái thành công', bill });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  async confirmReceived(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const bill = await Bill.findOne({ _id: id, nguoi_dung_id: userId })
        .populate('nguoi_dung_id', 'name email')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name'
        });
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      if (bill.trang_thai !== 'đã giao hàng') {
        return res.status(400).json({ message: 'Chỉ xác nhận khi đơn đã giao hàng' });
      }

      bill.trang_thai = 'hoàn thành';
      bill.thanh_toan = 'đã thanh toán';
      bill.paymentStatus = 'paid';
      await bill.save();

      // Emit socket event để thông báo cho admin
      if (req.io) {
        req.io.emit('order_completed', {
          orderId: bill.orderId || bill._id,
          billId: bill._id,
          customerName: bill.nguoi_dung_id?.name || 'Khách hàng',
          customerEmail: bill.nguoi_dung_id?.email || '',
          totalAmount: bill.tong_tien,
          productCount: bill.danh_sach_san_pham.length,
          completedAt: new Date(),
          message: `Đơn hàng ${bill.orderId || bill._id.toString().slice(-8)} đã được khách hàng xác nhận nhận hàng`
        });
      }

      res.json({ message: 'Đã xác nhận nhận hàng', bill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  async createReturnRequest(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { reason, images, bankInfo } = req.body;

      if (!reason) {
        return res.status(400).json({ message: 'Vui lòng cung cấp lý do trả hàng' });
      }

      if (!bankInfo || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng' });
      }

      const bill = await Bill.findOne({ _id: id, nguoi_dung_id: userId });
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      if (bill.trang_thai !== 'đã giao hàng') {
        return res.status(400).json({ message: 'Chỉ có thể yêu cầu trả hàng khi đơn đã giao hàng' });
      }

      // Cập nhật trạng thái và thông tin yêu cầu trả hàng
      bill.trang_thai = 'yêu cầu trả hàng';
      bill.returnRequest = {
        reason,
        images: images || [],
        bankInfo,
        requestDate: new Date(),
        status: 'pending'
      };

      await bill.save();

      // Thông báo cho admin về yêu cầu trả hàng
      if (req.io) {
        req.io.emit('return_request_created', {
          orderId: bill.orderId || bill._id,
          billId: bill._id,
          customerName: req.user.name || 'Khách hàng',
          reason: reason,
          requestDate: new Date(),
          message: `Đơn hàng ${bill.orderId || bill._id.toString().slice(-8)} có yêu cầu trả hàng`
        });
      }

      // Notify clients about order status update
      notifyClientDataUpdate(req, EVENT_TYPES.ORDER_STATUS_UPDATED, {
        orderId: bill.orderId || bill._id,
        billId: bill._id,
        oldStatus: 'đã giao hàng',
        newStatus: 'yêu cầu trả hàng',
        customerName: req.user.name || 'Khách hàng'
      });

      res.json({ message: 'Đã gửi yêu cầu trả hàng', bill });
    } catch (error) {
      console.error('Error creating return request:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  async updateReturnRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes, adminImages } = req.body;

      // Hỗ trợ cả tiếng Việt và tiếng Anh cho trạng thái từ chối
      let normalizedStatus = status;
      if (status.toLowerCase().includes('từ chối')) normalizedStatus = 'rejected';
      if (!normalizedStatus || !['processing', 'approved', 'rejected'].includes(normalizedStatus)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }

      const bill = await Bill.findById(id);
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      if (bill.trang_thai !== 'yêu cầu trả hàng' && bill.trang_thai !== 'đang xử lý trả hàng') {
        return res.status(400).json({ message: 'Đơn hàng không có yêu cầu trả hàng' });
      }

      // Cập nhật trạng thái yêu cầu trả hàng
      bill.returnRequest.status = normalizedStatus;
      if (adminNotes) {
        bill.returnRequest.adminNotes = adminNotes;
      }
      if (adminImages && adminImages.length > 0) {
        bill.returnRequest.adminImages = adminImages;
      }

      // Cập nhật trạng thái đơn hàng dựa trên trạng thái yêu cầu
      if (normalizedStatus === 'processing') {
        bill.trang_thai = 'đang xử lý trả hàng';
      } else if (normalizedStatus === 'approved') {
        bill.trang_thai = 'đã hoàn tiền';

        // --- BẮT ĐẦU: HOÀN KHO KHI HOÀN TIỀN (Atomic) ---
        for (const item of bill.danh_sach_san_pham) {
          console.log(`[RETURN REQUEST] Restoring stock for product ${item.san_pham_id}, color: ${item.mau_sac}, size: ${item.kich_thuoc}, quantity: ${item.so_luong}`);

          // Thử cập nhật biến thể trước
          const updateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              "variants": {
                $elemMatch: {
                  "attributes.color": item.mau_sac,
                  "attributes.size": item.kich_thuoc
                }
              }
            },
            {
              $inc: { "variants.$.stock": item.so_luong }
            }
          );

          // Nếu không cập nhật được biến thể, thử cập nhật sản phẩm gốc
          if (updateResult.modifiedCount === 0) {
            console.log(`[RETURN REQUEST] Variant not found, trying to update main product stock`);
            const fallbackUpdateResult = await Product.updateOne(
              {
                _id: item.san_pham_id,
                $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
              },
              {
                $inc: { stock: item.so_luong }
              }
            );

            if (fallbackUpdateResult.modifiedCount === 0) {
              console.log(`[RETURN REQUEST] Failed to restore stock for product ${item.san_pham_id}`);
            } else {
              console.log(`[RETURN REQUEST] Successfully restored main product stock for ${item.san_pham_id}`);
            }
          } else {
            console.log(`[RETURN REQUEST] Successfully restored variant stock for product ${item.san_pham_id}`);
          }
        }
        // --- KẾT THÚC: HOÀN KHO KHI HOÀN TIỀN ---
      } else if (normalizedStatus === 'rejected') {
        // Nếu từ chối hoàn tiền, đơn hàng chuyển sang trạng thái 'từ chối hoàn tiền'
        bill.trang_thai = 'từ chối hoàn tiền';
      }

      await bill.save();

      // Thông báo cho khách hàng về cập nhật trạng thái yêu cầu
      notifyClientDataUpdate(req, EVENT_TYPES.ORDER_STATUS_UPDATED, {
        orderId: bill.orderId || bill._id,
        billId: bill._id,
        oldStatus: bill.trang_thai,
        newStatus: bill.trang_thai,
        returnRequestStatus: status,
        adminNotes: adminNotes || '',
        adminUser: req.user?.name || req.user?.username || 'Admin'
      });

      res.json({
        message: `Cập nhật trạng thái yêu cầu trả hàng thành ${status}`,
        bill
      });
    } catch (error) {
      console.error('Error updating return request status:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = BillController;
