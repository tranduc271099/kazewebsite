const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Add title field
    imageUrl: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false // Không bắt buộc để tương thích với dữ liệu cũ
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);