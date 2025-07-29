const Banner = require('../models/Banner');
const { notifyClientDataUpdate, EVENT_TYPES } = require('../utils/realTimeNotifier');


const createBanner = async (req, res) => {
    try {
        const { title, isActive } = req.body; // Lấy title và isActive từ req.body
        let imageUrl = '';

        if (req.file) {
            imageUrl = '/uploads/banners/' + req.file.filename;
        } else {
            // Nếu không có file mới, có thể lấy imageUrl từ body (nếu có để tạo banner từ URL)
            // Hoặc xử lý lỗi nếu không có cả file và imageUrl.
            return res.status(400).json({ message: 'Vui lòng tải lên ảnh banner' });
        }

        const banner = new Banner({
            title,
            imageUrl,
            isActive: isActive === 'true' || isActive === true // Đảm bảo isActive là boolean
        });
        const createdBanner = await banner.save();

        // Notify clients about new banner creation
        notifyClientDataUpdate(req, EVENT_TYPES.BANNER_CREATED, {
            bannerId: createdBanner._id,
            bannerTitle: createdBanner.title,
            bannerImage: createdBanner.imageUrl,
            isActive: createdBanner.isActive
        });

        res.status(201).json(createdBanner);
    } catch (error) {
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
        const { title, isActive } = req.body; // Lấy title và isActive từ req.body
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            if (req.file) {
                banner.imageUrl = '/uploads/banners/' + req.file.filename; // Cập nhật ảnh nếu có file mới
            }
            // Cập nhật title và isActive
            if (title !== undefined) banner.title = title;
            if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;

            const updatedBanner = await banner.save();

            // Notify clients about banner update
            notifyClientDataUpdate(req, EVENT_TYPES.BANNER_UPDATED, {
                bannerId: updatedBanner._id,
                bannerTitle: updatedBanner.title,
                bannerImage: updatedBanner.imageUrl,
                isActive: updatedBanner.isActive,
                changes: Object.keys(req.body).filter(key => req.body[key] !== undefined)
            });

            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            // Store banner info before deletion for notification
            const bannerInfo = {
                bannerId: banner._id,
                bannerTitle: banner.title,
                bannerImage: banner.imageUrl
            };

            await banner.deleteOne(); // Đúng cú pháp Mongoose

            // Notify clients about banner deletion
            notifyClientDataUpdate(req, EVENT_TYPES.BANNER_DELETED, bannerInfo);

            res.json({ message: 'Banner removed' });
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
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