const Category = require('../models/Category');
const Product = require('../models/Product');

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
        const { name } = req.body;

        // Check if category name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }

        const category = new Category({
            name
        });

        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo danh mục mới' });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

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
            { name, updatedAt: Date.now() },
            { new: true }
        );

        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem danh mục có tồn tại không
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        const productsInCategory = await Product.countDocuments({ category: id });
        if (productsInCategory > 0) {
            return res.status(400).json({
                message: 'Không thể xóa danh mục này vì có sản phẩm đang thuộc danh mục. Vui lòng xóa hoặc chuyển các sản phẩm sang danh mục khác trước.'
            });
        }

        await Category.findByIdAndDelete(id);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục' });
    }
}; 