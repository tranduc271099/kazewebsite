const Voucher = require('../models/Voucher');
const { notifyClientDataUpdate, EVENT_TYPES } = require('../utils/realTimeNotifier');

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
    const now = new Date();
    console.log('Ngày hiện tại:', now.toISOString());

    // Lấy tất cả voucher active trước
    const allVouchers = await Voucher.find({ isActive: true });
    console.log('Tất cả voucher active:', allVouchers.length);

    // Lọc theo logic
    const vouchers = allVouchers.filter(voucher => {
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      const isInDateRange = now >= startDate && now <= endDate;
      const hasQuantity = (voucher.usedCount || 0) < (voucher.quantity || 1);

      console.log(`Voucher ${voucher.code}:`, {
        name: voucher.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isInDateRange,
        usedCount: voucher.usedCount || 0,
        quantity: voucher.quantity || 1,
        hasQuantity
      });

      return isInDateRange && hasQuantity;
    });

    console.log('Voucher khả dụng:', vouchers.length);
    res.json(vouchers);
  } catch (err) {
    console.error('Lỗi getAvailableVouchers:', err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách voucher khả dụng' });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const { code, name, description, minOrder, discountType, discountValue, maxDiscount, startDate, endDate, quantity } = req.body;

    // Validation cơ bản
    if (!code || !name || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Validation cho discountValue
    if (discountValue < 0) {
      return res.status(400).json({ message: 'Giá trị giảm giá không được âm' });
    }

    // Validation cho phần trăm
    if (discountType === 'percent') {
      if (discountValue > 100) {
        return res.status(400).json({ message: 'Giá trị giảm phần trăm không được vượt quá 100%' });
      }
      if (discountValue > 95) {
        return res.status(400).json({
          message: 'Cảnh báo: Giảm giá trên 95% có thể dẫn đến lỗ nghiêm trọng',
          warning: true
        });
      }
    }

    // Validation cho số tiền
    if (discountType === 'amount') {
      if (minOrder > 0 && discountValue >= minOrder) {
        return res.status(400).json({
          message: 'Số tiền giảm giá không được bằng hoặc vượt quá đơn hàng tối thiểu'
        });
      }
      if (minOrder > 0 && discountValue > minOrder * 0.9) {
        return res.status(400).json({
          message: `Cảnh báo: Số tiền giảm giá chiếm ${((discountValue / minOrder) * 100).toFixed(1)}% đơn hàng tối thiểu, có thể dẫn đến lỗ`,
          warning: true
        });
      }
    }

    // Validation ngày tháng
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc' });
    }

    // Validation số lượng
    if (quantity && quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng voucher phải lớn hơn 0' });
    }

    // Validation đơn hàng tối thiểu
    if (minOrder < 0) {
      return res.status(400).json({ message: 'Đơn hàng tối thiểu không được âm' });
    }

    const newVoucher = new Voucher({
      code,
      name,
      description,
      minOrder,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      startDate,
      endDate,
      quantity: quantity || 1, // Set default to 1 if not provided
      usedCount: 0 // Initialize usedCount to 0
    });
    await newVoucher.save();

    // Notify clients about new voucher creation
    notifyClientDataUpdate(req, EVENT_TYPES.VOUCHER_CREATED, {
      voucherId: newVoucher._id,
      voucherCode: newVoucher.code,
      voucherName: newVoucher.name,
      discountType: newVoucher.discountType,
      discountValue: newVoucher.discountValue
    });

    res.status(201).json(newVoucher);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi tạo voucher', error: err.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const { code, name, description, minOrder, discountType, discountValue, maxDiscount, startDate, endDate, quantity, isActive } = req.body;

    // Validation cơ bản
    if (!code || !name || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Validation cho discountValue
    if (discountValue < 0) {
      return res.status(400).json({ message: 'Giá trị giảm giá không được âm' });
    }

    // Validation cho phần trăm
    if (discountType === 'percent') {
      if (discountValue > 100) {
        return res.status(400).json({ message: 'Giá trị giảm phần trăm không được vượt quá 100%' });
      }
      if (discountValue > 95) {
        return res.status(400).json({
          message: 'Cảnh báo: Giảm giá trên 95% có thể dẫn đến lỗ nghiêm trọng',
          warning: true
        });
      }
    }

    // Validation cho số tiền
    if (discountType === 'amount') {
      if (minOrder > 0 && discountValue >= minOrder) {
        return res.status(400).json({
          message: 'Số tiền giảm giá không được bằng hoặc vượt quá đơn hàng tối thiểu'
        });
      }
      if (minOrder > 0 && discountValue > minOrder * 0.9) {
        return res.status(400).json({
          message: `Cảnh báo: Số tiền giảm giá chiếm ${((discountValue / minOrder) * 100).toFixed(1)}% đơn hàng tối thiểu, có thể dẫn đến lỗ`,
          warning: true
        });
      }
    }

    // Validation ngày tháng
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Ngày bắt đầu phải trước ngày kết thúc' });
    }

    // Validation số lượng
    if (quantity && quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng voucher phải lớn hơn 0' });
    }

    // Validation đơn hàng tối thiểu
    if (minOrder < 0) {
      return res.status(400).json({ message: 'Đơn hàng tối thiểu không được âm' });
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, {
      code,
      name,
      description,
      minOrder,
      discountType,
      discountValue,
      maxDiscount: maxDiscount || null,
      startDate,
      endDate,
      quantity,
      isActive
    }, { new: true });
    if (!updatedVoucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });

    // Notify clients about voucher update
    notifyClientDataUpdate(req, EVENT_TYPES.VOUCHER_UPDATED, {
      voucherId: updatedVoucher._id,
      voucherCode: updatedVoucher.code,
      voucherName: updatedVoucher.name,
      discountType: updatedVoucher.discountType,
      discountValue: updatedVoucher.discountValue,
      isActive: updatedVoucher.isActive
    });

    res.json(updatedVoucher);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi cập nhật voucher', error: err.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Không tìm thấy voucher' });

    // Notify clients about voucher deletion
    notifyClientDataUpdate(req, EVENT_TYPES.VOUCHER_DELETED, {
      voucherId: req.params.id,
      voucherCode: voucher.code,
      voucherName: voucher.name
    });

    res.json({ message: 'Đã xóa voucher' });
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi xóa voucher', error: err.message });
  }
};

exports.getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const voucher = await Voucher.findOne({ code });

    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    // Kiểm tra trạng thái active
    if (!voucher.isActive) {
      return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa' });
    }

    // Kiểm tra thời gian hiệu lực
    const now = new Date();
    if (now < voucher.startDate) {
      return res.status(400).json({ message: 'Mã giảm giá chưa có hiệu lực' });
    }

    if (now > voucher.endDate) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }

    // Kiểm tra số lượng còn lại
    if (voucher.usedCount >= voucher.quantity) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết số lượng sử dụng' });
    }

    res.json(voucher);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin voucher' });
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
      // Nếu có maxDiscount và discountAmount vượt quá thì giới hạn lại
      if (typeof voucher.maxDiscount === 'number' && voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else if (voucher.discountType === 'percent') {
      discountAmount = Math.floor((cartTotal * voucher.discountValue) / 100);
      // Nếu có maxDiscount và discountAmount vượt quá thì giới hạn lại
      if (typeof voucher.maxDiscount === 'number' && voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
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