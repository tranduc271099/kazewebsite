const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục' });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if category name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }

        const category = new Category({
            name,
            description
        });

        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo danh mục mới' });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        // Check if new name already exists (excluding current category)
        if (name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description, updatedAt: Date.now() },
            { new: true }
        );

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        await Category.findByIdAndDelete(id);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục' });
    }
}; 