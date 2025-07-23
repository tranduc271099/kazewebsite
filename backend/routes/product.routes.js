const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const { upload, uploadMultiple } = require('../middleware/upload');


// Get all products
router.get('/', productController.getProducts);

// Get products by categoryId
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get product by ID
router.get('/:id', productController.getProductById);



// Create a new product (requires auth)
router.post('/', auth, uploadMultiple, productController.createProduct);

// Update a product (requires auth)
router.put('/:id', auth, uploadMultiple, productController.updateProduct);

module.exports = router; 