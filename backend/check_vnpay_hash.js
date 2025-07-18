const crypto = require('crypto');

const secretKey = 'DFFAUFZZRDGL52U23YXWVYPXEUS4VV2D';
const signData = 'vnp_Amount=76999000&vnp_Command=pay&vnp_CreateDate=20250708020411&vnp_CurrCode=VND&vnp_IpAddr=::1&vnp_Locale=vn&vnp_OrderInfo=Thanh toan don hang cho Thành Nguyễn&vnp_OrderType=other&vnp_ReturnUrl=https://c41a-116-96-45-84.ngrok-free.app/vnpay_return&vnp_TmnCode=2RDFGTDQ&vnp_TxnRef=020411&vnp_Version=2.1.0';

const hmac = crypto.createHmac('sha512', secretKey);
const hash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

console.log('Hash:', hash); 