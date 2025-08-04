const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');
const auth = require('../middleware/auth');

// Route tạo payment URL - CẦN XÁC THỰC
router.post('/vnpay', auth, vnpayController.createPaymentUrl);

// Route xử lý return URL từ VNPay - DÙNG CÙNG 1 CONTROLLER
router.get('/vnpay_return', async (req, res) => {
    try {
        console.log('VNPay Return URL called:', req.query);

        // Dùng function từ vnpay.controller.js
        const result = await vnpayController.handleVnpayReturn(req.query);

        if (result.status === 200) {
            // Thanh toán thành công
            res.redirect(`http://localhost:3000/payment-result.html?status=success&orderId=${result.data.orderId}&transactionNo=${result.data.transactionNo || ''}&amount=${result.data.amount || ''}`);
        } else {
            // Thanh toán thất bại
            res.redirect(`http://localhost:3000/payment-result.html?status=failed&orderId=${result.data.orderId || ''}&responseCode=${result.data.responseCode || ''}&message=${encodeURIComponent(result.data.message || '')}`);
        }
    } catch (error) {
        console.error('VNPay Return Error:', error);
        res.redirect('http://localhost:3000/payment-result.html?status=error&message=' + encodeURIComponent('Lỗi hệ thống'));
    }
});

module.exports = router;