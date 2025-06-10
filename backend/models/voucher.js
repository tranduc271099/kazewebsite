const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  type: { type: String, enum: ['percent', 'fixed'] },
  value: Number,
  minOrder: Number,
  maxUsage: Number,
  usedCount: { type: Number, default: 0 },
  validFrom: Date,
  validTo: Date
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Voucher', voucherSchema);
