import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApplyVoucher.css';

const ApplyVoucher = ({ cartTotal, onDiscountApplied }) => {
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);

  useEffect(() => {
    fetchAvailableVouchers();
  }, [cartTotal]);

  const fetchAvailableVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/vouchers/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableVouchers(res.data);
    } catch (err) {
      console.error('Không thể tải danh sách voucher:', err);
    }
  };

  const handleSelectVoucher = (voucher) => {
    setError('');
    setSuccess('');
    let discountAmount = 0;
    if (voucher.discountType === 'amount') {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === 'percent') {
      discountAmount = Math.floor((cartTotal * voucher.discountValue) / 100);
    }
    setDiscount(discountAmount);
    setSuccess(`Áp dụng thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`);
    if (onDiscountApplied) onDiscountApplied(discountAmount, voucher);
    setShowVoucherList(false);
  };

  return (
    <div className="voucher-container">
      <div className="voucher-input-group">
        <button 
          onClick={() => setShowVoucherList(!showVoucherList)} 
          className="show-vouchers-button"
        >
          <i className="fas fa-ticket-alt"></i>
          Chọn Voucher
        </button>
      </div>

      {error && <div className="voucher-error">{error}</div>}
      {success && <div className="voucher-success">{success}</div>}
      {discount > 0 && (
        <div className="discount-amount">
          Đã giảm: {discount.toLocaleString('vi-VN')}đ
        </div>
      )}

      {showVoucherList && (
        <div className="voucher-list">
          <h4>Voucher khả dụng</h4>
          {availableVouchers.length > 0 ? (
            availableVouchers.map(voucher => (
              <div key={voucher._id} className="voucher-item">
                <div className="voucher-info">
                  <div className="voucher-name">{voucher.name}</div>
                  <div className="voucher-details">
                    <div className="voucher-description">
                      {voucher.discountType === 'amount' 
                        ? `Giảm ${voucher.discountValue.toLocaleString('vi-VN')}đ`
                        : `Giảm ${voucher.discountValue}%`}
                    </div>
                    <div className="voucher-min-order">
                      Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="voucher-validity">
                      HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleSelectVoucher(voucher)}
                  className="select-voucher-button"
                >
                  Chọn
                </button>
              </div>
            ))
          ) : (
            <div className="no-vouchers">
              Không có voucher khả dụng cho đơn hàng này
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplyVoucher; 