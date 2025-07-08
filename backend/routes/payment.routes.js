const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');
const vnpayReturnController = require('../controllers/vnpayReturn.controller'); // Import the return controller

router.post('/vnpay', vnpayController.createPaymentUrl);

// Add GET route for VNPAY return URL
router.get('/vnpay_return', async (req, res) => {
  try {
    // VNPAY sends parameters in the query string for GET requests
    const result = await vnpayReturnController.handleVnpayReturn(req.query);

    // Redirect based on the payment result
    if (result.status === 200) {
      // Payment successful, redirect to a success page on frontend
      res.redirect('http://localhost:3000/payment-success?orderId=' + encodeURIComponent(result.data.orderId || '') + '&transactionNo=' + encodeURIComponent(result.data.transactionNo || ''));
    } else {
      // Payment failed, redirect to a failure page on frontend
      res.redirect('http://localhost:3000/payment-failure?orderId=' + encodeURIComponent(result.data.orderId || '') + '&responseCode=' + encodeURIComponent(result.data.responseCode || '') + '&message=' + encodeURIComponent(result.data.message || ''));
    }
  } catch (error) {
    console.error('Error handling VNPAY return:', error);
    // Redirect to a generic error page on frontend
    res.redirect('http://localhost:3000/payment-failure?message=Internal%20server%20error');
  }
});

// Bổ sung route POST cho VNPAY callback
router.post('/vnpay_return', async (req, res) => {
  try {
    const result = await vnpayReturnController.handleVnpayReturn(req.body);
    if (result.status === 200) {
      res.redirect('http://localhost:3000/payment-success?orderId=' + encodeURIComponent(result.data.orderId || '') + '&transactionNo=' + encodeURIComponent(result.data.transactionNo || ''));
    } else {
      res.redirect('http://localhost:3000/payment-failure?orderId=' + encodeURIComponent(result.data.orderId || '') + '&responseCode=' + encodeURIComponent(result.data.responseCode || '') + '&message=' + encodeURIComponent(result.data.message || ''));
    }
  } catch (error) {
    res.redirect('http://localhost:3000/payment-failure?message=Internal%20server%20error');
  }
});

module.exports = router;