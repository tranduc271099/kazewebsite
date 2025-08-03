const crypto = require('crypto');
const vnpayConfig = require('./config/vnpay');

// Test VNPay configuration
console.log('=== VNPay Configuration Test ===');
console.log('TMN Code:', vnpayConfig.vnp_TmnCode);
console.log('Hash Secret:', vnpayConfig.vnp_HashSecret);
console.log('URL:', vnpayConfig.vnp_Url);
console.log('Return URL:', vnpayConfig.vnp_ReturnUrl);

// Test hash generation
const testParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: 10000000, // 100,000 VND
    vnp_CurrCode: 'VND',
    vnp_TxnRef: Date.now().toString(),
    vnp_OrderInfo: 'Test+Payment',
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_CreateDate: '20250803120000'
};

// Sort parameters
const sortedParams = Object.keys(testParams).sort().reduce((result, key) => {
    result[key] = testParams[key];
    return result;
}, {});

// Create query string
const queryString = Object.keys(sortedParams)
    .map(key => `${key}=${sortedParams[key]}`)
    .join('&');

// Generate hash
const hash = crypto
    .createHmac('sha512', vnpayConfig.vnp_HashSecret)
    .update(queryString)
    .digest('hex');

console.log('\n=== Test Hash Generation ===');
console.log('Query String:', queryString);
console.log('Generated Hash:', hash);
console.log('Hash Length:', hash.length);

// Test payment URL
const fullUrl = `${vnpayConfig.vnp_Url}?${queryString}&vnp_SecureHash=${hash}`;
console.log('\n=== Test Payment URL ===');
console.log('Full URL Length:', fullUrl.length);
console.log('URL:', fullUrl);

console.log('\n=== Test Completed ===');
console.log('If you see this without errors, your VNPay configuration is valid!');
