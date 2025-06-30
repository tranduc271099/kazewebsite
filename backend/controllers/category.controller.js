const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        // Lấy tất cả danh mục
        const categories = await Category.find().sort({ createdAt: -1 });
        // Đếm số lượng sản phẩm cho từng danh mục
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            const productCount = await Product.countDocuments({ category: cat._id });
            return { ...cat.toObject(), productCount };
        }));
        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục' });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        let image = '';
        if (req.file && req.file.filename) {
            image = '/uploads/' + req.file.filename;
        }
        const category = new Category({ name, image });
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi tạo danh mục', error: err.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        let updateData = { name };
        if (req.file && req.file.filename) {
            updateData.image = '/uploads/' + req.file.filename;
        }
        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật danh mục', error: err.message });
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