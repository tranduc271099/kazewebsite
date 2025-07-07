import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentResult = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const orderId = query.get('orderId');
  const rspCode = query.get('vnp_ResponseCode');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (orderId) {
      axios.get(`http://localhost:5000/api/vnpay/status/${orderId}`)
        .then(res => setStatus(res.data.paymentStatus))
        .catch(() => setStatus('unknown'));
    }
  }, [orderId]);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h2>Kết quả thanh toán</h2>
      {status === 'paid' && <div style={{ color: 'green', fontWeight: 700 }}>Chuyển khoản thành công!</div>}
      {status === 'pending' && <div style={{ color: 'orange', fontWeight: 700 }}>Đang chờ thanh toán...</div>}
      {status === 'failed' && <div style={{ color: 'red', fontWeight: 700 }}>Thanh toán thất bại!</div>}
      {!status && <div>Đang kiểm tra trạng thái...</div>}
      <div style={{ marginTop: 20 }}>
        <a href='/'>Về trang chủ</a>
      </div>
    </div>
  );
};

export default PaymentResult; 