const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/google', authController.googleLogin);

// Profile routes - cần authentication
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 