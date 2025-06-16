import React, { useState } from 'react';
import axios from 'axios';

const ApplyVoucher = ({ cartTotal, onDiscountApplied }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApply = async () => {
    setError('');
    setSuccess('');
    setDiscount(0);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/vouchers/apply',
        { code: voucherCode, cartTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscount(res.data.discountAmount);
      setSuccess(`Áp dụng thành công! Giảm ${res.data.discountAmount}đ`);
      if (onDiscountApplied) onDiscountApplied(res.data.discountAmount, res.data.voucher);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Nhập mã giảm giá"
        value={voucherCode}
        onChange={e => setVoucherCode(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button onClick={handleApply}>Áp dụng</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {discount > 0 && <div>Đã giảm: {discount}đ</div>}
    </div>
  );
};

export default ApplyVoucher; 