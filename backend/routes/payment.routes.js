const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');
const vnpayReturnController = require('../controllers/vnpayReturn.controller');
const auth = require('../middleware/auth'); // Import auth middleware

// Tối ưu endpoint VNPay với auth middleware
router.post('/vnpay', auth, vnpayController.createPaymentUrl);

// GET route cho VNPAY return URL (không cần auth vì VNPAY gọi trực tiếp)
router.get('/vnpay_return', async (req, res) => {
  // Set timeout thực sự cho response
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('VNPAY return timeout - redirecting to failure');
      res.redirect('http://localhost:3000/checkout?status=error&message=Timeout processing payment');
    }
  }, 8000); // 8 giây timeout

  try {
    console.log('--- VNPAY RETURN RECEIVED ---');
    console.log('Query params:', req.query);
    console.log('Processing time:', new Date().toISOString());

    // Controller sẽ tự redirect, không cần xử lý result
    await Promise.race([
      vnpayReturnController.handleVnpayReturn(req, res),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VNPay processing timeout')), 6000)
      )
    ]);

    clearTimeout(timeout);

  } catch (error) {
    clearTimeout(timeout);
    console.error('Error handling VNPAY return:', error);

    if (!res.headersSent) {
      res.redirect('http://localhost:3000/checkout?status=error&message=Processing error');
    }
  }
});

// POST route cho VNPAY callback (nếu cần)
router.post('/vnpay_return', async (req, res) => {
  // Set timeout thực sự cho response
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('VNPAY POST callback timeout - redirecting to failure');
      res.redirect('http://localhost:3000/checkout?status=error&message=Timeout processing payment');
    }
  }, 8000); // 8 giây timeout

  try {
    console.log('--- VNPAY POST CALLBACK RECEIVED ---');
    console.log('Body params:', req.body);

    // Controller sẽ tự redirect, không cần xử lý result
    await Promise.race([
      vnpayReturnController.handleVnpayReturn(req, res),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VNPay POST processing timeout')), 6000)
      )
    ]);

    clearTimeout(timeout);

  } catch (error) {
    clearTimeout(timeout);
    console.error('VNPAY callback error:', error);

    if (!res.headersSent) {
      res.redirect('http://localhost:3000/checkout?status=error&message=Processing error');
    }
  }
});

module.exports = router;