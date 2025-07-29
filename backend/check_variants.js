const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkVariants() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kazewebsite');
        console.log('Connected to database');

        const product = await Product.findOne({ variants: { $exists: true, $ne: [] } });
        if (product) {
            console.log('Product name:', product.name);
            console.log('Variants structure:');
            console.log(JSON.stringify(product.variants, null, 2));
        } else {
            console.log('No product with variants found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkVariants();
