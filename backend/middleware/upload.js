const multer = require('multer');
const path = require('path');

// Cấu hình memoryStorage để xử lý file trong bộ nhớ
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh!'));
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // Giới hạn 10MB
});

const uploadMultiple = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'variantImages', maxCount: 50 }
]);

// Middleware upload riêng cho banner
const uploadBanner = upload.single('image');

module.exports = { upload, uploadMultiple, uploadBanner };
