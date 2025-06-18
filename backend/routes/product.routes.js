const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products
router.get('/', productController.getProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create a new product (requires auth)
router.post('/', auth, upload.array('images'), productController.createProduct);

// Update a product (requires auth)
router.put('/:id', auth, upload.array('images'), productController.updateProduct);

// Delete a product (requires auth)
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router; 