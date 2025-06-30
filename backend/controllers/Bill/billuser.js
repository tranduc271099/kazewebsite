const Bill = require('../../models/Bill/BillUser');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');
const mongoose = require('mongoose');

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
        shippingFee,
        danh_sach_san_pham: selectedItems
      } = req.body;
      const nguoi_dung_id = req.user.id;
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
            subtotal += product.price * item.quantity;
            return {
              san_pham_id: product._id,
              ten_san_pham: product.name,
              so_luong: item.quantity,
              gia: product.price,
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
            subtotal += product.price * item.quantity;
            return {
              san_pham_id: product._id,
              ten_san_pham: product.name,
              so_luong: item.quantity,
              gia: product.price,
              mau_sac: item.color,
              kich_thuoc: item.size,
            };
          });
      }
      if (danh_sach_san_pham.length === 0) {
        return res.status(400).json({ message: 'Không có sản phẩm hợp lệ để tạo đơn hàng.' });
      }
      const tong_tien = subtotal + (shippingFee || 0);
      const newBill = new Bill({
        nguoi_dung_id,
        dia_chi_giao_hang,
        tong_tien,
        phuong_thuc_thanh_toan,
        ghi_chu,
        danh_sach_san_pham,
        shippingFee
      });
      await newBill.save();
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
      if (bill.trang_thai !== 'chờ xác nhận') {
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });
      }

      bill.trang_thai = 'đã hủy';
      bill.ly_do_huy = ly_do_huy || '';
      bill.nguoi_huy = { id: userId, loai: 'User' };
      await bill.save();
      res.status(200).json({ message: 'Hủy đơn hàng thành công', bill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng', error: error.message });
    }
  }

  // Lấy tất cả đơn hàng (admin)
  async getAll(req, res) {
    try {
      console.log('Getting all bills...');
      const bills = await Bill.find()
        .populate('nguoi_dung_id', 'name email phone')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        })
        .sort({ ngay_tao: -1 });
      console.log('Found bills:', bills.length);
      res.json({ bills });
    } catch (error) {
      console.error('Error getting all bills:', error);
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

      // Nếu huỷ đơn
      if (trang_thai === 'đã hủy') {
        bill.ly_do_huy = ly_do_huy || '';
        bill.nguoi_huy = {
          id: req.user.id,
          loai: req.user.role === 'admin' ? 'Admin' : 'User'
        };
      }

      // Cập nhật trạng thái thanh toán nếu có
      if (thanh_toan) {
        bill.thanh_toan = thanh_toan;
      }

      bill.trang_thai = trang_thai;
      await bill.save();

      console.log('Bill updated successfully:', bill._id, 'New status:', bill.trang_thai);

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
      const bill = await Bill.findOne({ _id: id, nguoi_dung_id: userId });
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      if (bill.trang_thai !== 'đã giao hàng') {
        return res.status(400).json({ message: 'Chỉ xác nhận khi đơn đã giao hàng' });
      }

      bill.trang_thai = 'hoàn thành';
      await bill.save();
      res.json({ message: 'Đã xác nhận nhận hàng', bill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = BillController;
