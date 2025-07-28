const mongoose = require('mongoose');

async function removeVariantCostPrice() {
    console.log('Starting migration...');

    try {
        // Connect với timeout
        await mongoose.connect('mongodb://localhost:27017/kazewebsite', {
            serverSelectionTimeoutMS: 5000
        });

        console.log('Connected to MongoDB');

        // Cập nhật trực tiếp với native MongoDB driver
        const db = mongoose.connection.db;
        const collection = db.collection('products');

        console.log('Executing update...');

        const result = await collection.updateMany(
            {},
            { $unset: { "variants.$[].costPrice": "" } }
        );

        console.log(`Updated ${result.modifiedCount} products`);

        // Test một sản phẩm
        const testProduct = await collection.findOne({ "variants.0": { $exists: true } });
        if (testProduct && testProduct.variants && testProduct.variants[0]) {
            console.log('Sample variant after update:');
            console.log(JSON.stringify(testProduct.variants[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    }
}

removeVariantCostPrice();
