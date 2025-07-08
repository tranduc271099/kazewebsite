const Order = require("../models/Bill/BillUser.js");
const Product = require("../models/Product.js");
const Cart = require("../models/Cart.js");
const crypto = require("crypto");
const dotenv = require("dotenv");
const qs = require("qs");
const vnpayConfig = require("../config/vnpay.js");

dotenv.config();

const { VNPAY_HASH_SECRET } = process.env;
const secretKey = vnpayConfig.vnp_HashSecret;

const handleVnpayReturn = async (vnpParams) => {
  // Tách vnp_SecureHash ra để kiểm tra
  const secureHash = vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  // Sắp xếp các tham số theo thứ tự alphabet
  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((result, key) => {
      result[key] = vnpParams[key];
      return result;
    }, {});

  // Tạo chuỗi ký để kiểm tra (mã hóa lại key và value trước khi nối chuỗi)
  let hashData = '';
  let i = 0;
  for (const key in sortedParams) {
    if (Object.hasOwnProperty.call(sortedParams, key)) {
      const value = sortedParams[key];
      if (i === 1) {
        hashData = hashData + '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value); // Mã hóa lại key và value
      } else {
        hashData = hashData + encodeURIComponent(key) + '=' + encodeURIComponent(value); // Mã hóa lại key và value
        i = 1;
      }
    }
  }

  const hmac = crypto.createHmac("sha512", secretKey);
  const calculatedHash = hmac.update(Buffer.from(hashData, 'utf-8')).digest("hex");

  // Log debug chi tiết
  console.log('--- VNPay RETURN/IPN DEBUG ---');
  console.log('Received vnpParams:', vnpParams); // Log raw received params
  console.log('Sorted params (after removing hash):', sortedParams); // Log sorted params
  console.log('signData (for verification):', hashData); // Log hashData string
  console.log('vnp_SecureHash (from VNPay):', secureHash);
  console.log('calculatedHash (your server):', calculatedHash);
  console.log('--------------------------------');

  // Kiểm tra tính toàn vẹn của dữ liệu
  if (calculatedHash !== secureHash) {
    return {
      status: 400,
      data: { message: "Dữ liệu không hợp lệ, chữ ký không khớp" },
    };
  }

  // Lấy mã đơn hàng từ vnp_TxnRef
  const orderId = vnpParams.vnp_TxnRef;

  // Tìm đơn hàng trong database bằng orderId (không phải _id)
  const order = await Order.findOne({ orderId });
  if (!order) {
    return {
      status: 404,
      data: { message: "Không tìm thấy đơn hàng" },
    };
  }

  // Kiểm tra trạng thái giao dịch từ VNPAY
  const transactionStatus = vnpParams.vnp_TransactionStatus;

  if (transactionStatus === "00") {
    // Thanh toán thành công
    order.thanh_toan = "đã thanh toán";
    order.trang_thai = "chờ xác nhận"; // hoặc trạng thái phù hợp

    // Bước 1: Trừ số lượng tồn kho (nếu cần)
    // (Có thể bỏ qua nếu đã trừ khi tạo đơn hàng)

    // Bước 2: Xóa giỏ hàng của user (nếu cần)
    // (Có thể bỏ qua nếu đã xóa khi tạo đơn hàng)

    await order.save();

    return {
      status: 200,
      data: {
        message: "Thanh toán thành công",
        orderId: order.orderId,
        transactionNo: vnpParams.vnp_TransactionNo,
      },
    };
  } else {
    // Thanh toán thất bại
    order.thanh_toan = "chưa thanh toán";
    await order.save();

    return {
      status: 400,
      data: {
        message: "Thanh toán thất bại",
        orderId: order.orderId,
        responseCode: vnpParams.vnp_ResponseCode,
      },
    };
  }
};

module.exports = { handleVnpayReturn };