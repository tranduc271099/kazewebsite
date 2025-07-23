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

    // Hủy đơn VNPAY chưa thanh toán sau 5 phút
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const vnpayCancelResult = await Bill.updateMany(
      {
        phuong_thuc_thanh_toan: 'VNPAY',
        paymentStatus: { $ne: 'paid' },
        trang_thai: { $nin: ['đã hủy', 'hoàn thành', 'đã nhận hàng'] },
        ngay_tao: { $lte: fiveMinutesAgo }
      },
      {
        $set: {
          trang_thai: 'đã hủy',
          ly_do_huy: 'Khách không hoàn tất thanh toán VNPAY trong 5 phút',
          nguoi_huy: { loai: 'Admin', id: null }
        }
      }
    );
    console.log(`Đã tự động hủy ${vnpayCancelResult.nModified || vnpayCancelResult.modifiedCount} đơn VNPAY chưa thanh toán sau 5 phút.`);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
    process.exit(1);
  }
})(); 