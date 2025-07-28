// Test script để kiểm tra cập nhật costPrice
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testCostPriceUpdate() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kazewebsite');
        console.log('Connected to MongoDB');

        // Tìm một sản phẩm để test
        const product = await Product.findOne();
        if (!product) {
            console.log('Không tìm thấy sản phẩm nào để test');
            return;
        }

        console.log('Product trước khi update:', {
            id: product._id,
            name: product.name,
            price: product.price,
            costPrice: product.costPrice
        });

        // Test update costPrice
        const testCostPrice = 50000;
        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            { costPrice: testCostPrice },
            { new: true }
        );

        console.log('Product sau khi update:', {
            id: updatedProduct._id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            costPrice: updatedProduct.costPrice
        });

        if (updatedProduct.costPrice === testCostPrice) {
            console.log('✅ CostPrice đã được cập nhật thành công!');
        } else {
            console.log('❌ CostPrice không được cập nhật!');
        }

    } catch (error) {
        console.error('Lỗi test:', error);
    } finally {
        mongoose.disconnect();
    }
}

// Chạy test nếu file này được execute trực tiếp
if (require.main === module) {
    testCostPriceUpdate();
}

module.exports = { testCostPriceUpdate };
