const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:3001'],
  credentials: true
}));

// Routes that need multipart/form-data should come before express.json()
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));

// Thêm middleware để parse JSON body
app.use(express.json());

// Cấu hình static cho thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection error:', err));

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/comments', require('./routes/Comment/CommentRoutes'));

app.use('/api/bill', require('./routes/Bill/billroutes'))

app.use('/api/vouchers', require('./routes/voucher.routes'));

// Thêm route payment
app.use('/api/payment', require('./routes/payment.routes'));

app.use('/api/banners', require('./routes/bannerRoutes'));

const vnpayReturnController = require('./controllers/vnpayReturn.controller');
app.get('/vnpay_return', async (req, res) => {
  try {
    const result = await vnpayReturnController.handleVnpayReturn(req.query);
    if (result.status === 200) {
      res.redirect('http://localhost:3000/payment-success?orderId=' + encodeURIComponent(result.data.orderId || '') + '&transactionNo=' + encodeURIComponent(result.data.transactionNo || ''));
    } else {
      res.redirect('http://localhost:3000/payment-failure?orderId=' + encodeURIComponent(result.data.orderId || '') + '&responseCode=' + encodeURIComponent(result.data.responseCode || '') + '&message=' + encodeURIComponent(result.data.message || ''));
    }
  } catch (error) {
    res.redirect('http://localhost:3000/payment-failure?message=Internal%20server%20error');
  }
});

// Add a basic route for the root URL
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});

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

  // ... các tham số khác ...
  vnp_Params['vnp_CreateDate'] = createDate;
  // ...
};

// --- TỰ ĐỘNG HỦY ĐƠN HÀNG VNPAY CHƯA THANH TOÁN SAU 5 PHÚT ---
const Bill = require('./models/Bill/BillUser');
setInterval(async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const bills = await Bill.find({
      phuong_thuc_thanh_toan: 'VNPAY',
      thanh_toan: 'chưa thanh toán',
      trang_thai: { $ne: 'đã hủy' },
      ngay_tao: { $lte: fiveMinutesAgo },
      orderId: { $exists: true, $ne: null }
    });
    for (const bill of bills) {
      bill.trang_thai = 'đã hủy';
      bill.ly_do_huy = 'Khách không hoàn tất thanh toán VNPAY trong 5 phút';
      await bill.save();
      console.log(`[AUTO CANCEL] Đã hủy đơn hàng VNPAY ${bill.orderId} do không thanh toán sau 5 phút.`);
    }
  } catch (err) {
    console.error('[AUTO CANCEL] Lỗi khi kiểm tra/hủy đơn hàng VNPAY:', err);
  }
}, 60 * 1000); // 1 phút chạy 1 lần

// --- TỰ ĐỘNG CHUYỂN ĐƠN HÀNG SANG 'ĐÃ NHẬN HÀNG' SAU 3 NGÀY ---
setInterval(async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  try {
    const bills = await Bill.find({
      trang_thai: 'đã giao hàng',
      ngay_cap_nhat: { $lte: threeDaysAgo }
    });
    for (const bill of bills) {
      bill.trang_thai = 'đã nhận hàng';
      bill.ngay_cap_nhat = new Date();
      await bill.save();
      console.log(`[AUTO UPDATE] Đơn hàng ${bill.orderId} đã tự động chuyển sang 'đã nhận hàng' sau 3 ngày.`);
    }
  } catch (err) {
    console.error('[AUTO UPDATE] Lỗi khi tự động cập nhật trạng thái đơn hàng:', err);
  }
}, 60 * 60 * 1000); // 1 tiếng chạy 1 lần