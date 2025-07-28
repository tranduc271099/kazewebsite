const { MongoClient } = require('mongodb');

async function removeCostPriceFromVariants() {
    const client = new MongoClient('mongodb://localhost:27017');

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('kazewebsite');
        const collection = db.collection('products');

        // Update all products to remove costPrice from variants
        const result = await collection.updateMany(
            {},
            { $unset: { "variants.$[].costPrice": "" } }
        );

        console.log(`Migration completed!`);
        console.log(`- Documents matched: ${result.matchedCount}`);
        console.log(`- Documents modified: ${result.modifiedCount}`);

        // Verify the change
        const sampleProduct = await collection.findOne({ "variants.0": { $exists: true } });
        if (sampleProduct && sampleProduct.variants[0]) {
            console.log('\nSample variant after migration:');
            console.log(JSON.stringify(sampleProduct.variants[0], null, 2));

            if (sampleProduct.variants[0].costPrice !== undefined) {
                console.log('⚠️  Warning: costPrice still exists in variants');
            } else {
                console.log('✅ Success: costPrice removed from variants');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

removeCostPriceFromVariants();
