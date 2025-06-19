const jwt = require('jsonwebtoken');
const googleClient = require('../config/google');
const User = require('../models/User');

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
                    email: user.email,
                    name: user.name,
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
                picture
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