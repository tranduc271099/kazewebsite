const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minOrder: { type: Number, required: true },
  discountType: { type: String, enum: ['amount', 'percent'], required: true },
  discountValue: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema); 