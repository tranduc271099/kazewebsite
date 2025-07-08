const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const vnpayConfig = require('../config/vnpay');

exports.createPaymentUrl = (req, res) => {
  // Lấy IP chuẩn
  let ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    (req.socket && req.socket.remoteAddress) ||
    (req.connection.socket && req.connection.socket.remoteAddress);
  if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
    ipAddr = '127.0.0.1';
  }

  // Cấu hình cứng (bạn có thể lấy từ biến môi trường nếu muốn)
  const tmnCode = vnpayConfig.vnp_TmnCode;
  const secretKey = vnpayConfig.vnp_HashSecret;
  const vnpUrl = vnpayConfig.vnp_Url;
  const returnUrl = vnpayConfig.vnp_ReturnUrl;

  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const orderId = req.body.orderId; // Lấy đúng orderId từ frontend truyền xuống

  let amount = req.body.amount;
  let bankCode = req.body.bankCode;
  let orderInfo = req.body.orderInfo || req.body.orderDescription;
  // Sanitize orderInfo: remove Vietnamese diacritics and replace spaces
  orderInfo = orderInfo.normalize('NFD').replace(/[̀-ͯ]/g, "").replace(/ /g, '+');
  let orderType = req.body.orderType;
  let locale = req.body.language || 'vn';
  const currCode = 'VND';

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId, // Đảm bảo đồng bộ với Bill
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: Math.round(Number(amount)) * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  };
  if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

  // Sắp xếp key A-Z
  const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
    result[key] = vnp_Params[key];
    return result;
  }, {});

  // Tạo signData (CÓ encode key và value trước khi nối chuỗi)
  let hashData = '';
  let i = 0;
  for (const key in sortedParams) {
    if (Object.hasOwnProperty.call(sortedParams, key)) {
      const value = sortedParams[key];
      if (i === 1) {
        hashData = hashData + '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
      } else {
        hashData = hashData + encodeURIComponent(key) + '=' + encodeURIComponent(value);
        i = 1;
      }
    }
  }

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(hashData, 'utf-8')).digest('hex');
  sortedParams['vnp_SecureHash'] = signed;

  // Tạo URL redirect (CÓ encode)
  const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: true });

  // Log để debug
  console.log('--- VNPay CREATE PAYMENT URL ---');
  console.log('signData:', hashData); // Changed signData to hashData
  console.log('vnp_SecureHash:', signed);
  console.log('paymentUrl:', paymentUrl);
  console.log('--------------------------------');

  // Log để debug chi tiết
  console.log('--- VNPay CREATE PAYMENT URL DEBUG ---');
  console.log('vnp_Params:', vnp_Params);
  console.log('sortedParams:', sortedParams);
  console.log('signData (before encoding):', hashData); // Changed signData to hashData
  console.log('vnp_SecureHash:', signed);
  console.log('paymentUrl:', paymentUrl);
  console.log('--------------------------------------');

  res.json({ paymentUrl });
};