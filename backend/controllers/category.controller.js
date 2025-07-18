const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const productCount = await Product.countDocuments({ category: cat._id });
                // Đảm bảo rằng trường image có một URL hợp lệ, nếu không thì cung cấp một ảnh mặc định
                const imageUrl = cat.image || 'https://res.cloudinary.com/dkzwd3vvw/image/upload/v1717999238/products/default-image.jpg';
                return {
                    ...cat.toObject(),
                    productCount,
                    image: imageUrl
                };
            })
        );

        res.json(categoriesWithCount);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục' });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    console.log('Request body:', req.body); // Log req.body
    console.log('Request file:', req.file);   // Log req.file
    try {
        const { name } = req.body;
        let image = '';
        if (req.file) {
            console.log('Received file for upload:', req.file); // Log để kiểm tra file
            try {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'categories'
                });
                image = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary Upload Error:', uploadError); // Log lỗi từ Cloudinary
                return res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary', error: uploadError.message });
            }
        }
        const category = new Category({ name, image });
        await category.save();
        res.json(category);
    } catch (err) {
        console.error('Create Category Error:', err);
        res.status(500).json({ message: 'Lỗi tạo danh mục', error: err.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    console.log('Update request body:', req.body); // Log req.body
    console.log('Update request file:', req.file);   // Log req.file
    try {
        const { name } = req.body;
        let updateData = { name };
        if (req.file) {
            console.log('Received file for update:', req.file); // Log để kiểm tra file
            try {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'categories'
                });
                updateData.image = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary Upload Error on Update:', uploadError); // Log lỗi từ Cloudinary
                return res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary', error: uploadError.message });
            }
        }
        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(category);
    } catch (err) {
        console.error('Update Category Error:', err);
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