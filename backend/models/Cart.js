const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    color: {
        type: String,
        required: false // Color might be optional for some products
    },
    size: {
        type: String,
        required: false // Size might be optional for some products
    },
    // Store current price at the time of adding to cart to handle price changes
    priceAtTimeOfAddition: {
        type: Number,
        required: true
    }
}, { _id: false }); // Do not create _id for subdocuments

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each user has only one cart
    },
    items: [
        CartItemSchema
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema); 