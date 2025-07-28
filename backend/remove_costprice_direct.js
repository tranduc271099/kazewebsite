const mongoose = require('mongoose');

async function removeCostPriceFromVariants() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kazewebsite');
        console.log('Connected to database');

        // Sử dụng aggregation để cập nhật
        const result = await mongoose.connection.db.collection('products').updateMany(
            { "variants.costPrice": { $exists: true } },
            { $unset: { "variants.$[].costPrice": "" } }
        );

        console.log(`Migration hoàn thành!`);
        console.log(`- Số documents được cập nhật: ${result.modifiedCount}`);

        // Kiểm tra lại
        const sampleProduct = await mongoose.connection.db.collection('products').findOne(
            { variants: { $exists: true, $ne: [] } }
        );

        if (sampleProduct) {
            console.log('\nKiểm tra lại sau khi migration:');
            console.log('Product name:', sampleProduct.name);
            console.log('First variant:', JSON.stringify(sampleProduct.variants[0], null, 2));
        }

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.connection.close();
    }
}

removeCostPriceFromVariants();
