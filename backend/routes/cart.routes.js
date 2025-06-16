const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, cartController.getCart);

// Add item to cart or update quantity if exists
router.post('/', auth, cartController.addItemToCart);

// Update item quantity in cart
router.put('/', auth, cartController.updateCartItemQuantity);

// Update item attributes (color, size) in cart
router.put('/attributes', auth, cartController.updateCartItemAttributes);

// Remove item from cart
router.delete('/', auth, cartController.removeCartItem);

// Clear user's cart
router.delete('/clear', auth, cartController.clearCart);

module.exports = router; 