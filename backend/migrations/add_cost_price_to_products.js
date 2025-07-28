const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kazewebsite', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function addCostPriceToProducts() {
    try {
        console.log('Bắt đầu migration: Thêm trường costPrice vào products...');

        // Cập nhật tất cả sản phẩm chưa có trường costPrice
        const result = await Product.updateMany(
            { costPrice: { $exists: false } },
            { $set: { costPrice: 0 } }
        );

        console.log(`Đã cập nhật ${result.modifiedCount} sản phẩm với costPrice = 0`);

        // Cập nhật variants chưa có costPrice
        const products = await Product.find({});
        let variantUpdateCount = 0;

        for (const product of products) {
            let hasUpdatedVariants = false;

            for (const variant of product.variants) {
                if (!variant.costPrice) {
                    variant.costPrice = 0;
                    hasUpdatedVariants = true;
                    variantUpdateCount++;
                }
            }

            if (hasUpdatedVariants) {
                await product.save();
            }
        }

        console.log(`Đã cập nhật ${variantUpdateCount} variants với costPrice = 0`);
        console.log('Migration hoàn thành!');

    } catch (error) {
        console.error('Lỗi trong quá trình migration:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Chạy migration
addCostPriceToProducts();
