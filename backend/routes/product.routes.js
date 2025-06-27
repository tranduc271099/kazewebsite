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
router.post('/', auth, removeEmptyFiles, uploadMultiple, productController.createProduct);

// Delete a product (requires auth)
router.delete('/:id', auth, productController.deleteProduct);

// Update a product (requires auth)
router.put('/:id', auth, uploadMultiple, productController.updateProduct);

// Thêm middleware loại bỏ trường file rỗng
function removeEmptyFiles(req, res, next) {
    // Nếu không có file upload, bỏ qua
    if (!req.files && !req.body.images && !req.body.variantImages) return next();
    // Nếu có trường file nhưng rỗng, xóa nó đi
    if (req.body.images === '' || (Array.isArray(req.body.images) && req.body.images.length === 0)) {
        delete req.body.images;
    }
    if (req.body.variantImages === '' || (Array.isArray(req.body.variantImages) && req.body.variantImages.length === 0)) {
        delete req.body.variantImages;
    }
    next();
}

module.exports = router; 