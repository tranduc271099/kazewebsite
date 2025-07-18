import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const transactionNo = params.get('transactionNo');

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/bill');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h2>Thanh toán thành công!</h2>
            <p>Mã đơn hàng: {orderId}</p>
            <p>Mã giao dịch: {transactionNo}</p>
            <p style={{ color: '#888', marginTop: 24 }}>Bạn sẽ được chuyển về trang đơn hàng sau 5 giây...</p>
        </div>
    );
} 