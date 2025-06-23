const express = require('express');
const router = express.Router();
const { getAllUsers, lockUser, register, login, getProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Đăng ký và đăng nhập
router.post('/register', register);
router.post('/login', login);

// Thông tin cá nhân
router.get('/me', auth, getProfile);
router.put('/me', auth, upload.single('image'), updateProfile);

// Đổi mật khẩu
router.put('/change-password', auth, changePassword);

// Lấy danh sách user và khóa/mở khóa user
router.get('/', auth, getAllUsers);
router.put('/:id/lock', auth, lockUser);

module.exports = router;