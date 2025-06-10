const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      variant: {
        color: String,
        size: String
      },
      quantity: Number
    }
  ]
}, { timestamps: { updatedAt: true, createdAt: false } });

module.exports = mongoose.model('Cart', cartSchema);
