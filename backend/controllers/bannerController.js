const Banner = require('../models/Banner');


const createBanner = async (req, res) => {
    try {
        const { title, subtitle, imageUrl, link } = req.body;
        const banner = new Banner({
            title,
            subtitle,
            imageUrl,
            link
        });
        const createdBanner = await banner.save();
        res.status(201).json(createdBanner);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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
        const { title, subtitle, imageUrl, link, isActive } = req.body;
        const banner = await Banner.findById(req.params.id);

        if (banner) {
            banner.title = title;
            banner.subtitle = subtitle;
            banner.imageUrl = imageUrl;
            banner.link = link;
            banner.isActive = isActive;

            const updatedBanner = await banner.save();
            res.json(updatedBanner);
        } else {
            res.status(404).json({ message: 'Banner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (banner) {
            await banner.deleteOne(); // Đúng cú pháp Mongoose
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