import { useLocation } from 'react-router-dom';

export default function PaymentFailure() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const message = params.get('message') || 'Thanh toán thất bại!';
    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h2>Thanh toán thất bại</h2>
            <p>{message}</p>
        </div>
    );
} 