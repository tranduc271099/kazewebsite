const express = require('express');
const router = express.Router();
const CommentController = require('../../controllers/Comment/Comment');
const auth = require('../../middleware/auth');

// Lấy tất cả bình luận của 1 sản phẩm
router.get('/:productId', CommentController.getByProduct);

// Admin routes - Lấy tất cả bình luận cho admin
router.get('/admin/all', auth, CommentController.getAllForAdmin);

// Thêm bình luận mới (cần đăng nhập)
router.post('/', auth, CommentController.create);

// Admin routes - Cập nhật trạng thái bình luận
router.patch('/admin/:id/status', auth, CommentController.updateStatus);

// Admin routes - Phản hồi bình luận
router.post('/admin/:id/reply', auth, CommentController.replyToComment);

// Báo cáo bình luận (cần đăng nhập)
router.post('/:id/report', auth, CommentController.reportComment);

// Admin routes - Ẩn/Hiện bình luận
router.patch('/admin/:id/visibility', auth, CommentController.toggleVisibility);

// Admin routes - Xóa bình luận (soft delete)
router.delete('/admin/:id', auth, CommentController.deleteComment);

// Xóa bình luận (hard delete - chỉ admin)
router.delete('/:id', auth, CommentController.remove);

// Lấy danh sách orderId hợp lệ để bình luận cho sản phẩm này
router.get('/eligible-orders/:productId', auth, CommentController.getEligibleOrdersForComment);

module.exports = router;
