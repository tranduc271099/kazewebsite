const mongoose = require('mongoose');
const { updateAllProductRatings } = require('./utils/calculateRating');
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

// Chạy script cập nhật rating
const runScript = async () => {
    try {
        await connectDB();
        console.log('🔄 Bắt đầu cập nhật rating cho tất cả sản phẩm...');

        await updateAllProductRatings();

        console.log('✅ Hoàn thành cập nhật rating!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi chạy script:', error);
        process.exit(1);
    }
};

runScript();
