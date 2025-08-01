const Banner = require('../models/Banner');
const { notifyClientDataUpdate, EVENT_TYPES } = require('../utils/realTimeNotifier');
const cloudinary = require('../config/cloudinary');


const createBanner = async (req, res) => {
    try {
        console.log('=== CREATE BANNER DEBUG ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file ? 'File exists' : 'No file');

        const { title, isActive } = req.body;

        // Validate title
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tiêu đề banner là bắt buộc' });
        }

        let imageUrl = '';

        if (req.file) {
            console.log('Starting Cloudinary upload...');
            console.log('File details:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            // Upload ảnh lên Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'banners' // Tạo folder riêng cho banners
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            return reject(error);
                        }
                        console.log('Cloudinary upload success:', result.secure_url);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        } else {
            console.log('No file provided');
            return res.status(400).json({ message: 'Vui lòng tải lên ảnh banner' });
        }

        console.log('Creating banner with data:', { title, imageUrl, isActive });
        const banner = new Banner({
            title,
            imageUrl,
            isActive: isActive === 'true' || isActive === true
        });
        const createdBanner = await banner.save();
        console.log('Banner created successfully:', createdBanner._id);

        // Notify clients about new banner creation
        notifyClientDataUpdate(req, EVENT_TYPES.BANNER_CREATED, {
            bannerId: createdBanner._id,
            bannerTitle: createdBanner.title,
            bannerImage: createdBanner.imageUrl,
            isActive: createdBanner.isActive
        });

        res.status(201).json(createdBanner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find({});
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            res.json(banner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const { title, isActive } = req.body;
        let imageUrl = banner.imageUrl; // Giữ ảnh cũ nếu không có ảnh mới

        if (req.file) {
            // Xóa ảnh cũ trên Cloudinary nếu có
            if (banner.imageUrl && banner.imageUrl.includes('cloudinary.com')) {
                try {
                    // Lấy public_id từ URL Cloudinary
                    const publicIdMatch = banner.imageUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/);
                    if (publicIdMatch) {
                        const publicId = 'banners/' + publicIdMatch[1]; // Thêm folder prefix
                        await cloudinary.uploader.destroy(publicId);
                    }
                } catch (deleteError) {
                    console.error('Error deleting old image from Cloudinary:', deleteError);
                    // Tiếp tục upload ảnh mới dù xóa ảnh cũ thất bại
                }
            }

            // Upload ảnh mới lên Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'banners'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            imageUrl = uploadResult.secure_url;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            {
                title: title || banner.title,
                imageUrl,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : banner.isActive
            },
            { new: true }
        );

        // Notify clients about banner update
        notifyClientDataUpdate(req, EVENT_TYPES.BANNER_UPDATED, {
            bannerId: updatedBanner._id,
            bannerTitle: updatedBanner.title,
            bannerImage: updatedBanner.imageUrl,
            isActive: updatedBanner.isActive
        });

        res.json(updatedBanner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        // Xóa ảnh trên Cloudinary nếu có
        if (banner.imageUrl && banner.imageUrl.includes('cloudinary.com')) {
            try {
                // Lấy public_id từ URL Cloudinary
                const publicIdMatch = banner.imageUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp)$/);
                if (publicIdMatch) {
                    const publicId = 'banners/' + publicIdMatch[1]; // Thêm folder prefix
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Deleted image from Cloudinary:', publicId);
                }
            } catch (deleteError) {
                console.error('Error deleting image from Cloudinary:', deleteError);
                // Tiếp tục xóa banner dù xóa ảnh thất bại
            }
        }

        await Banner.findByIdAndDelete(req.params.id);

        // Notify clients about banner deletion
        notifyClientDataUpdate(req, EVENT_TYPES.BANNER_DELETED, {
            bannerId: req.params.id
        });

        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createBanner,
    getAllBanners,
    getActiveBanners,
    getBannerById,
    updateBanner,
    deleteBanner
}; 