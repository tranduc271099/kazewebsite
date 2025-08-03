const crypto = require('crypto');
const BillUser = require('../models/Bill/BillUser');
const Product = require('../models/Product');

const handleVnpayReturn = async (req, res) => {
  console.log('=== VNPay Return Processing Started ===');
  console.log('Timestamp:', new Date().toISOString());
  const startTime = Date.now();

  try {
    const vnpayParams = req.query;
    console.log('VNPay params received:', JSON.stringify(vnpayParams, null, 2));

    // Validate required parameters
    if (!vnpayParams.vnp_SecureHash) {
      console.log('❌ Missing vnp_SecureHash');
      return res.redirect('http://localhost:3000/payment-status.html?status=error&message=Missing security hash&code=INVALID_HASH');
    }

    if (!vnpayParams.vnp_TxnRef) {
      console.log('❌ Missing vnp_TxnRef');
      return res.redirect('http://localhost:3000/payment-status.html?status=error&message=Missing transaction reference&code=INVALID_TXN');
    }

    // Lấy secure hash và xóa khỏi params để verify
    const secureHash = vnpayParams['vnp_SecureHash'];
    delete vnpayParams['vnp_SecureHash'];
    delete vnpayParams['vnp_SecureHashType'];

    // Sắp xếp params theo alphabet
    const sortedParams = {};
    Object.keys(vnpayParams).sort().forEach(key => {
      sortedParams[key] = vnpayParams[key];
    });

    // Tạo query string để verify hash (không encode cho VNPay)
    const queryString = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    // Verify hash với secret key
    const vnpaySecretKey = process.env.VNPAY_SECRET_KEY || 'LUFYH26JEP2XVNOQBASL3B42NEPARQP9';
    const calculatedHash = crypto
      .createHmac('sha512', vnpaySecretKey)
      .update(queryString)
      .digest('hex');

    console.log('Hash verification:', {
      received: secureHash,
      calculated: calculatedHash,
      isValid: secureHash === calculatedHash
    });

    // Kiểm tra hash có hợp lệ không
    if (secureHash !== calculatedHash) {
      console.log('❌ Invalid VNPay hash signature');
      return res.redirect('http://localhost:3000/payment-status.html?status=error&message=Invalid signature&code=INVALID_SIGNATURE');
    }

    // Extract payment info
    const responseCode = vnpayParams.vnp_ResponseCode;
    const transactionNo = vnpayParams.vnp_TransactionNo;
    const orderInfo = vnpayParams.vnp_OrderInfo;
    const amount = vnpayParams.vnp_Amount;
    const bankCode = vnpayParams.vnp_BankCode;
    const payDate = vnpayParams.vnp_PayDate;

    console.log('Payment info:', {
      responseCode,
      transactionNo,
      orderInfo,
      amount,
      bankCode,
      payDate
    });

    if (responseCode === '00') {
      console.log('✅ Payment successful, processing order update');

      // Tìm order từ vnp_TxnRef (orderId)
      const orderId = vnpayParams.vnp_TxnRef;
      console.log('Searching for bill with orderId:', orderId);

      // Tìm bill trong database với timeout - chỉ tìm theo orderId string
      const findBillPromise = BillUser.findOne({
        orderId: orderId.toString()
      }).populate('danh_sach_san_pham.san_pham_id');

      const bill = await Promise.race([
        findBillPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]);

      if (!bill) {
        console.log('❌ Bill not found for orderId:', orderId);
        console.log('Trying to find all bills with similar orderId...');

        // Thử tìm tất cả bills để debug
        const allBills = await BillUser.find({}).select('orderId _id').limit(10);
        console.log('Recent bills in database:', allBills.map(b => ({ id: b._id, orderId: b.orderId })));

        return res.redirect('http://localhost:3000/payment-status.html?status=error&message=Order not found&code=ORDER_NOT_FOUND');
      }

      console.log('✅ Bill found:', bill._id);

      // Cập nhật trạng thái thanh toán
      const updateBillPromise = BillUser.findByIdAndUpdate(
        bill._id,
        {
          thanh_toan: 'đã thanh toán',
          vnpay_transaction_no: transactionNo,
          vnpay_response_code: responseCode,
          vnpay_bank_code: bankCode,
          vnpay_pay_date: payDate
        },
        { new: true }
      );

      const updatedBill = await Promise.race([
        updateBillPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Update bill timeout')), 3000)
        )
      ]);

      console.log('✅ Bill updated successfully');

      // Cập nhật stock song song (không chờ)
      if (bill.danh_sach_san_pham && bill.danh_sach_san_pham.length > 0) {
        console.log('📦 Starting stock updates...');

        const stockUpdatePromises = bill.danh_sach_san_pham.map(async (item) => {
          try {
            const product = await Product.findById(item.san_pham_id._id || item.san_pham_id);
            if (product) {
              // Tìm variant phù hợp
              if (product.variants && product.variants.length > 0) {
                const variant = product.variants.find(v =>
                  v.attributes.size === item.kich_thuoc && v.attributes.color === item.mau_sac
                );

                if (variant && variant.stock >= item.so_luong) {
                  variant.stock -= item.so_luong;
                  await product.save();
                  console.log(`✅ Stock updated for ${product.name} - ${item.kich_thuoc} ${item.mau_sac}`);
                } else {
                  console.log(`⚠️ Variant not found or insufficient stock for ${product.name}`);
                }
              } else {
                // Fallback to main product stock if no variants
                if (product.stock >= item.so_luong) {
                  product.stock -= item.so_luong;
                  await product.save();
                  console.log(`✅ Main stock updated for ${product.name}`);
                }
              }
            }
          } catch (error) {
            console.log(`❌ Stock update failed for item:`, error.message);
          }
        });

        // Chạy song song với timeout 2s
        Promise.race([
          Promise.all(stockUpdatePromises),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Stock update timeout')), 2000)
          )
        ]).then(() => {
          console.log('✅ All stock updates completed');
        }).catch(error => {
          console.log('⚠️ Stock update timeout, but payment processed:', error.message);
        });
      }

      const endTime = Date.now();
      console.log(`=== VNPay Return Processing Completed in ${endTime - startTime}ms ===`);

      // Redirect đến trang trạng thái thanh toán thành công
      const redirectUrl = `http://localhost:3000/payment-status.html?status=success&orderId=${bill.orderId}&paymentMethod=VNPAY&transactionNo=${transactionNo}&amount=${amount}`;
      console.log('Redirecting to payment status page:', redirectUrl);
      return res.redirect(redirectUrl);

    } else {
      console.log('❌ Payment failed with response code:', responseCode);

      // Các mã lỗi phổ biến từ VNPay
      let errorMessage = 'Payment failed';
      switch (responseCode) {
        case '24':
          errorMessage = 'Customer cancelled transaction';
          break;
        case '09':
          errorMessage = 'Transaction not found';
          break;
        case '10':
          errorMessage = 'Invalid card information';
          break;
        case '11':
          errorMessage = 'Card expired';
          break;
        case '12':
          errorMessage = 'Card blocked';
          break;
        case '13':
          errorMessage = 'Wrong OTP';
          break;
        case '51':
          errorMessage = 'Insufficient balance';
          break;
        default:
          errorMessage = `Payment failed with code: ${responseCode}`;
      }

      console.log('Payment failure details:', {
        responseCode,
        transactionNo,
        orderId: vnpayParams.vnp_TxnRef,
        errorMessage
      });

      // Redirect đến trang trạng thái thanh toán thất bại
      const redirectUrl = `http://localhost:3000/payment-status.html?status=error&message=${encodeURIComponent(errorMessage)}&code=${responseCode}&orderId=${vnpayParams.vnp_TxnRef}`;
      console.log('Redirecting to payment status page (error):', redirectUrl);
      return res.redirect(redirectUrl);
    }

  } catch (error) {
    const endTime = Date.now();
    console.log(`❌ VNPay Return Error after ${endTime - startTime}ms:`, error.message);
    console.error('Full error:', error);

    return res.redirect('http://localhost:3000/payment-status.html?status=error&message=Processing error&code=SYSTEM_ERROR');
  }
};

module.exports = {
  handleVnpayReturn
};
