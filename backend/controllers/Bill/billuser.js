const Bill = require('../../models/Bill/BillUser');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');

class BillController {
  async getList(req, res) {
    try {
      const userId = req.user.id;
      const bills = await Bill.find({ nguoi_dung_id: userId })
        .populate('nguoi_dung_id', 'name email')
        .populate({
            path: 'danh_sach_san_pham.san_pham_id',
            select: 'name images'
        })
        .sort({ ngay_tao: -1 });
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  async addBill(req, res) {
    try {
      const { 
        dia_chi_giao_hang, 
        phuong_thuc_thanh_toan, 
        ghi_chu,
        shippingFee
      } = req.body;
      const nguoi_dung_id = req.user.id;
      const cart = await Cart.findOne({ userId: nguoi_dung_id }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống hoặc không tồn tại' });
      }
      let subtotal = 0;
      const danh_sach_san_pham = cart.items.map(item => {
        const product = item.productId;
        if (!product) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
        }
        subtotal += product.price * item.quantity;
        return {
          san_pham_id: product._id,
          ten_san_pham: product.name,
          so_luong: item.quantity,
          gia: product.price,
          mau_sac: item.color,
          kich_thuoc: item.size,
        };
      });
      const tong_tien = subtotal + (shippingFee || 0);
      const newBill = new Bill({
        nguoi_dung_id,
        dia_chi_giao_hang,
        tong_tien,
        phuong_thuc_thanh_toan,
        ghi_chu,
        danh_sach_san_pham,
      });
      await newBill.save();
      await Cart.findByIdAndDelete(cart._id);
      res.status(201).json({ message: 'Tạo hóa đơn thành công', bill: newBill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi tạo hóa đơn', error: error.message });
    }
  }

  async cancelBill(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const bill = await Bill.findOne({ _id: id, nguoi_dung_id: userId });
      if (!bill) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }
      if (bill.trang_thai !== 'chờ xác nhận') {
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });
      }
      bill.trang_thai = 'đã hủy';
      await bill.save();
      res.status(200).json({ message: 'Hủy đơn hàng thành công', bill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng', error: error.message });
    }
  }

  // Lấy tất cả đơn hàng (admin), có phân trang
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const total = await Bill.countDocuments();
      const bills = await Bill.find()
        .populate('nguoi_dung_id', 'name email')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        })
        .sort({ ngay_tao: -1 })
        .skip(skip)
        .limit(limit);
      res.json({ total, page, limit, bills });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // Lấy chi tiết đơn hàng theo id (admin)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const bill = await Bill.findById(id)
        .populate('nguoi_dung_id', 'name email')
        .populate({
          path: 'danh_sach_san_pham.san_pham_id',
          select: 'name images'
        });
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }

  // Cập nhật trạng thái đơn hàng (admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { trang_thai } = req.body;
      const bill = await Bill.findById(id);
      if (!bill) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      bill.trang_thai = trang_thai;
      await bill.save();
      res.json({ message: 'Cập nhật trạng thái thành công', bill });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}

module.exports = BillController;
