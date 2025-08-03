const express = require('express');
const router = express.Router();
const stockCheckController = require('../controllers/stockCheck.controller');
const authenticateToken = require('../middleware/auth');

// Route để kiểm tra tồn kho trước khi thanh toán
router.post('/check-stock', authenticateToken, stockCheckController.checkStockAvailability);

module.exports = router;
