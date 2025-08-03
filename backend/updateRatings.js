// Script để cập nhật lại tất cả rating và ratingCount của sản phẩm
// Chạy script này một lần để cập nhật dữ liệu lịch sử

const mongoose = require('mongoose');
const Comment = require('./models/Comment/CommentUser');
const Product = require('./models/Product');
require('dotenv').config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            // 1. Lấy tất cả sản phẩm
            const products = await Product.find();
            console.log(`Đang cập nhật rating cho ${products.length} sản phẩm...`);

            // 2. Duyệt qua từng sản phẩm và cập nhật rating
            for (const product of products) {
                // Lấy tất cả comment hợp lệ của sản phẩm
                const comments = await Comment.find({
                    productId: product._id,
                    isDeleted: false,
                    status: 'approved'  // Chỉ tính những comment đã được duyệt
                });

                // Tính rating trung bình và đếm số lượng
                const ratingCount = comments.length;
                const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
                const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

                // Cập nhật vào sản phẩm
                product.rating = averageRating;
                product.ratingCount = ratingCount;
                product.reviews = comments.map(comment => comment._id);
                await product.save();

                console.log(`Đã cập nhật sản phẩm ${product.name}: rating=${averageRating.toFixed(1)}, ratingCount=${ratingCount}`);
            }

            console.log('Cập nhật hoàn tất!');
        } catch (error) {
            console.error('Lỗi khi cập nhật rating:', error);
        } finally {
            mongoose.disconnect();
            console.log('Đã ngắt kết nối MongoDB');
        }
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
    });
