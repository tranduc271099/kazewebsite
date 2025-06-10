const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
});

// Thêm danh mục
router.post('/', async (req, res) => {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
});

// Sửa danh mục
router.put('/:id', async (req, res) => {
    const { name } = req.body;
    const updated = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(updated);
});

// Xoá danh mục
router.delete('/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá' });
});

module.exports = router;
