const CommentUser = require('../models/Comment/CommentUser');
const Product = require('../models/Product');

/**
 * Tính toán và cập nhật rating trung bình cho sản phẩm
 * @param {String} productId - ID của sản phẩm
 */
const calculateProductRating = async (productId) => {
    try {
        // Tìm tất cả các comment được approve cho sản phẩm này
        const approvedComments = await CommentUser.find({
            productId: productId,
            status: 'approved'
        });

        if (approvedComments.length === 0) {
            // Nếu không có comment nào, set rating = 0
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                reviewCount: 0,
                reviews: []
            });
            return { rating: 0, reviewCount: 0 };
        }

        // Tính rating trung bình
        const totalRating = approvedComments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = parseFloat((totalRating / approvedComments.length).toFixed(1));

        // Lấy danh sách ID của các review
        const reviewIds = approvedComments.map(comment => comment._id);

        // Cập nhật thông tin rating cho sản phẩm
        await Product.findByIdAndUpdate(productId, {
            rating: averageRating,
            reviewCount: approvedComments.length,
            reviews: reviewIds
        });

        return {
            rating: averageRating,
            reviewCount: approvedComments.length
        };
    } catch (error) {
        console.error('Lỗi khi tính toán rating:', error);
        throw error;
    }
};

/**
 * Cập nhật rating cho tất cả sản phẩm
 */
const updateAllProductRatings = async () => {
    try {
        const products = await Product.find({});

        for (const product of products) {
            await calculateProductRating(product._id);
        }

        console.log(`Đã cập nhật rating cho ${products.length} sản phẩm`);
    } catch (error) {
        console.error('Lỗi khi cập nhật rating cho tất cả sản phẩm:', error);
        throw error;
    }
};

module.exports = {
    calculateProductRating,
    updateAllProductRatings
};
