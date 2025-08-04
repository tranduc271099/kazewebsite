const crypto = require('crypto');
const qs = require('qs');
const vnpayConfig = require('../config/vnpay');

exports.handleVnpayReturn = async (vnp_Params) => {
    try {
        console.log('=== VNPay Return Handler START ===');
        console.log('VNPay params received:', vnp_Params);

        const secureHash = vnp_Params['vnp_SecureHash'];

        // Xóa hash và hashType khỏi params để verify
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp params theo alphabet
        const sortedParams = Object.keys(vnp_Params).sort().reduce((result, key) => {
            result[key] = vnp_Params[key];
            return result;
        }, {});

        console.log('Sorted params for verification:', sortedParams);

        // Tạo signData để verify
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        console.log('Expected hash:', signed);
        console.log('Received hash:', secureHash);

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const transactionNo = vnp_Params['vnp_TransactionNo'];
            const amount = vnp_Params['vnp_Amount'] / 100; // Chia 100 để về số tiền gốc

            console.log('✅ Hash verified successfully');
            console.log('Order ID:', orderId, 'Response Code:', responseCode);

            if (responseCode === '00') {
                console.log('✅ Payment successful for order:', orderId);

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
                orderId: 'Unknown',
                message: 'Lỗi xử lý kết quả thanh toán: ' + error.message
            }
        };
    }
};