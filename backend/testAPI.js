const axios = require('axios');

const testAPI = async () => {
    try {
        console.log('🔄 Testing backend API...');

        // Test products endpoint
        const response = await axios.get('http://localhost:5000/api/products?activeOnly=true');
        console.log('✅ Products API Response:');
        console.log('- Status:', response.status);
        console.log('- Products count:', response.data.length);

        if (response.data.length > 0) {
            const sampleProduct = response.data[0];
            console.log('📦 Sample product:');
            console.log('- Name:', sampleProduct.name);
            console.log('- Price:', sampleProduct.price);
            console.log('- Rating:', sampleProduct.rating);
            console.log('- Review Count:', sampleProduct.reviewCount);
            console.log('- Active:', sampleProduct.isActive);
            console.log('- Images:', sampleProduct.images?.length || 0);
        }

    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        if (error.response) {
            console.error('- Status:', error.response.status);
            console.error('- Data:', error.response.data);
        }
    }
};

testAPI();
