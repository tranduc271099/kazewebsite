const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Thêm middleware để parse JSON body
app.use(express.json());

// Cấu hình static cho thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:3001'],
    credentials: true
}));

<<<<<<< HEAD

=======
app.use(express.json({ limit: '20mb' })); 
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
>>>>>>> feat/order_checkout_admin

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ DB connection error:', err));

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart.routes'));



app.use('/api/bill', require('./routes/Bill/billroutes'))

app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});