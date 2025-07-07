const express = require('express');
const router = express.Router();
const { 
  createVNPayQRCode, 
  vnpayReturn, 
  getVNPayConfig,
  getPaymentStatus,
  ipnCallback
} = require('../controllers/vnpay.controller.js');

// Tạo QR code VNPAY
router.post('/create-qrcode', createVNPayQRCode);

// Callback từ VNPAY
router.get('/return', vnpayReturn);

// Lấy cấu hình VNPAY
router.get('/config', getVNPayConfig);

router.get('/status/:orderId', getPaymentStatus);

router.get('/ipn', ipnCallback);

module.exports = router; 