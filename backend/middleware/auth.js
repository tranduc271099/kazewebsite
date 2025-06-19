const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy user từ DB để kiểm tra trạng thái khóa
        const user = await User.findById(decoded.user.id);
        if (!user) {
            return res.status(401).json({ message: 'Không tìm thấy người dùng' });
        }
        // Chỉ chặn user thường bị khóa, admin không bị chặn
        if (user.isLocked && user.role === 'user') {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
        }

        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

module.exports = auth; 