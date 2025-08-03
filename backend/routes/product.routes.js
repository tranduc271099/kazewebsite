const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const { upload, uploadMultiple } = require('../middleware/upload');


// Get all products
router.get('/', productController.getProducts);

// Get profit statistics (requires auth)
router.get('/profit/statistics', auth, productController.getProfitStatistics);

// Temporary route to add sample ratings for testing
router.post('/test/add-sample-ratings', productController.addSampleRatings);

// Get products by categoryId
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get top selling products
router.get('/best-sellers', require('../controllers/bestSeller.controller').getTopSellingProducts);

// Get product by ID
router.get('/:id', productController.getProductById);



// Create a new product (requires auth)
router.post('/', auth, uploadMultiple, productController.createProduct);

// Update a product (requires auth)
router.put('/:id', auth, uploadMultiple, productController.updateProduct);

// Delete a product (requires auth)
router.delete('/:id', auth, productController.deleteProduct);

// Delete a product variant (requires auth)
router.delete('/:productId/variants/:variantId', auth, productController.deleteVariant);

// Debug route to check orders for a product
router.get('/:id/debug/orders', auth, productController.debugProductOrders);

module.exports = router; 