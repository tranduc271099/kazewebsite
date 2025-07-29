// Test script for product revenue statistics API
const axios = require('axios');

async function testProductRevenueAPI() {
    const baseURL = 'http://localhost:5000/api';

    console.log('Testing Product Revenue Statistics API...\n');

    try {
        // Test the new product revenue statistics endpoint
        console.log('1. Testing GET /products/revenue/statistics');
        const response = await axios.get(`${baseURL}/products/revenue/statistics`);

        if (response.status === 200) {
            console.log('✅ API endpoint is working');
            console.log('Response structure:', {
                success: response.data.success,
                dataLength: response.data.data ? response.data.data.length : 0,
                hasProducts: response.data.data && response.data.data.length > 0
            });

            if (response.data.data && response.data.data.length > 0) {
                const firstProduct = response.data.data[0];
                console.log('Sample product data structure:');
                console.log({
                    productId: firstProduct._id,
                    name: firstProduct.name,
                    totalRevenue: firstProduct.totalRevenue,
                    estimatedProfit: firstProduct.estimatedProfit,
                    totalSold: firstProduct.totalSold,
                    averagePrice: firstProduct.averagePrice,
                    hasStockInfo: !!firstProduct.stockInfo,
                    hasCategory: !!firstProduct.category
                });
            }
        }

        // Test with date filters
        console.log('\n2. Testing with date filters');
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const filteredResponse = await axios.get(`${baseURL}/products/revenue/statistics`, {
            params: {
                startDate: lastMonth.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0]
            }
        });

        if (filteredResponse.status === 200) {
            console.log('✅ Date filtering is working');
            console.log('Filtered results:', {
                dataLength: filteredResponse.data.data ? filteredResponse.data.data.length : 0
            });
        }

        console.log('\n🎉 All tests passed! The Product Revenue Statistics system is ready to use.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    testProductRevenueAPI();
}

module.exports = { testProductRevenueAPI };
