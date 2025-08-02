const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Kết nối MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kazewebsite');
        console.log('✅ Kết nối MongoDB thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error);
        process.exit(1);
    }
};

// Thêm dữ liệu rating mẫu
const addSampleRatings = async () => {
    try {
        await connectDB();
        console.log('🔄 Thêm dữ liệu rating mẫu...');

        // Lấy một số sản phẩm đầu tiên
        const products = await Product.find({}).limit(5);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            // Tạo rating ngẫu nhiên từ 3.0 đến 5.0
            const rating = Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
            const reviewCount = Math.floor(Math.random() * 50) + 1;

            await Product.findByIdAndUpdate(product._id, {
                rating: rating,
                reviewCount: reviewCount,
                reviews: [] // Để trống vì chưa có comment thực tế
            });

            console.log(`✅ Cập nhật ${product.name}: ${rating} sao (${reviewCount} đánh giá)`);
        }

        console.log('✅ Hoàn thành thêm dữ liệu rating mẫu!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi thêm rating mẫu:', error);
        process.exit(1);
    }
};

addSampleRatings();
