const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');

// Test endpoint để gửi email xác nhận đơn hàng
router.post('/test-order-confirmation', auth, async (req, res) => {
  try {
    const testOrderData = {
      customerName: req.user.name || 'Khách hàng test',
      customerEmail: req.user.email || 'test@example.com',
      orderId: 'TEST' + Date.now(),
      orderDate: new Date(),
      shippingAddress: '123 Đường Test, Quận Test, TP.HCM',
      paymentMethod: 'Thanh toán khi nhận hàng',
      products: [
        {
          san_pham_id: '123',
          ten_san_pham: 'Sản phẩm test 1',
          mau_sac: 'Đỏ',
          kich_thuoc: 'M',
          so_luong: 2,
          gia: 150000
        },
        {
          san_pham_id: '124',
          ten_san_pham: 'Sản phẩm test 2',
          mau_sac: 'Xanh',
          kich_thuoc: 'L',
          so_luong: 1,
          gia: 200000
        }
      ],
      subtotal: 500000,
      shippingFee: 30000,
      discount: 50000,
      totalAmount: 480000,
      voucher: {
        code: 'TESTCODE',
        name: 'Voucher test'
      }
    };

    const result = await emailService.sendOrderConfirmation(testOrderData);

    if (result.success) {
      res.json({
        message: 'Email test đã được gửi thành công',
        messageId: result.messageId,
        sentTo: testOrderData.customerEmail
      });
    } else {
      res.status(500).json({
        message: 'Lỗi khi gửi email test',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server khi test email',
      error: error.message
    });
  }
});

// Test endpoint để gửi email thông báo trạng thái
router.post('/test-status-update', auth, async (req, res) => {
  try {
    const { oldStatus = 'đang xử lý', newStatus = 'đã giao hàng' } = req.body;

    const testStatusData = {
      customerName: req.user.name || 'Khách hàng test',
      customerEmail: req.user.email || 'test@example.com',
      orderId: 'TEST' + Date.now(),
      oldStatus: oldStatus,
      newStatus: newStatus
    };

    const result = await emailService.sendOrderStatusUpdate(testStatusData);

    if (result.success) {
      res.json({
        message: 'Email thông báo trạng thái đã được gửi thành công',
        messageId: result.messageId,
        sentTo: testStatusData.customerEmail,
        statusChange: `${oldStatus} → ${newStatus}`
      });
    } else {
      res.status(500).json({
        message: 'Lỗi khi gửi email thông báo trạng thái',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server khi test email',
      error: error.message
    });
  }
});

module.exports = router;
