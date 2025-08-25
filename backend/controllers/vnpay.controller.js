const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const vnpayConfig = require('../config/vnpay');

// Function tạo Payment URL
exports.createPaymentUrl = async (req, res) => {
  try {
    let { orderInfo, bankCode } = req.body;

    // Lấy IP chuẩn
    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      (req.socket && req.socket.remoteAddress) ||
      (req.connection.socket && req.connection.socket.remoteAddress);
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    }

    // Cấu hình VNPay
    const tmnCode = vnpayConfig.vnp_TmnCode;
    const secretKey = vnpayConfig.vnp_HashSecret;
    const vnpUrl = vnpayConfig.vnp_Url;
    const returnUrl = vnpayConfig.vnp_ReturnUrl;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    // Tạo orderId unique
    const orderId = req.body.orderId || moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 1000);

    let amount = req.body.amount || req.body.totalAmount;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Số tiền không hợp lệ"
      });
    }

    // TẠO ĐỚN HÀNG TRONG DATABASE TRƯỚC KHI TẠO VNPAY URL
    try {
      const BillUser = require('../models/Bill/BillUser');
      const Product = require('../models/Product');

      // Validate user ID
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found'
        });
      }

      // Xử lý danh sách sản phẩm
      const processedProducts = [];
      if (req.body.danh_sach_san_pham && req.body.danh_sach_san_pham.length > 0) {
        for (const item of req.body.danh_sach_san_pham) {
          const product = await Product.findById(item.id);
          if (product) {
            // Tìm variant hoặc lấy giá từ product
            let itemPrice = product.price;
            if (product.variants && product.variants.length > 0) {
              const variant = product.variants.find(v =>
                v.attributes.color === item.color && v.attributes.size === item.size
              );
              if (variant) {
                itemPrice = variant.price;
              }
            }

            processedProducts.push({
              san_pham_id: item.id,
              ten_san_pham: product.name,
              gia: itemPrice,
              so_luong: item.quantity,
              mau_sac: item.color || '',
              kich_thuoc: item.size || '',
              thanh_tien: itemPrice * item.quantity
            });
          }
        }
      }

      // Tạo bill mới
      const newBill = new BillUser({
        orderId: orderId,
        nguoi_dung_id: userId, // Sử dụng userId đã validate
  receiver_name: req.body.receiver_name || 'Khách hàng',
  receiver_phone: req.body.receiver_phone || '0000000000',
  receiver_email: req.body.receiver_email || 'customer@example.com',
        dia_chi_giao_hang: req.body.dia_chi_giao_hang || 'Địa chỉ mặc định',
        phuong_thuc_thanh_toan: 'VNPAY',
        trang_thai: 'chờ xác nhận', // BẮT ĐẦU TỪ CHỜ XÁC NHẬN
        thanh_toan: 'chưa thanh toán',
        ghi_chu: req.body.ghi_chu || '',
  phi_van_chuyen: 30000,
        giam_gia: Number(req.body.discount) || 0,
        voucher_id: req.body.voucher?._id || null,
        danh_sach_san_pham: processedProducts,
        tong_tien: Number(amount),
        ngay_tao: new Date(),
        ngay_cap_nhat: new Date()
      });

      await newBill.save();

      // TRỪ STOCK NGAY KHI TẠO ĐỚN HÀNG
      for (const item of processedProducts) {
        try {
          const updateResult = await Product.updateOne(
            {
              _id: item.san_pham_id,
              "variants": {
                $elemMatch: {
                  "attributes.color": item.mau_sac,
                  "attributes.size": item.kich_thuoc
                }
              }
            },
            {
              $inc: { "variants.$.stock": -item.so_luong }
            }
          );

          if (updateResult.modifiedCount === 0) {
            console.log('Variant not found, trying to update main product stock');
            const fallbackUpdateResult = await Product.updateOne(
              {
                _id: item.san_pham_id,
                $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }]
              },
              {
                $inc: { stock: -item.so_luong }
              }
            );
          }
        } catch (stockError) {
          console.error('Error reducing stock:', stockError);
        }
      }

      // GỬI EMAIL XÁC NHẬN ĐƠN HÀNG
      try {
        const emailService = require('../services/emailService');
        const emailData = {
          customerName: req.user?.name || 'Khách hàng',
          customerEmail: req.user?.email || 'customer@example.com',
          orderId: orderId,
          orderDate: new Date(),
          shippingAddress: req.body.dia_chi_giao_hang || 'Địa chỉ mặc định',
          paymentMethod: 'VNPay',
          products: processedProducts,
          subtotal: amount / 100,
          shippingFee: 30000,
          discount: Number(req.body.discount) || 0,
          totalAmount: amount / 100,
          voucher: req.body.voucher || null
        };

        await emailService.sendOrderConfirmation(emailData);
      } catch (emailError) {
        console.error('Lỗi gửi email xác nhận đơn hàng:', emailError);
      }

    } catch (billError) {
      console.error('Error creating bill:', billError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tạo đơn hàng: ' + billError.message
      });
    }

    // VALIDATE AMOUNT
    if (amount < 5000 || amount >= 1000000000) {
      return res.status(400).json({
        success: false,
        message: "Số tiền phải từ 5,000 đến dưới 1 tỷ đồng"
      });
    }

    orderInfo = orderInfo || req.body.orderDescription || `Thanh toan don hang ${orderId}`;

    // Sanitize orderInfo
    orderInfo = orderInfo.normalize('NFD').replace(/[̀-ͯ]/g, "").replace(/ /g, '+');

    let orderType = req.body.orderType || 'other';
    let locale = req.body.language || 'vn';
    const currCode = 'VND';

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: Math.round(Number(amount)) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

    console.log('VNPay params before sort:', vnp_Params);

    // Sắp xếp key A-Z
    const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

    console.log('Sorted params:', sortedParams);

    // Tạo signData
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

    console.log('Hash data:', hashData);

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(hashData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    console.log('Generated hash:', signed);

    // Tạo URL redirect
    const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: true });

    console.log('=== VNPay Payment URL Created ===');
    console.log('Order ID:', orderId);
    console.log('Amount:', amount);
    console.log('PaymentUrl:', paymentUrl);
    console.log('=====================================');

    res.json({
      success: true,
      paymentUrl: paymentUrl,
      orderId: orderId
    });

  } catch (error) {
    console.error('❌ VNPay Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo thanh toán VNPay: ' + error.message
    });
  }
};

// Function xử lý VNPay Return
exports.handleVnpayReturn = async (vnp_Params) => {
  try {
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa hash và hashType khỏi params để verify
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params theo alphabet
    const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
      result[key] = vnp_Params[key];
      return result;
    }, {});

    // Tạo signData theo CÙNG CÁCH với createPaymentUrl
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

    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(hashData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const transactionNo = vnp_Params['vnp_TransactionNo'];
  const amount = vnp_Params['vnp_Amount'] ? Number(vnp_Params['vnp_Amount']) / 100 : 0;

      if (responseCode === '00') {
        // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG TRONG DATABASE
        try {
          const BillUser = require('../models/Bill/BillUser');

          const updatedBill = await BillUser.findOneAndUpdate(
            { orderId: orderId },
            {
              trang_thai: 'chờ xác nhận', // GIỮ NGUYÊN chờ xác nhận để admin xử lý
              thanh_toan: 'đã thanh toán',
              ma_giao_dich_vnpay: transactionNo,
              ngay_thanh_toan: new Date(),
              ngay_cap_nhat: new Date()
            },
            { new: true }
          );

          if (updatedBill) {
            // STOCK ĐÃ ĐƯỢC TRỪ KHI TẠO ĐƠN HÀNG - KHÔNG CẦN TRỪ LẠI

            // GỬI EMAIL THÔNG BÁO THANH TOÁN THÀNH CÔNG
            try {
              const emailService = require('../services/emailService');
              const User = require('../models/User');

              // Lấy thông tin user từ database
              const user = await User.findById(updatedBill.nguoi_dung_id);

              if (user && user.email) {
                const emailData = {
                  customerName: user.name || 'Khách hàng',
                  customerEmail: user.email,
                  orderId: orderId,
                  transactionNo: transactionNo,
                  paymentAmount: updatedBill.tong_tien,
                  paymentDate: new Date(),
                  orderStatus: 'chờ xác nhận'
                };

                // Gửi email thông báo thanh toán thành công
                await emailService.sendPaymentSuccess(emailData);
              }
            } catch (emailError) {
              console.error('Lỗi gửi email thông báo thanh toán:', emailError);
            }

            // XÓA GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
            try {
              const Cart = require('../models/Cart');
              await Cart.findOneAndDelete({ user: updatedBill.nguoi_dung_id });
              console.log('✅ Cart cleared successfully for user:', updatedBill.nguoi_dung_id);
            } catch (cartError) {
              console.error('Error clearing cart:', cartError);
            }

          } else {
            console.log('⚠️ Bill not found for orderId:', orderId);
          }

        } catch (updateError) {
          console.error('❌ Error updating bill:', updateError);
        }

        return {
          status: 200,
          data: {
            orderId: orderId,
            transactionNo: transactionNo,
            amount: amount,
            message: 'Thanh toán thành công'
          }
        };
      } else {
        console.log('❌ Payment failed for order:', orderId, 'Response code:', responseCode);

        const errorMessages = {
          '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
          '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
          '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
          '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
          '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
          '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
          '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
          '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
          '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
          '75': 'Ngân hàng thanh toán đang bảo trì.',
          '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
          '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
        };

        return {
          status: 400,
          data: {
            orderId: orderId,
            responseCode: responseCode,
            message: errorMessages[responseCode] || 'Giao dịch thất bại'
          }
        };
      }
    } else {
      console.log('❌ Invalid signature');
      return {
        status: 400,
        data: {
          orderId: vnp_Params['vnp_TxnRef'] || 'Unknown',
          message: 'Chữ ký không hợp lệ'
        }
      };
    }
  } catch (error) {
    console.error('❌ VNPay Return Error:', error);
    return {
      status: 500,
      data: {
        message: 'Lỗi xử lý kết quả thanh toán: ' + error.message
      }
    };
  }
};