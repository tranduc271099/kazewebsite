const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  brand: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  attributes: {
    sizes: [String],
    colors: [String]
  },
  variants: [
    {
      color: String,
      size: String,
      stock: Number,
      price: Number
    }
  ],
  images: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
