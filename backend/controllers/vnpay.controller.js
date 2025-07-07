const crypto = require('crypto');
const qs = require('qs');
const axios = require('axios');
const Bill = require('../models/Bill/BillUser');

// VNPAY Sandbox Configuration
const VNPAY_CONFIG = {
  VNP_TMN_CODE: "2RDFGTDQ",
  VNP_HASH_SECRET: "DFFAUFZZRDGL52U23YXWVYPXEUS4VV2D",
  VNP_URL: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  // ⚠️ THAY ĐỔI URL NGROK THỰC TẾ CỦA BẠN VÀO ĐÂY
  VNP_RETURN_URL:
    "https://5c60-2402-800-6d3e-b7ed-34c1-96ba-f86b-58f1.ngrok-free.app/api/vnpay/return",
};

// Tạo URL thanh toán VNPAY
const createPaymentUrl = (orderId, amount, orderInfo) => {
  const date = new Date();
  const pad = (n) => n < 10 ? '0' + n : n;
  const createDate =
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds());

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_CONFIG.VNP_TMN_CODE,
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: VNPAY_CONFIG.VNP_RETURN_URL,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate
  };

  // Sắp xếp tham số theo thứ tự alphabet
  vnp_Params = Object.keys(vnp_Params).sort().reduce((acc, key) => {
    acc[key] = vnp_Params[key];
    return acc;
  }, {});

  // Tạo chuỗi ký
  const signData = Object.entries(vnp_Params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.VNP_HASH_SECRET);
  const signed = hmac.update(signData, 'utf-8').digest('hex');
  vnp_Params.vnp_SecureHash = signed;

  // Tạo URL
  const vnpUrl = VNPAY_CONFIG.VNP_URL + '?' +
    Object.entries(vnp_Params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  console.log("Redirecting to VNPay:", vnpUrl);
  return vnpUrl;
};

// Sắp xếp object theo thứ tự alphabet
const sortObject = (obj) => {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (const key of str) {
    sorted[key] = obj[key];
  }
  return sorted;
};

// Tạo QR code và link redirect cho VNPAY
const createVNPayQRCode = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
    if (!orderId || !amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: orderId, amount, orderInfo'
      });
    }
    // Tạo URL thanh toán VNPAY
    const paymentUrl = createPaymentUrl(orderId, amount, orderInfo);
    // Tạo QR code từ URL thanh toán
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`;
    res.json({
      success: true,
      message: 'Tạo QR code và link redirect VNPAY thành công',
      data: {
        paymentUrl, // Dùng cho redirect
        qrCodeUrl,  // Dùng cho quét QR
        orderId,
        amount,
        orderInfo
      }
    });
  } catch (error) {
    console.error('Lỗi tạo QR code VNPAY:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo QR code VNPAY',
      error: error.message
    });
  }
};

// Xử lý callback từ VNPAY
const vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];
    const sortedParams = sortObject(vnpParams);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.VNP_HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    if (secureHash === signed) {
      const orderId = vnpParams['vnp_TxnRef'];
      const rspCode = vnpParams['vnp_ResponseCode'];
      const amount = vnpParams['vnp_Amount'];
      // Tìm đơn hàng theo orderId
      const bill = await Bill.findOne({ orderId });
      if (bill) {
        if (rspCode === '00') {
          bill.paymentStatus = 'paid';
        } else {
          bill.paymentStatus = 'failed';
        }
        await bill.save();
      }
      // Redirect về trang kết quả frontend
      return res.redirect(`/payment-result?orderId=${orderId}&vnp_ResponseCode=${rspCode}`);
    } else {
      res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi xử lý callback VNPAY:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xử lý callback VNPAY', error: error.message });
  }
};

// Lấy thông tin cấu hình VNPAY
const getVNPayConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        tmnCode: VNPAY_CONFIG.VNP_TMN_CODE,
        returnUrl: VNPAY_CONFIG.VNP_RETURN_URL,
        paymentUrl: VNPAY_CONFIG.VNP_URL
      }
    });
  } catch (error) {
    console.error('Lỗi lấy cấu hình VNPAY:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy cấu hình VNPAY',
      error: error.message
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const bill = await Bill.findOne({ orderId });
    if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json({ paymentStatus: bill.paymentStatus });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const ipnCallback = async (req, res) => {
  try {
    const params = { ...req.query };
    const secureHash = params['vnp_SecureHash'];
    delete params['vnp_SecureHash'];
    // Sắp xếp tham số
    const sorted = Object.keys(params).sort().reduce((r, k) => {
      r[k] = params[k];
      return r;
    }, {});
    const signData = Object.entries(sorted).map(([k, v]) => `${k}=${v}`).join('&');
    const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.VNP_HASH_SECRET).update(signData).digest('hex');
    if (hmac === secureHash) {
      if (params['vnp_ResponseCode'] === '00') {
        // Thành công → cập nhật đơn hàng
        const orderId = params['vnp_TxnRef'];
        const bill = await Bill.findOne({ orderId });
        if (bill) {
          bill.paymentStatus = 'paid';
          await bill.save();
        }
        return res.status(200).send('{"RspCode":"00","Message":"Confirm Success"}');
      }
      return res.status(200).send('{"RspCode":"00","Message":"Confirm Fail"}');
    } else {
      return res.status(400).send('{"RspCode":"97","Message":"Invalid signature"}');
    }
  } catch (error) {
    return res.status(500).send('{"RspCode":"99","Message":"Server error"}');
  }
};

module.exports = {
  createVNPayQRCode,
  vnpayReturn,
  getVNPayConfig,
  getPaymentStatus,
  ipnCallback
};
