const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Đăng ký và đăng nhập
router.post('/register', register);
router.post('/login', login);

// Thông tin cá nhân
router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);

// Đổi mật khẩu
router.put('/change-password', auth, changePassword);

module.exports = router;