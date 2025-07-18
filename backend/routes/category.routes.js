const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Get all categories
router.get('/', categoryController.getCategories);

// Create a new category (requires auth)
router.post('/', auth, upload.single('image'), categoryController.createCategory);

// Update a category (requires auth)
router.put('/:id', auth, upload.single('image'), categoryController.updateCategory);

// Delete a category (requires auth)
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router; 