import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApplyVoucher.css';
import { FaTicketAlt } from 'react-icons/fa';

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
    if (cartTotal < voucher.minOrder) {
      setError(`Đơn hàng không đủ điều kiện tối thiểu (${voucher.minOrder.toLocaleString('vi-VN')}đ) để áp dụng voucher này!`);
      return;
    }
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
        <div className="voucher-list" style={{
          maxHeight: 300,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          zIndex: 1001,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          borderRadius: 12,
          minWidth: 350,
          width: '100%',
          maxWidth: 420,
          padding: 24
        }}>
          <h4 style={{ textAlign: 'center', width: '100%' }}>Voucher khả dụng</h4>
          <div style={{ width: '100%' }}>
            {availableVouchers.length > 0 ? (
              availableVouchers.map(voucher => {
                const isDisabled = cartTotal < voucher.minOrder;
                return (
                  <div key={voucher._id} className="voucher-item" style={{ opacity: isDisabled ? 0.5 : 1, border: '1px solid #eee', borderRadius: 8, marginBottom: 12, padding: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    <div className="voucher-info" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 32, color: '#e53935', minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaTicketAlt />
                      </div>
                      <div>
                        <div className="voucher-name" style={{ fontWeight: 700, fontSize: 18 }}>{voucher.name}</div>
                        <div className="voucher-details">
                          <div className="voucher-description" style={{ color: '#e53935', fontWeight: 600 }}>
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
                    </div>
                    <button 
                      onClick={() => handleSelectVoucher(voucher)}
                      className="select-voucher-button"
                      disabled={isDisabled}
                      style={{ opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', border: '1px solid #e53935', color: '#e53935', background: '#fff', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}
                    >
                      Chọn
                    </button>
                    {isDisabled && (
                      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 8, background: '#fffbe6', color: '#b26a00', border: '1px solid #ffe58f', borderRadius: 6, padding: '4px 8px', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                        Vui lòng chọn sản phẩm đủ điều kiện để áp dụng Voucher này
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-vouchers" style={{ textAlign: 'center' }}>
                Không có voucher khả dụng cho đơn hàng này
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyVoucher; 