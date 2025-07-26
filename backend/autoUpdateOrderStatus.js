const mongoose = require('mongoose');
const Bill = require('./models/Bill/BillUser');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = await Bill.updateMany(
      {
        trang_thai: 'đã giao hàng',
        ngay_tao: { $lte: threeDaysAgo }
      },
      {
        $set: { trang_thai: 'đã nhận hàng' }
      }
    );
    console.log(`Đã cập nhật ${result.nModified || result.modifiedCount} đơn hàng sang trạng thái 'đã nhận hàng'.`);

    // Hủy đơn VNPAY chưa thanh toán sau 5 phút (chỉ cho trường hợp đặc biệt)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const vnpayBills = await Bill.find({
      phuong_thuc_thanh_toan: 'VNPAY',
      paymentStatus: { $ne: 'paid' },
      trang_thai: { $nin: ['đã hủy', 'hoàn thành', 'đã nhận hàng'] },
      ngay_tao: { $lte: fiveMinutesAgo }
    });

    if (vnpayBills.length > 0) {
      console.log(`[AUTO CANCEL] Tìm thấy ${vnpayBills.length} đơn hàng VNPAY chưa thanh toán sau 5 phút (trường hợp đặc biệt)`);
    }

    let cancelledCount = 0;
    for (const bill of vnpayBills) {
      // Hoàn kho khi hủy đơn hàng
      const Product = require('./models/Product');
      for (const item of bill.danh_sach_san_pham) {
        console.log(`[AUTO CANCEL] Restoring stock for product ${item.san_pham_id}, color: ${item.mau_sac}, size: ${item.kich_thuoc}, quantity: ${item.so_luong}`);

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
          console.log(`[AUTO CANCEL] Variant not found, trying to update main product stock`);
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
            console.log(`[AUTO CANCEL] Failed to restore stock for product ${item.san_pham_id}`);
          } else {
            console.log(`[AUTO CANCEL] Successfully restored main product stock for ${item.san_pham_id}`);
          }
        } else {
          console.log(`[AUTO CANCEL] Successfully restored variant stock for product ${item.san_pham_id}`);
        }
      }

      // Cập nhật trạng thái đơn hàng
      bill.trang_thai = 'đã hủy';
      bill.ly_do_huy = 'Khách không hoàn tất thanh toán VNPAY trong 5 phút (trường hợp đặc biệt)';
      bill.nguoi_huy = {
        id: null,
        loai: 'Admin'
      };
      await bill.save();
      cancelledCount++;
    }
    console.log(`Đã tự động hủy ${cancelledCount} đơn VNPAY chưa thanh toán sau 5 phút (trường hợp đặc biệt).`);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
    process.exit(1);
  }
})(); 