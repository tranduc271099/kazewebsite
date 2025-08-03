const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

// Upload single image
router.post('/image', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('Upload image request received');
        console.log('User:', req.user?.id);
        console.log('File info:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');

        if (!req.file) {
            console.log('No file provided in request');
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
        }

        console.log('Starting Cloudinary upload...');

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: 'return_requests' // Tạo folder riêng cho return requests
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary', error: error.message });
                }
                console.log('Cloudinary upload successful:', result.secure_url);
                return res.json({ url: result.secure_url });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({ message: 'Lỗi server khi tải ảnh', error: error.message });
    }
});

// Upload multiple images
router.post('/images', auth, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất một file ảnh' });
        }

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'return_requests'
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        res.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Lỗi server khi tải ảnh' });
    }
});

module.exports = router;
