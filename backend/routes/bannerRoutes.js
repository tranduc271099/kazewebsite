const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { uploadBanner } = require('../middleware/upload'); // Import middleware upload

// Tạo banner mới (upload file)
router.post('/', uploadBanner, bannerController.createBanner);

// Lấy tất cả banners
router.get('/', bannerController.getAllBanners);

// Lấy banners đang hoạt động
router.get('/active', bannerController.getActiveBanners);

// Xóa banner
router.delete('/:id', bannerController.deleteBanner);

// Cập nhật trạng thái hoặc ảnh banner
router.put('/:id', uploadBanner, bannerController.updateBanner);

module.exports = router; 