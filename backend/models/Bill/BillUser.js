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
    enum: ['COD', 'MOMO', 'BANKING'], 
    default: 'COD'
  },
  ghi_chu: {
    type: String,
    default: ''
  },
  trang_thai: {
    type: String,
    enum: ['chờ xác nhận', 'đã xác nhận', 'đang giao', 'đã giao', 'đã hủy'],
    default: 'chờ xác nhận'
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
  ]
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
