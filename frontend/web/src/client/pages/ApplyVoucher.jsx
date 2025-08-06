import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ApplyVoucher.css';
import { FaTicketAlt } from 'react-icons/fa';
import { FaCaretUp } from 'react-icons/fa';
import Modal from 'react-modal';

const ApplyVoucher = ({ cartTotal, onDiscountApplied }) => {
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

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
      if (typeof voucher.maxDiscount === 'number' && voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else if (voucher.discountType === 'percent') {
      discountAmount = Math.floor((cartTotal * voucher.discountValue) / 100);
      if (typeof voucher.maxDiscount === 'number' && voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    }
    setDiscount(discountAmount);
    setSuccess(`Áp dụng thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`);
    if (onDiscountApplied) onDiscountApplied(discountAmount, voucher);
    setShowVoucherList(false);
  };

  // Hàm áp dụng mã voucher nhập tay
  const handleApplyVoucherCode = async () => {
    setError(''); setSuccess('');
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/vouchers/code/${voucherCode.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const voucher = res.data;
      if (!voucher) {
        setError('Không tìm thấy voucher này!');
        return;
      }
      if (cartTotal < voucher.minOrder) {
        setError(`Đơn hàng không đủ điều kiện tối thiểu (${voucher.minOrder.toLocaleString('vi-VN')}đ) để áp dụng voucher này!`);
        return;
      }
      let discountAmount = 0;
      if (voucher.discountType === 'amount') {
        discountAmount = voucher.discountValue;
        if (typeof voucher.maxDiscount === 'number' && voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
      } else if (voucher.discountType === 'percent') {
        discountAmount = Math.floor((cartTotal * voucher.discountValue) / 100);
        if (typeof voucher.maxDiscount === 'number' && voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
      }
      setDiscount(discountAmount);
      setSuccess(`Áp dụng thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`);
      if (onDiscountApplied) onDiscountApplied(discountAmount, voucher);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Không tìm thấy hoặc không áp dụng được voucher này!');
      }
    }
  };
  // Hàm clear toàn bộ trạng thái voucher khi hủy
  const clearVoucherState = () => {
    setDiscount(0);
    setSuccess('');
    setError('');
    setVoucherCode('');
    setSelectedVoucher(null);
  };

  return (
    <div className="voucher-container">
      <div className="voucher-input-group">
        <input
          type="text"
          className="voucher-code-input"
          placeholder="Nhập mã voucher..."
          value={voucherCode}
          onChange={e => setVoucherCode(e.target.value)}
          style={{ marginRight: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}
        />
        <button onClick={handleApplyVoucherCode} className="apply-voucher-code-btn" style={{ marginRight: 12 }}>
          Áp dụng
        </button>
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
        <div className="discount-amount" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Đã giảm: {discount.toLocaleString('vi-VN')}đ</span>
          <button
            className="btn btn-warning btn-sm"
            style={{ fontWeight: 500, padding: '2px 10px', marginLeft: 8 }}
            onClick={clearVoucherState}
          >
            Hủy áp dụng voucher
          </button>
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
                      className="voucher-caret-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 8, fontSize: 22 }}
                      title="Xem chi tiết voucher"
                      onClick={() => { setSelectedVoucher(voucher); setShowDetailModal(true); }}
                    >
                      <FaCaretUp />
                    </button>
                    <button
                      onClick={() => handleSelectVoucher(voucher)}
                      className="select-voucher-button"
                      disabled={isDisabled}
                      style={{ opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', border: '1px solid #e53935', color: '#e53935', background: '#fff', borderRadius: 6, padding: '6px 18px', fontWeight: 600 }}
                    >
                      Chọn
                    </button>
                    {isDisabled && (
                      <button
                        className="voucher-detail-btn"
                        style={{ position: 'absolute', right: 110, bottom: 8, fontSize: 13, color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => { setSelectedVoucher(voucher); setShowDetailModal(true); }}
                      >
                        Xem chi tiết
                      </button>
                    )}
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
      {/* Modal xem chi tiết voucher */}
      <Modal
        isOpen={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
        ariaHideApp={false}
        style={{ overlay: { zIndex: 2000, background: 'rgba(0,0,0,0.3)' }, content: { maxWidth: 420, minWidth: 240, width: '100%', padding: 16, borderRadius: 10, margin: 'auto', height: 'auto', maxHeight: 320, overflowY: 'auto' } }}
      >
        {selectedVoucher && (
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{selectedVoucher.name}</div>
            <div><b>Mã:</b> {selectedVoucher.code}</div>
            {selectedVoucher.description && <div><b>Mô tả:</b> {selectedVoucher.description}</div>}
            <div><b>Giảm:</b> {selectedVoucher.discountType === 'amount' ? `${selectedVoucher.discountValue.toLocaleString('vi-VN')}đ` : `${selectedVoucher.discountValue}%`}</div>
            <div><b>Tối thiểu:</b> {selectedVoucher.minOrder.toLocaleString('vi-VN')}đ</div>
            <div><b>HSD:</b> {new Date(selectedVoucher.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedVoucher.endDate).toLocaleDateString('vi-VN')}</div>
            {cartTotal < selectedVoucher.minOrder ? (
              <div style={{ color: '#e53935', marginTop: 6, fontSize: 14 }}><b>Lý do:</b> Đơn hàng chưa đủ điều kiện tối thiểu</div>
            ) : (
              <div style={{ color: '#2e7d32', marginTop: 6, fontSize: 14 }}><b>Đã đủ điều kiện áp dụng voucher</b></div>
            )}
            <button onClick={() => setShowDetailModal(false)} style={{ marginTop: 14, padding: '4px 16px', borderRadius: 5, background: '#1976d2', color: '#fff', border: 'none', fontSize: 15 }}>Đóng</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplyVoucher; 