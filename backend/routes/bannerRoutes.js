const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bannerController = require('../controllers/bannerController'); // Import controller

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/banners/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Tạo banner mới (upload file)
router.post('/', upload.single('image'), bannerController.createBanner);

// Lấy tất cả banners
router.get('/', bannerController.getAllBanners);

// Lấy banners đang hoạt động
router.get('/active', bannerController.getActiveBanners);

// Xóa banner
router.delete('/:id', bannerController.deleteBanner);

// Cập nhật trạng thái hoặc ảnh banner
router.put('/:id', upload.single('image'), bannerController.updateBanner);

module.exports = router; 