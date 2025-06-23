const Bill = require('../../models/Bill/BillUser');
const Product = require('../../models/Product');
const Cart = require('../../models/Cart');

class BillController {
  async getList(req, res) {
    try {
      const userId = req.user.id; e
      
      const bills = await Bill.find({ nguoi_dung_id: userId })
        .populate('nguoi_dung_id', 'name email')
        .populate({
            path: 'danh_sach_san_pham.san_pham_id',
            select: 'name images'
        })
        .sort({ ngay_tao: -1 });

      res.json(bills);
    } catch (error) {
      console.error(' Lỗi khi lấy danh sách hóa đơn:', error);
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
      console.error(' Lỗi khi tạo hóa đơn:', error);
      res.status(500).json({ message: 'Lỗi server khi tạo hóa đơn', error: error.message });
    }
  }

  async cancelBill(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log(' Đang hủy đơn hàng:', { id, userId });

      const bill = await Bill.findOne({ _id: id, nguoi_dung_id: userId });
      
      console.log(' Tìm thấy đơn hàng:', bill);
      
      if (!bill) {
        console.log(' Không tìm thấy đơn hàng');
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      console.log(' Trạng thái hiện tại:', bill.trang_thai);

      if (bill.trang_thai !== 'chờ xác nhận') {
        console.log('❌ Không thể hủy đơn hàng ở trạng thái:', bill.trang_thai);
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });
      }

      bill.trang_thai = 'đã hủy';
      await bill.save();

      console.log(' Hủy đơn hàng thành công');

      res.status(200).json({ message: 'Hủy đơn hàng thành công', bill });
    } catch (error) {
      console.error(' Lỗi khi hủy đơn hàng:', error);
      res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng', error: error.message });
    }
  }
}

module.exports = BillController;
