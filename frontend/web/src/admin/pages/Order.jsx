import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Order.css';

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/bill/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data.bills || []);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch (err) {
            setError('Không thể cập nhật trạng thái đơn hàng');
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="content-inner">
            <div className="order-container">
                <div className="order-header">
                    <h2>Quản lý đơn hàng</h2>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày đặt</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.user?.name}</td>
                                    <td>{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className="form-control"
                                        >
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="processing">Đang xử lý</option>
                                            <option value="shipped">Đang giao hàng</option>
                                            <option value="delivered">Đã giao hàng</option>
                                            <option value="cancelled">Đã hủy</option>
                                        </select>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => window.location.href = `/orders/${order._id}`}
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Order; 