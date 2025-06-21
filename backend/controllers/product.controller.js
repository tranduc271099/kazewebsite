const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.activeOnly === 'true') {
            filter.isActive = true;
        }
        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm' });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm' });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            brand,
            category,
            price,
            stock,
            isActive
        } = req.body;

        // Parse các trường phức tạp nếu là string (do FormData gửi lên)
        let attributes = req.body.attributes;
        let variants = req.body.variants;
        if (typeof attributes === 'string') attributes = JSON.parse(attributes);
        if (typeof variants === 'string') variants = JSON.parse(variants);

        // Chuyển đổi variants sang EAV nếu chưa đúng định dạng
        if (Array.isArray(variants) && variants.length > 0 && !variants[0].attributes) {
            variants = variants.map(v => ({
                attributes: {
                    size: v.size,
                    color: v.color
                },
                stock: v.stock,
                price: v.price
            }));
        }

        // Xử lý ảnh
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            // Upload từng ảnh lên Cloudinary
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error) throw error;
                    return result.secure_url;
                })
            );
            // Sử dụng Promise.all để đợi tất cả upload xong
            imagePaths = await Promise.all(req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
            }));
        } else if (req.body.images) {
            imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Danh mục không tồn tại' });
        }

        // Check if product name already exists
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
        }

        // Create slug from name
        const slug = slugify(name, { lower: true });

        const product = new Product({
            name,
            slug,
            description,
            brand,
            category,
            attributes,
            variants,
            images: imagePaths,
            price,
            stock,
            isActive
        });

        const savedProduct = await product.save();
        const populatedProduct = await Product.findById(savedProduct._id)
            .populate('category', 'name');

        res.status(201).json(populatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo sản phẩm mới' });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            brand,
            category,
            price,
            stock,
            isActive
        } = req.body;

        // Parse các trường phức tạp nếu là string (do FormData gửi lên)
        let attributes = req.body.attributes;
        let variants = req.body.variants;
        if (typeof attributes === 'string') attributes = JSON.parse(attributes);
        if (typeof variants === 'string') variants = JSON.parse(variants);

        // Chuyển đổi variants sang EAV nếu chưa đúng định dạng
        if (Array.isArray(variants) && variants.length > 0 && !variants[0].attributes) {
            variants = variants.map(v => ({
                attributes: {
                    size: v.size,
                    color: v.color
                },
                stock: v.stock,
                price: v.price
            }));
        }

        // Xử lý ảnh
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = await Promise.all(req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
            }));
        } else if (req.body.images) {
            imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Check if category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Danh mục không tồn tại' });
            }
        }

        // Check if new name already exists (excluding current product)
        if (name && name !== product.name) {
            const existingProduct = await Product.findOne({ name });
            if (existingProduct) {
                return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
            }
        }

        // Create new slug if name is changed
        const slug = name ? slugify(name, { lower: true }) : product.slug;

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                slug,
                description,
                brand,
                category,
                attributes,
                variants,
                images: imagePaths,
                price,
                stock,
                isActive
            },
            { new: true }
        ).populate('category', 'name');

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
    }
}; 