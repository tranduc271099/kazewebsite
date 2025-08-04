// Debug script để kiểm tra trạng thái đơn hàng thực tế trong database
require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./models/Bill/BillUser');
const User = require('./models/User');
const Product = require('./models/Product');

async function debugBillStatus(orderId) {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Tìm đơn hàng theo orderId hoặc _id
    let bill;
    if (orderId.length === 24) {
      // Có thể là MongoDB ObjectId
      bill = await Bill.findById(orderId).populate('nguoi_dung_id', 'name email');
    } else {
      // Tìm theo orderId
      bill = await Bill.findOne({ orderId: orderId }).populate('nguoi_dung_id', 'name email');
    }

    if (!bill) {
      console.log('❌ Không tìm thấy đơn hàng:', orderId);
      return;
    }

    console.log('\n📦 THÔNG TIN ĐỚN HÀNG:');
    console.log('='.repeat(50));
    console.log('ID:', bill._id);
    console.log('Order ID:', bill.orderId);
    console.log('Khách hàng:', bill.nguoi_dung_id?.name || 'N/A');
    console.log('Email:', bill.nguoi_dung_id?.email || 'N/A');
    console.log('Trạng thái hiện tại:', bill.trang_thai);
    console.log('Trạng thái thanh toán:', bill.thanh_toan);
    console.log('Phương thức thanh toán:', bill.phuong_thuc_thanh_toan);
    console.log('Ngày tạo:', bill.ngay_tao);
    console.log('Ngày cập nhật:', bill.ngay_cap_nhat);
    console.log('Tổng tiền:', bill.tong_tien);

    if (bill.ly_do_huy) {
      console.log('Lý do hủy:', bill.ly_do_huy);
      console.log('Người hủy:', bill.nguoi_huy);
    }

    console.log('\n📋 DANH SÁCH SẢN PHẨM:');
    bill.danh_sach_san_pham.forEach((item, index) => {
      console.log(`${index + 1}. ${item.ten_san_pham} - Màu: ${item.mau_sac} - Size: ${item.kich_thuoc} - SL: ${item.so_luong}`);
    });

    console.log('\n📍 THÔNG TIN GIAO HÀNG:');
    console.log('Địa chỉ:', bill.dia_chi_giao_hang);
    console.log('Phí vận chuyển:', bill.phi_van_chuyen);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Đã ngắt kết nối database');
  }
}

// Lấy orderId từ command line argument
const orderId = process.argv[2];
if (!orderId) {
  console.log('❌ Vui lòng cung cấp Order ID hoặc Bill ID');
  console.log('Cách sử dụng: node debug_bill_status.js <orderId>');
  console.log('Ví dụ: node debug_bill_status.js 1754223445988');
  process.exit(1);
}

// Chạy debug
debugBillStatus(orderId);
