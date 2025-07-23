import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const message = params.get('message') || 'Thanh toán thất bại!';
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/bill'); // hoặc '/history' nếu đúng route của bạn
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h1>Thanh toán thất bại</h1>
            <p>Thanh toán thất bại</p>
            <p>Bạn sẽ được chuyển về trang đơn hàng sau 5 giây...</p>
        </div>
    );
} 