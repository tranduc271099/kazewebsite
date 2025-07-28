const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kazewebsite', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function removeCostPriceFromVariants() {
    try {
        console.log('Bắt đầu migration: Xóa trường costPrice khỏi variants...');

        // Tìm tất cả sản phẩm có variants
        const products = await Product.find({
            variants: { $exists: true, $not: { $size: 0 } }
        });

        let updatedProductCount = 0;
        let totalVariantsUpdated = 0;

        for (const product of products) {
            let hasUpdatedVariants = false;

            // Lặp qua tất cả variants và xóa trường costPrice
            for (const variant of product.variants) {
                if (variant.costPrice !== undefined) {
                    delete variant.costPrice;
                    hasUpdatedVariants = true;
                    totalVariantsUpdated++;
                }
            }

            // Lưu sản phẩm nếu có variants được cập nhật
            if (hasUpdatedVariants) {
                await product.save();
                updatedProductCount++;
                console.log(`Đã cập nhật variants cho sản phẩm: ${product.name}`);
            }
        }

        console.log(`Migration hoàn thành!`);
        console.log(`- Số sản phẩm được cập nhật: ${updatedProductCount}`);
        console.log(`- Tổng số variants đã xóa costPrice: ${totalVariantsUpdated}`);

    } catch (error) {
        console.error('Lỗi trong quá trình migration:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Chạy migration
removeCostPriceFromVariants();
