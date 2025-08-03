// Test endpoint để mô phỏng VNPay callback
const express = require('express');
const router = express.Router();
const vnpayReturnController = require('../controllers/vnpayReturn.controller');

// Test successful payment
router.get('/test-success', (req, res) => {
    const testParams = {
        vnp_Amount: '10000000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP14697394',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Thanh+toan+don+hang+cho+Code+BE+cho+man+ABC',
        vnp_PayDate: '20250803162500',
        vnp_ResponseCode: '00',
        vnp_TmnCode: '16EMRWXG',
        vnp_TransactionNo: '14697394',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: '1754213057340', // Test với orderId từ logs
        vnp_SecureHash: 'test_hash' // Sẽ được tính toán thực tế
    };

    // Mô phỏng request
    req.query = testParams;

    console.log('=== TESTING VNPAY RETURN ===');
    console.log('Test params:', testParams);

    vnpayReturnController.handleVnpayReturn(req, res);
});

// Test failed payment
router.get('/test-failed', (req, res) => {
    const testParams = {
        vnp_Amount: '10000000',
        vnp_BankCode: 'NCB',
        vnp_OrderInfo: 'Thanh+toan+don+hang+cho+Code+BE+cho+man+ABC',
        vnp_PayDate: '20250803162500',
        vnp_ResponseCode: '24', // Customer cancelled
        vnp_TmnCode: '16EMRWXG',
        vnp_TxnRef: '1754213057340',
        vnp_SecureHash: 'test_hash'
    };

    req.query = testParams;

    console.log('=== TESTING VNPAY FAILED RETURN ===');
    console.log('Test params:', testParams);

    vnpayReturnController.handleVnpayReturn(req, res);
});

module.exports = router;
