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

// Upload variant images
router.post('/upload', auth, upload.array('images'), async (req, res) => {
    try {
        const cloudinary = require('../config/cloudinary');
        const urls = await Promise.all(req.files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                });
                stream.end(file.buffer);
            });
        }));
        res.json({ urls });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi upload ảnh lên Cloudinary' });
    }
});

module.exports = router; 