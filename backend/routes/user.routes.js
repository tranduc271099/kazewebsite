const express = require('express');
const router = express.Router();
const { getAllUsers, register, login, getProfile, updateProfile, changePassword, getUserHistory, getUserById, lockOrUnlockUser } = require('../controllers/user.controller');
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

// Lấy danh sách user
router.get('/', auth, getAllUsers);

// Lấy thông tin user bằng ID
router.get('/:userId', auth, getUserById);

// Lấy lịch sử chỉnh sửa user (chỉ admin)
router.get('/admin/users/:userId/history', auth, getUserHistory);

// Khóa/mở khóa user (chỉ admin)
router.put('/lock/:userId', auth, lockOrUnlockUser);

module.exports = router;