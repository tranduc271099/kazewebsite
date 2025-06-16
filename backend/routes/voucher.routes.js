const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const auth = require('../middleware/auth');

// Áp dụng middleware auth cho tất cả route
router.use(auth);

router.get('/', voucherController.getAllVouchers);
router.post('/', voucherController.createVoucher);
router.post('/apply', voucherController.applyVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router; 