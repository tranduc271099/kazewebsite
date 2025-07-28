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
            attributes: { type: Object, required: true },
            stock: Number,
            price: Number,
            costPrice: Number, // Thêm giá nhập cho variant
            images: [String]
        }
    ],
    images: [String],
    price: Number,
    costPrice: Number, // Thêm giá nhập chính
    stock: Number,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);