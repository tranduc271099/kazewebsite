const Comment = require('../../models/Comment/CommentUser');

const CommentController = {
  // Lấy tất cả bình luận của 1 sản phẩm
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const comments = await Comment.find({ productId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Thêm bình luận mới
  async create(req, res) {
    try {
      const { productId, content, rating } = req.body;
      const userId = req.user.id;
      if (!content || !rating) return res.status(400).json({ message: 'Thiếu nội dung hoặc đánh giá' });
      const comment = new Comment({ productId, userId, content, rating });
      await comment.save();
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Xóa bình luận
  async remove(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const comment = await Comment.findById(id);
      if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });
      // Chỉ admin hoặc chủ comment được xóa
      if (comment.userId.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
      }
      await comment.deleteOne();
      res.json({ message: 'Đã xóa bình luận' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  }
};

module.exports = CommentController;
