const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      variant: {
        color: String,
        size: String
      },
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  status: {
    type: String,
    enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Hoàn thành', 'Đã huỷ'],
    default: 'Chờ xác nhận'
  },
  paymentMethod: { type: String, enum: ['vnpay', 'momo', 'stripe', 'cod'], default: 'cod' },
  isPaid: { type: Boolean, default: false },
  paymentDate: Date,
  address: String,
  cancelReason: String,
  canceledBy: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
