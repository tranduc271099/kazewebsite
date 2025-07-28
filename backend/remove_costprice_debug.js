const mongoose = require('mongoose');
const Product = require('./models/Product');

async function removeCostPriceFromVariants() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kazewebsite');
        console.log('Bắt đầu migration: Xóa trường costPrice khỏi variants...');

        // Tìm tất cả sản phẩm có variants
        const products = await Product.find({
            variants: { $exists: true, $not: { $size: 0 } }
        });

        console.log(`Tìm thấy ${products.length} sản phẩm có variants`);

        let updatedProductCount = 0;
        let totalVariantsUpdated = 0;

        for (const product of products) {
            let hasUpdatedVariants = false;
            console.log(`Kiểm tra sản phẩm: ${product.name} - ${product.variants.length} variants`);

            // Lặp qua tất cả variants và xóa trường costPrice
            for (let i = 0; i < product.variants.length; i++) {
                const variant = product.variants[i];
                console.log(`  Variant ${i}: costPrice = ${variant.costPrice}`);

                if (variant.costPrice !== undefined) {
                    console.log(`    Xóa costPrice từ variant ${i}`);
                    delete variant.costPrice;
                    hasUpdatedVariants = true;
                    totalVariantsUpdated++;
                }
            }

            // Lưu sản phẩm nếu có variants được cập nhật
            if (hasUpdatedVariants) {
                await product.save();
                updatedProductCount++;
                console.log(`✓ Đã cập nhật variants cho sản phẩm: ${product.name}`);
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

removeCostPriceFromVariants();
