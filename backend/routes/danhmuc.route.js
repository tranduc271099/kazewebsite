const express = require('express');
const router = express.Router();
const DanhMuc = require('../models/DanhMuc');

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
    try {
        const data = await DanhMuc.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm danh mục
router.post('/', async (req, res) => {
    const { ten, moTa } = req.body;
    try {
        const item = new DanhMuc({ ten, moTa });
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Sửa danh mục
router.put('/:id', async (req, res) => {
    const { ten, moTa } = req.body;
    try {
        const item = await DanhMuc.findByIdAndUpdate(req.params.id, { ten, moTa }, { new: true });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xoá danh mục
router.delete('/:id', async (req, res) => {
    try {
        await DanhMuc.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xoá thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
