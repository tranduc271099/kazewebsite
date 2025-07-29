import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PaymentFailure() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const message = params.get('message') || 'Thanh toán thất bại!';
    const responseCode = params.get('responseCode');
    
    const [orderInfo, setOrderInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOrderCancelled, setIsOrderCancelled] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderInfo();
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const fetchOrderInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/bill/order/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrderInfo(response.data);
            
            // Kiểm tra xem đơn hàng có bị hủy không
            if (response.data.trang_thai === 'đã hủy') {
                setIsOrderCancelled(true);
            }
        } catch (error) {
            console.error('Error fetching order info:', error);
            toast.error('Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: 50 }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    return (
        <div style={{ 
            textAlign: 'center', 
            marginTop: 50, 
            maxWidth: 600, 
            margin: '50px auto', 
            padding: '0 20px' 
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '40px 30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
            }}>
                {/* Icon thất bại */}
                <div style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }}>
                    <i className="bi bi-x-circle-fill"></i>
                </div>

                <h1 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '28px' }}>
                    {isOrderCancelled ? 'Đơn hàng đã bị hủy' : 'Thanh toán thất bại'}
                </h1>

                <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
                    {message}
                </p>

                {responseCode && (
                    <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
                        Mã lỗi: {responseCode}
                    </p>
                )}

                {/* Thông tin đơn hàng */}
                {orderInfo && (
                    <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '24px',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ marginBottom: '16px', color: '#374151' }}>Thông tin đơn hàng</h4>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Mã đơn hàng:</strong> {orderInfo.orderId}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Tổng tiền:</strong> {formatPrice((orderInfo.tong_tien || 0) - (orderInfo.discount || 0))}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Phương thức thanh toán:</strong> {orderInfo.phuong_thuc_thanh_toan}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>Trạng thái:</strong> 
                            <span style={{ 
                                color: orderInfo.thanh_toan === 'đã thanh toán' ? '#10b981' : 
                                       orderInfo.trang_thai === 'đã hủy' ? '#ef4444' : '#f59e0b',
                                fontWeight: '600',
                                marginLeft: '8px'
                            }}>
                                {orderInfo.trang_thai === 'đã hủy' ? 'Đã hủy' : orderInfo.thanh_toan}
                            </span>
                        </div>
                        {orderInfo.trang_thai === 'đã hủy' && orderInfo.ly_do_huy && (
                            <div style={{ marginTop: '8px', color: '#ef4444' }}>
                                <strong>Lý do hủy:</strong> {orderInfo.ly_do_huy}
                            </div>
                        )}
                    </div>
                )}

                {/* Thông báo đặc biệt cho đơn hàng đã hủy */}
                {isOrderCancelled && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: '#dc2626'
                    }}>
                        <p style={{ margin: 0, fontWeight: '600' }}>
                            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '8px' }}></i>
                            Đơn hàng đã được hủy tự động do thanh toán không thành công.
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                            Bạn có thể tạo đơn hàng mới nếu muốn mua sản phẩm.
                        </p>
                    </div>
                )}

                {/* Các nút điều hướng */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/bill')}
                        style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Xem đơn hàng
                    </button>
                    
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
} 