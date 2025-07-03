const express = require('express');
const router = express.Router();
const CommentController = require('../../controllers/Comment/Comment');
const auth = require('../../middleware/auth');

// Lấy tất cả bình luận của 1 sản phẩm
router.get('/:productId', CommentController.getByProduct);
// Thêm bình luận mới (cần đăng nhập)
router.post('/', auth, CommentController.create);
// Xóa bình luận (cần đăng nhập)
router.delete('/:id', auth, CommentController.remove);
// Lấy danh sách orderId hợp lệ để bình luận cho sản phẩm này
router.get('/eligible-orders/:productId', auth, CommentController.getEligibleOrdersForComment);

module.exports = router;
