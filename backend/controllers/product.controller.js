const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary');

const getPublicIdFromUrl = (url) => {
    try {
        // Example URL: http://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/public_id.jpg
        const parts = url.split('/');
        const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 2).join('/');
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        return publicId;
    } catch (e) {
        console.error('Không thể trích xuất public ID từ URL:', url, e);
        return null;
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const filter = {};
        const { search, category, activeOnly } = req.query;

        if (activeOnly === 'true') {
            filter.isActive = true;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa, chữ thường
        }

        if (category) {
            filter.category = category;
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

        // Validate dữ liệu đầu vào
        if (!name || !price || !stock || !category) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc: tên, giá, tồn kho, danh mục.' });
        }

        // Parse các trường phức tạp nếu là string (do FormData gửi lên)
        let attributes = req.body.attributes;
        let variants = req.body.variants;
        try {
            if (typeof attributes === 'string') {
                attributes = JSON.parse(attributes);
            }
        } catch (e) {
            attributes = {}; // Fallback to empty object
        }
        try {
            if (typeof variants === 'string') {
                variants = JSON.parse(variants);
            }
        } catch (e) {
            variants = []; // Fallback to empty array
        }

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

        // Check if product name already exists (case-insensitive)
        const existingProduct = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
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
            isActive,
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
        try {
            if (typeof attributes === 'string') attributes = JSON.parse(attributes);
        } catch (e) {
            attributes = {};
        }
        try {
            if (typeof variants === 'string') variants = JSON.parse(variants);
        } catch (e) {
            variants = [];
        }

        // Check if product exists before proceeding
        const productToUpdate = await Product.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Lấy URL ảnh hiện có từ body
        const existingMainImages = req.body.existingImages ? (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) : [];

        // So sánh ảnh cũ và mới để tìm ảnh cần xóa
        const oldMainImages = productToUpdate.images || [];
        const imagesToDelete = oldMainImages.filter(url => !existingMainImages.includes(url));

        // Lặp qua các biến thể để tìm ảnh cần xóa
        const oldVariants = productToUpdate.variants || [];
        const newVariants = Array.isArray(variants) ? variants : [];

        oldVariants.forEach(oldVariant => {
            const newVariantMatch = newVariants.find(nv =>
                nv.attributes.color === oldVariant.attributes.color &&
                nv.attributes.size === oldVariant.attributes.size
            );

            const oldVariantImages = oldVariant.images || [];
            if (newVariantMatch) {
                const newVariantExistingImages = newVariantMatch.images || [];
                const deletedImagesInVariant = oldVariantImages.filter(url => !newVariantExistingImages.includes(url));
                imagesToDelete.push(...deletedImagesInVariant);
            } else {
                // Nếu biến thể bị xóa, tất cả ảnh của nó cũng bị xóa
                imagesToDelete.push(...oldVariantImages);
            }
        });

        // Xóa ảnh khỏi Cloudinary
        if (imagesToDelete.length > 0) {
            const publicIdsToDelete = imagesToDelete.map(getPublicIdFromUrl).filter(id => id);
            if (publicIdsToDelete.length > 0) {
                await Promise.all(publicIdsToDelete.map(publicId => cloudinary.uploader.destroy(publicId)));
            }
        }

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

        // Check if category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: 'Danh mục không tồn tại' });
            }
        }

        // Check if new name already exists (excluding current product, case-insensitive)
        if (name && name.toLowerCase() !== productToUpdate.name.toLowerCase()) {
            const existingProduct = await Product.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id }
            });
            if (existingProduct) {
                return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
            }
        }

        // Create new slug if name is changed
        const slug = name ? slugify(name, { lower: true }) : productToUpdate.slug;

        const updateData = {
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
        };

        if (name === productToUpdate.name) {
            delete updateData.slug;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('category', 'name');

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.find({ category: categoryId });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy sản phẩm theo danh mục' });
    }
};