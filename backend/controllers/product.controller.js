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

        // Xử lý ảnh chính (main images)
        const mainImageFiles = (req.files && req.files.images) || [];
        const mainImageUrls = await Promise.all(
            mainImageFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
            })
        );

        // Xử lý ảnh biến thể (variant images)
        const variantImageFiles = (req.files && req.files.variantImages) || [];
        const variantImageUrls = await Promise.all(
            variantImageFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
            })
        );

        // Gán ảnh biến thể vào đúng biến thể
        let currentVariantImageIndex = 0;
        if (Array.isArray(variants)) {
            variants.forEach(variant => {
                const imageCount = variant.newImageCount || 0;
                const newImagesForVariant = variantImageUrls.slice(currentVariantImageIndex, currentVariantImageIndex + imageCount);
                variant.images = [...(variant.images || []), ...newImagesForVariant];
                currentVariantImageIndex += imageCount;
            });
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
            images: mainImageUrls,
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

        // Lấy URL ảnh hiện có từ body
        const existingMainImages = req.body.existingImages ? (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) : [];

        // Xử lý ảnh chính mới (main images)
        const mainImageFiles = (req.files && req.files.images) || [];
        const newMainImageUrls = await Promise.all(
            mainImageFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
            })
        );
        const allMainImages = [...existingMainImages, ...newMainImageUrls];

        // Xử lý ảnh biến thể mới (variant images)
        const variantImageFiles = (req.files && req.files.variantImages) || [];
        const newVariantImageUrls = await Promise.all(
            variantImageFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    });
                    stream.end(file.buffer);
                });
            })
        );

        // Gán ảnh biến thể vào đúng biến thể
        let currentVariantImageIndex = 0;
        if (Array.isArray(variants)) {
            variants.forEach(variant => {
                const imageCount = variant.newImageCount || 0;
                const newImagesForVariant = newVariantImageUrls.slice(currentVariantImageIndex, currentVariantImageIndex + imageCount);
                // Giữ lại ảnh cũ và thêm ảnh mới
                variant.images = [...(variant.images || []), ...newImagesForVariant];
                currentVariantImageIndex += imageCount;
            });
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
                images: allMainImages,
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