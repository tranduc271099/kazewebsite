const Comment = require('../../models/Comment/CommentUser');
const Bill = require('../../models/Bill/BillUser'); // Model đơn hàng

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
      const { productId, content, rating, orderId } = req.body;
      const userId = req.user.id;
      if (!content || !rating || !orderId) return res.status(400).json({ message: 'Thiếu nội dung, đánh giá hoặc orderId' });

      // 1. Kiểm tra đơn hàng hoàn thành chứa sản phẩm này
      const order = await Bill.findOne({
        _id: orderId,
        nguoi_dung_id: userId,
        trang_thai: 'hoàn thành',
        'danh_sach_san_pham.san_pham_id': productId
      });
      if (!order) return res.status(403).json({ message: 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành' });

      // 2. Kiểm tra đã bình luận chưa (theo từng orderId)
      const existed = await Comment.findOne({ productId, userId, orderId });
      if (existed) return res.status(400).json({ message: 'Bạn đã bình luận cho sản phẩm này trong đơn hàng này' });

      // 3. Tạo bình luận
      const comment = new Comment({ productId, userId, content, rating, orderId });
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
  },

  // Lấy danh sách orderId hợp lệ để bình luận cho sản phẩm này
  async getEligibleOrdersForComment(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;
      // 1. Lấy các đơn hàng hoàn thành chứa sản phẩm này
      const orders = await Bill.find({
        nguoi_dung_id: userId,
        trang_thai: 'hoàn thành',
        'danh_sach_san_pham.san_pham_id': productId
      });
      // 2. Lọc ra các orderId đã bình luận rồi
      const comments = await Comment.find({ productId, userId });
      const commentedOrderIds = comments.map(c => c.orderId.toString());
      // 3. Trả về các order chưa bình luận
      const eligibleOrders = orders.filter(o => !commentedOrderIds.includes(o._id.toString()));
      res.json(eligibleOrders.map(o => ({ orderId: o._id, ngay_tao: o.ngay_tao, tong_tien: o.tong_tien })));
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  }
};

module.exports = CommentController;
