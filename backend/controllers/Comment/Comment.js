const Comment = require('../../models/Comment/CommentUser');
const Bill = require('../../models/Bill/BillUser'); // Model đơn hàng
const { calculateProductRating } = require('../../utils/calculateRating');

const CommentController = {
  // Lấy tất cả bình luận của 1 sản phẩm
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const comments = await Comment.find({ productId, isDeleted: false, isHidden: false })
        .populate('userId', 'name')
        .sort({ createdAt: -1 });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Lấy tất cả bình luận cho admin (bao gồm cả ẩn và đã xóa)
  async getAllForAdmin(req, res) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      let query = { isDeleted: false };

      if (status && status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { content: { $regex: search, $options: 'i' } },
          { 'adminReply.content': { $regex: search, $options: 'i' } }
        ];
      }

      const comments = await Comment.find(query)
        .populate('userId', 'name email')
        .populate('productId', 'name description brand images variants attributes')
        .populate('adminReply.adminId', 'name')
        .populate('reports.userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Comment.countDocuments(query);

      res.json({
        comments,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
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

  // Cập nhật trạng thái bình luận (admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }

      const comment = await Comment.findByIdAndUpdate(
        id,
        { status, updatedAt: Date.now() },
        { new: true }
      ).populate('userId', 'name email');

      if (!comment) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận' });
      }

      // Cập nhật rating sản phẩm khi trạng thái comment thay đổi
      if (comment.productId) {
        try {
          await calculateProductRating(comment.productId);
        } catch (error) {
          console.error('Lỗi khi cập nhật rating sản phẩm:', error);
        }
      }

      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Phản hồi bình luận (admin)
  async replyToComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const adminId = req.user.id;

      if (!content) {
        return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
      }

      const comment = await Comment.findByIdAndUpdate(
        id,
        {
          adminReply: {
            content,
            adminId,
            repliedAt: Date.now()
          },
          updatedAt: Date.now()
        },
        { new: true }
      ).populate('userId', 'name email')
        .populate('adminReply.adminId', 'name');

      if (!comment) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận' });
      }

      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Báo cáo bình luận
  async reportComment(req, res) {
    try {
      const { id } = req.params;
      const { reason, description } = req.body;
      const userId = req.user.id;

      if (!reason) {
        return res.status(400).json({ message: 'Lý do báo cáo không được để trống' });
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận' });
      }

      // Kiểm tra xem user đã báo cáo chưa
      const alreadyReported = comment.reports.find(report =>
        report.userId.toString() === userId
      );

      if (alreadyReported) {
        return res.status(400).json({ message: 'Bạn đã báo cáo bình luận này rồi' });
      }

      comment.reports.push({
        userId,
        reason,
        description,
        reportedAt: Date.now()
      });

      await comment.save();
      res.json({ message: 'Đã báo cáo bình luận thành công' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Ẩn/Hiện bình luận (admin)
  async toggleVisibility(req, res) {
    try {
      const { id } = req.params;
      const { isHidden } = req.body;

      const comment = await Comment.findByIdAndUpdate(
        id,
        { isHidden, updatedAt: Date.now() },
        { new: true }
      ).populate('userId', 'name email');

      if (!comment) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận' });
      }

      res.json(comment);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Xóa bình luận (soft delete)
  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      const comment = await Comment.findByIdAndUpdate(
        id,
        { isDeleted: true, updatedAt: Date.now() },
        { new: true }
      );

      if (!comment) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận' });
      }

      res.json({ message: 'Đã xóa bình luận thành công' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // Xóa bình luận (hard delete - chỉ admin)
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
