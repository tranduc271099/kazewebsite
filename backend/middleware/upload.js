const multer = require('multer');

// Use memory storage for multer so we can upload buffer to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh!'));
};

const upload = multer({ storage, fileFilter });

const uploadMultiple = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'variantImages', maxCount: 50 }
]);

module.exports = { upload, uploadMultiple };
