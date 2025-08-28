const jwt = require('jsonwebtoken');
const googleClient = require('../config/google');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailService');

// Cấu hình multer cho upload avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/avatars/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Tìm hoặc tạo user mới
        let user = await User.findOne({ email });

        if (!user) {
            // Tạo user mới nếu chưa tồn tại
            user = await User.create({
                email,
                name,
                // Tạo mật khẩu ngẫu nhiên cho user Google
                password: Math.random().toString(36).slice(-8),
                // Thêm các thông tin mặc định
                role: 'user',
                phone: '',
                address: ''
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                user: {
                    id: user._id,
                    role: user.role
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                picture,
                isLocked: user.isLocked // Đảm bảo trả về trạng thái khóa
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Đăng nhập thất bại',
            error: error.message
        });
    }
};

// Lấy thông tin profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng'
            });
        }

        res.json({
            success: true,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.image || ''
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Cập nhật thông tin profile
exports.updateProfile = [
    upload.single('avatar'),
    async (req, res) => {
        try {
            const { name, email, phone, address } = req.body;
            const userId = req.user.id;

            // Tìm user hiện tại
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }

            // Kiểm tra email trùng lặp (trừ email hiện tại)
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ email, _id: { $ne: userId } });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email đã được sử dụng bởi tài khoản khác'
                    });
                }
            }

            // Chuẩn bị dữ liệu cập nhật
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (phone !== undefined) updateData.phone = phone;
            if (address !== undefined) updateData.address = address;

            // Xử lý avatar nếu có upload
            if (req.file) {
                // Xóa avatar cũ nếu có
                if (user.image && fs.existsSync(user.image)) {
                    try {
                        fs.unlinkSync(user.image);
                    } catch (err) {
                        console.log('Không thể xóa avatar cũ:', err);
                    }
                }
                updateData.image = req.file.path;
            }

            // Cập nhật user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                user: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                },
                avatar: updatedUser.image ? `/${updatedUser.image}` : null
            });
        } catch (error) {
            // Xóa file đã upload nếu có lỗi
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }
];

// Quên mật khẩu - Gửi email reset password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng email không hợp lệ'
            });
        }

        // Tìm user với email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email không tồn tại trong hệ thống.'
            });
        }

        // Kiểm tra xem user có đang hoạt động không (nếu có trường isActive)
        if (user.isActive === false) {
            return res.json({
                success: true,
                message: 'Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu trong vài phút tới.'
            });
        }

        // Kiểm tra xem có token reset đang còn hiệu lực không (rate limiting)
        if (user.resetPasswordExpiry && user.resetPasswordExpiry > Date.now()) {
            const timeLeft = Math.ceil((user.resetPasswordExpiry - Date.now()) / (1000 * 60));
            return res.status(429).json({
                success: false,
                message: `Bạn đã yêu cầu đặt lại mật khẩu gần đây. Vui lòng chờ ${timeLeft} phút trước khi thử lại.`
            });
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Lưu token và thời gian hết hạn (15 phút)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Tạo reset URL
        const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;

        // Dữ liệu cho email
        const resetData = {
            userName: user.name,
            userEmail: user.email,
            resetLink: resetURL,
            expiryTime: 15
        };

        // Gửi email
        const emailResult = await emailService.sendPasswordReset(resetData);

        if (emailResult.success) {
            res.json({
                success: true,
                message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
                messageId: emailResult.messageId
            });
        } else {
            // Xóa token nếu gửi email thất bại
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Có lỗi khi gửi email. Vui lòng thử lại sau.',
                error: emailResult.error
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Reset mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Hash token để so sánh
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Tìm user với token và kiểm tra thời gian hết hạn
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Hash mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu và xóa reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Export upload middleware để sử dụng ở nơi khác nếu cần
exports.uploadAvatar = upload;