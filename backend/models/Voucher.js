const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  minOrder: { type: Number, required: true },
  discountType: { type: String, enum: ['amount', 'percent'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number, default: null }, // Số tiền giảm tối đa (áp dụng cho loại phần trăm)
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  quantity: { type: Number, required: true, default: 1 }, // Total number of times the voucher can be used
  usedCount: { type: Number, default: 0 } // Number of times the voucher has been used
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema); 