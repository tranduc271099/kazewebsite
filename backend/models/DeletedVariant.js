const mongoose = require('mongoose');

const deletedVariantSchema = new mongoose.Schema({
    originalProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    originalVariantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    variantData: {
        attributes: {
            color: String,
            size: String
        },
        price: Number,
        stock: Number,
        images: [String],
        sku: String
    },
    productName: String,
    deletedAt: {
        type: Date,
        default: Date.now
    },
    hadOrders: {
        type: Boolean,
        default: false
    },
    orderCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('DeletedVariant', deletedVariantSchema);
