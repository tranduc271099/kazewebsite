const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  nguoi_dung_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Địa chỉ giao hàng bao gồm cả thông tin người nhận
  dia_chi_giao_hang: {
    // Thông tin người nhận hàng
    ho_ten: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    so_dien_thoai: {
      type: String,
      required: true
    },
    // Địa chỉ chi tiết
    dia_chi_chi_tiet: {
      type: String,
      required: true
    },
    phuong_xa: {
      type: String,
      required: true
    },
    quan_huyen: {
      type: String,
      required: true
    },
    tinh_thanh: {
      type: String,
      required: true
    }
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
      'đã hủy',
      'hoàn trả'
    ],
    default: 'chờ xác nhận'
  },
  danh_sach_san_pham: [{
    san_pham_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    ten_san_pham: {
      type: String,
      required: true
    },
    so_luong: {
      type: Number,
      required: true
    },
    gia: {
      type: Number,
      required: true
    },
    mau_sac: {
      type: String,
      required: true
    },
    kich_thuoc: {
      type: String,
      required: true
    }
  }],
  shippingFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    default: null
  },
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  // Thêm các trường còn thiếu
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
  ly_do_huy: {
    type: String,
    default: ''
  },
  thanh_toan: {
    type: String,
    enum: ['đã thanh toán', 'chưa thanh toán'],
    default: 'chưa thanh toán'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  ngay_tao: {
    type: Date,
    default: Date.now
  },
  ngay_cap_nhat: {
    type: Date,
    default: Date.now
  },
  ngay_dat_hang: {
    type: Date,
    default: Date.now
  },
  ngay_giao_hang: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bill', billSchema);
