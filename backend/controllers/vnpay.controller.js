const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const vnpayConfig = require('../config/vnpay');
const BillUser = require('../models/Bill/BillUser');
const Product = require('../models/Product');

exports.createPaymentUrl = async (req, res) => {
  try {
    let orderId;

    // Nếu có dữ liệu bill (đặt hàng mới), tạo bill trước
    if (req.body.nguoi_dung_id && req.body.danh_sach_san_pham) {
      console.log('[VNPAY] Tạo đơn hàng mới với thanh toán VNPay...');

      // Tạo orderId duy nhất
      orderId = Date.now().toString();

      // Giảm stock sản phẩm trước
      for (const item of req.body.danh_sach_san_pham) {
        console.log(`[ADD BILL] Reducing stock for product ${item.san_pham_id}, color: ${item.mau_sac}, size: ${item.kich_thuoc}, quantity: ${item.so_luong}`);

        const product = await Product.findById(item.san_pham_id);
        if (!product) continue;

        // Tìm variant phù hợp
        if (product.hasVariants && product.variants) {
          let variant = product.variants.find(v =>
            v.attributes.color === item.mau_sac && v.attributes.size === item.kich_thuoc
          );

          if (variant && variant.stock >= item.so_luong) {
            variant.stock -= item.so_luong;
            await product.save();
            console.log(`[ADD BILL] Successfully reduced variant stock for product ${item.san_pham_id}`);
          }
        }
      }

      // Tạo đơn hàng
      const newBill = new BillUser({
        ...req.body,
        orderId,
        phuong_thuc_thanh_toan: 'VNPAY',
        thanh_toan: 'chưa thanh toán',
        trang_thai: 'chờ xác nhận'
      });

      await newBill.save();
      console.log('[VNPAY] Đã tạo đơn hàng thành công, orderId:', orderId);
    } else {
      // Trường hợp tiếp tục thanh toán (có orderId từ trước)
      orderId = req.body.orderId;

      // Kiểm tra và xử lý orderId
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        orderId = Date.now().toString();
        console.log('[VNPAY] orderId không hợp lệ, tạo mới:', orderId);
      } else {
        console.log('[VNPAY] Tiếp tục thanh toán cho đơn hàng:', orderId);
      }
    }

    // Đảm bảo orderId luôn có giá trị hợp lệ
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      orderId = Date.now().toString();
      console.log('[VNPAY] Tạo orderId mặc định cuối cùng:', orderId);
    }
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

    let amount = req.body.amount;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }
    if (amount < 5000 || amount >= 1000000000) {
      return res.status(400).json({ message: "Số tiền phải từ 5,000 đến dưới 1 tỷ đồng" });
    }

    let bankCode = req.body.bankCode;
    let orderInfo = req.body.orderInfo || req.body.orderDescription;
    // Sanitize orderInfo: remove Vietnamese diacritics and replace spaces
    orderInfo = orderInfo.normalize('NFD').replace(/[̀-ͯ]/g, "").replace(/ /g, '+');
    let orderType = req.body.orderType;
    let locale = req.body.language || 'vn';
    const currCode = 'VND';

    // Log debug trước khi tạo vnp_Params
    console.log('[VNPAY DEBUG] Final orderId before vnp_TxnRef:', orderId);
    console.log('[VNPAY DEBUG] Type of orderId:', typeof orderId);
    console.log('[VNPAY DEBUG] orderId === undefined:', orderId === undefined);
    console.log('[VNPAY DEBUG] orderId === "undefined":', orderId === "undefined");

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

    // Log để debug (chỉ trong development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- VNPay CREATE PAYMENT URL ---');
      console.log('signData:', hashData);
      console.log('vnp_SecureHash:', signed);
      console.log('paymentUrl:', paymentUrl);
      console.log('--------------------------------');

      console.log('--- VNPay CREATE PAYMENT URL DEBUG ---');
      console.log('vnp_Params:', vnp_Params);
      console.log('sortedParams:', sortedParams);
      console.log('signData (before encoding):', hashData);
      console.log('vnp_SecureHash:', signed);
      console.log('paymentUrl:', paymentUrl);
      console.log('--------------------------------------');
    }

    // Trả về response ngay lập tức
    return res.status(200).json({
      success: true,
      paymentUrl,
      orderId,
      amount: Math.round(Number(amount)) * 100
    });

  } catch (error) {
    console.error('VNPay createPaymentUrl error:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tạo URL thanh toán VNPay",
      error: error.message
    });
  }
};