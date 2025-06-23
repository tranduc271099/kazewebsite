const Voucher = require('../models/Voucher');

exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher' });
  }
};

exports.getAvailableVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher khả dụng' });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi tạo voucher', error: err.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json(voucher);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi cập nhật voucher', error: err.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });
    res.json({ message: 'Đã xóa voucher' });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi xóa voucher', error: err.message });
  }
};

exports.applyVoucher = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const voucher = await Voucher.findOne({ code, isActive: true });
    
    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa' });
    }

    const now = new Date();
    if (now < voucher.startDate) {
      return res.status(400).json({ message: 'Mã giảm giá chưa có hiệu lực' });
    }
    
    if (now > voucher.endDate) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }

    if (cartTotal < voucher.minOrder) {
      return res.status(400).json({ 
        message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để sử dụng mã này`
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === 'amount') {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === 'percent') {
      discountAmount = Math.floor((cartTotal * voucher.discountValue) / 100);
    }

    res.json({ 
      discountAmount, 
      voucher,
      message: `Áp dụng mã giảm giá thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi áp dụng mã giảm giá' });
  }
}; 