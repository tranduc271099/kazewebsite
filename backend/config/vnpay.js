module.exports = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "16EMRWXG",
  vnp_HashSecret: process.env.VNPAY_SECRET_KEY || "LUFYH26JEP2XVNOQBASL3B42NEPARQP9",
  vnp_Url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:5000/api/payment/vnpay_return",
};