const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

module.exports = auth; 