const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/';
// Đảm bảo thư mục uploads tồn tại
fs.mkdirSync(uploadDir, { recursive: true });

// Cấu hình diskStorage để lưu file tạm
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh!'));
};

const upload = multer({ storage });

const uploadMultiple = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'variantImages', maxCount: 50 }
]);

module.exports = { upload, uploadMultiple };
