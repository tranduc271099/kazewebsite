const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  nguoi_dung_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dia_chi_giao_hang: {
    type: String,
    required: true
  },
  tong_tien: {
    type: Number,
    required: true
  },
  phuong_thuc_thanh_toan: {
    type: String,
    enum: ['COD', 'MOMO', 'BANKING', 'VNPAY'], 
    default: 'COD'
  },
  ghi_chu: {
    type: String,
    default: ''
  },
  trang_thai: {
    type: String,
    enum: [
      'chờ xác nhận',
      'đã xác nhận',
      'đang giao hàng',
      'đã giao hàng',
      'đã nhận hàng',
      'hoàn thành',
      'đã hủy'
    ],
    default: 'chờ xác nhận'
  },
  thanh_toan: {
    type: String,
    enum: ['đã thanh toán', 'chưa thanh toán'],
    default: 'chưa thanh toán'
  },
  ly_do_huy: {
    type: String,
    default: ''
  },
  nguoi_huy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    loai: {
      type: String,
      enum: ['User', 'Admin']
    }
  },
  ngay_tao: {
    type: Date,
    default: Date.now
  },
  ngay_cap_nhat: {
    type: Date,
    default: Date.now
  },
  danh_sach_san_pham: [
    {
      san_pham_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      ten_san_pham: String,
      so_luong: Number,
      gia: Number,
      mau_sac: String,
      kich_thuoc: String,
    }
  ],
  shippingFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  voucher: {
    name: { type: String },
    discountType: { type: String },
    discountValue: { type: Number }
  },
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
});

const Bill = mongoose.model('order', billSchema);
module.exports = Bill;
