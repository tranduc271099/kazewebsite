import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import '../styles/Dashboard.css';

const socket = io('http://localhost:5000');

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        overview: {
            totalOrders: 0,
            totalRevenue: 0,
            completedOrders: 0,
            completedRevenue: 0
        },
        dailyStats: [],
        topUsers: [],
        topProducts: [],
        latestOrders: []
    });
    const [latestOrders, setLatestOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    // Order management states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const theme = useTheme();

    useEffect(() => {
        fetchDashboardData();
        fetchLatestOrders();
    }, [dateRange]);

    useEffect(() => {
        // Listen for new chat sessions
        socket.on('new_chat_session', (data) => {
            toast(`Có cuộc trò chuyện mới từ: ${data.username}`, {
                icon: '💬',
            });
        });

        // Listen for stock updates from client cart operations
        socket.on('client_cart_update', (data) => {
            toast(`${data.username} đã ${data.action} sản phẩm: ${data.productName}`, {
                icon: 'ℹ️',
            });
            // Refresh dashboard data to get updated stock
            fetchDashboardData();
        });

        // Listen for order creation
        socket.on('order_created', (data) => {
            toast.success(`${data.username} đã tạo đơn hàng #${data.orderId} - ${data.productCount} sản phẩm - ${data.totalAmount.toLocaleString('vi-VN')}₫`);
            // Refresh dashboard data to get updated stats
            fetchDashboardData();
            fetchLatestOrders();
        });

        // Listen for stock reduction from orders
        socket.on('stock_reduced', (data) => {
            toast(`${data.username} đã giảm tồn kho: ${data.productName} (${data.color} - ${data.size}) -${data.quantity}`, {
                icon: '📦',
            });
            // Refresh dashboard data to get updated stock
            fetchDashboardData();
        });

        // Listen for stock updates
        const handleStockUpdate = async (event) => {
            if (event.detail.productId) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/products/${event.detail.productId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Update topProducts with new stock info
                    setDashboardData(prev => ({
                        ...prev,
                        topProducts: prev.topProducts.map(product =>
                            product.productId === event.detail.productId ? res.data : product
                        )
                    }));
                } catch (error) {
                    console.error('Lỗi khi cập nhật thông tin sản phẩm:', error);
                }
            }
        };

        window.addEventListener('stockUpdated', handleStockUpdate);

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off('new_chat_session');
            socket.off('client_cart_update');
            socket.off('order_created');
            socket.off('stock_reduced');
            window.removeEventListener('stockUpdated', handleStockUpdate);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);
            // Nếu không có filter ngày, lấy 7 ngày gần nhất
            if (!dateRange.startDate && !dateRange.endDate) params.append('lastDays', 7);

            const response = await axios.get(`http://localhost:5000/api/dashboard/stats?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Dashboard data:', response.data);
            setDashboardData(response.data);
        } catch (err) {
            setError('Không thể tải dữ liệu dashboard');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/bill/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Latest orders response:', res.data);
            // Lấy 5 đơn hàng mới nhất
            const latest5Orders = res.data.bills.slice(0, 5);
            setLatestOrders(latest5Orders);
        } catch (err) {
            console.error('Error fetching latest orders:', err);
            setLatestOrders([]);
        }
    };

    // Order management functions
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bill/${orderId}/status`, { trang_thai: newStatus }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDashboardData();
            fetchLatestOrders();
            setShowModal(false);
            toast.success(`Đơn hàng đã được cập nhật thành "${getStatusDisplay(newStatus)}".`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const handleShowDetail = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/bill/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedOrder(res.data);
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching order details:', err);
            // Fallback: sử dụng dữ liệu từ latestOrders nếu API lỗi
            const orderFromLatest = latestOrders.find(order => order._id === orderId);
            if (orderFromLatest) {
                setSelectedOrder(orderFromLatest);
                setShowModal(true);
            } else {
                alert(err.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng');
            }
        }
    };

    const handleAdminCancelOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
        setNewStatus('đã hủy');
        setShowCancelModal(true);
    };

    const confirmAdminCancelOrder = async () => {
        if (!selectedOrder) return;
        if (!cancelReason.trim()) {
            alert('Vui lòng nhập lý do huỷ đơn!');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bill/${selectedOrder._id}/status`, { trang_thai: 'đã hủy', ly_do_huy: cancelReason }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDashboardData();
            fetchLatestOrders();
            setShowModal(false);
            toast.success('Đơn hàng đã được hủy thành công!');
        } catch (err) {
            alert('Lỗi khi huỷ đơn hàng');
        } finally {
            setShowCancelModal(false);
            setCancelReason('');
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'chờ xác nhận': return 'Chờ xác nhận';
            case 'đã xác nhận': return 'Đã xác nhận';
            case 'đang giao hàng': return 'Đang giao';
            case 'đã giao hàng': return 'Đã giao';
            case 'đã nhận hàng': return 'Đã nhận';
            case 'hoàn thành': return 'Hoàn thành';
            case 'đã hủy': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusDisplayForModal = (status) => {
        switch (status) {
            case 'chờ xác nhận': return 'Chờ xác nhận';
            case 'đã xác nhận': return 'Xác nhận';
            case 'đang giao hàng': return 'Đang giao';
            case 'đã giao hàng': return 'Đã giao';
            case 'đã nhận hàng': return 'Đã nhận';
            case 'hoàn thành': return 'Hoàn thành';
            case 'đã hủy': return 'Hủy';
            default: return status;
        }
    };

    const getNextStatusOptions = (currentStatus) => {
        switch (currentStatus) {
            case 'chờ xác nhận':
                return ['đã xác nhận', 'đã hủy'];
            case 'đã xác nhận':
                return ['đang giao hàng', 'đã hủy'];
            case 'đang giao hàng':
                return ['đã giao hàng'];
            // Không cho phép admin chuyển sang 'hoàn thành' hoặc 'đã nhận hàng'
            default:
                return [];
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'chờ xác nhận': return '#f59e0b';
            case 'đã xác nhận': return '#3b82f6';
            case 'đang giao hàng': return '#8b5cf6';
            case 'đã giao hàng': return '#10b981';
            case 'đã nhận hàng': return '#3b82f6';
            case 'hoàn thành': return '#10b981';
            case 'đã hủy': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const parseAddress = (address) => {
        if (!address) return { street: '', ward: '', district: '', city: '' };
        const parts = address.split(',').map(part => part.trim());
        if (parts.length >= 4) {
            return {
                street: parts[0],
                ward: parts[1],
                district: parts[2],
                city: parts[3]
            };
        }
        return { street: address, ward: '', district: '', city: '' };
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'chờ xác nhận': 'badge-warning',
            'đã xác nhận': 'badge-info',
            'đang giao hàng': 'badge-primary',
            'đã giao hàng': 'badge-success',
            'đã nhận hàng': 'badge-success',
            'hoàn thành': 'badge-success',
            'đã hủy': 'badge-danger'
        };
        return statusClasses[status] || 'badge-secondary';
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearDateFilter = () => {
        setDateRange({
            startDate: '',
            endDate: ''
        });
    };

    // Style helpers
    const cardStyle = {
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[2],
        borderRadius: 10,
        padding: 25,
        marginBottom: 20,
        transition: 'background 0.2s, color 0.2s',
    };
    const statIconStyle = {
        fontSize: 40,
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        color: '#fff',
        marginRight: 20,
    };
    const statNumberStyle = {
        fontSize: 24,
        fontWeight: 700,
        color: theme.palette.text.primary,
        margin: 0,
    };
    const statTitleStyle = {
        margin: 0,
        fontSize: 14,
        color: theme.palette.text.secondary,
        fontWeight: 500,
    };
    const sectionTitleStyle = {
        color: theme.palette.text.primary,
        fontSize: 18,
        fontWeight: 600,
        margin: '0 0 20px 0',
    };
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        color: theme.palette.text.primary,
        background: theme.palette.background.paper,
    };
    const thStyle = {
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: '12px 8px',
        textAlign: 'left',
        fontWeight: 600,
        borderBottom: `2px solid ${theme.palette.divider}`,
        fontSize: '14px',
        verticalAlign: 'middle'
    };
    const tdStyle = {
        padding: '12px 8px',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        fontSize: '14px',
        verticalAlign: 'middle'
    };
    const badgeBase = {
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        display: 'inline-block',
    };
    const badgeStyles = {
        'badge-warning': { ...badgeBase, background: '#fff3cd', color: '#856404' },
        'badge-info': { ...badgeBase, background: '#d1ecf1', color: '#0c5460' },
        'badge-primary': { ...badgeBase, background: '#cce5ff', color: '#004085' },
        'badge-success': { ...badgeBase, background: '#d4edda', color: '#155724' },
        'badge-danger': { ...badgeBase, background: '#f8d7da', color: '#721c24' },
        'badge-secondary': { ...badgeBase, background: '#e2e3e5', color: '#383d41' },
        // Dark mode
        'badge-warning-dark': { ...badgeBase, background: '#665c00', color: '#fffbe6' },
        'badge-info-dark': { ...badgeBase, background: '#00394d', color: '#e0f7fa' },
        'badge-primary-dark': { ...badgeBase, background: '#1a237e', color: '#bbdefb' },
        'badge-success-dark': { ...badgeBase, background: '#003300', color: '#b9f6ca' },
        'badge-danger-dark': { ...badgeBase, background: '#7f0000', color: '#ffcdd2' },
        'badge-secondary-dark': { ...badgeBase, background: '#424242', color: '#fff' },
    };

    if (loading) return <div style={{ color: theme.palette.text.primary, textAlign: 'center', margin: 40 }}>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ background: '#f8d7da', color: '#721c24', padding: 15, borderRadius: 5, margin: 20, textAlign: 'center' }}>{error}</div>;

    return (
        <div style={{ padding: 20, background: theme.palette.background.default, minHeight: '100vh', transition: 'background 0.2s' }}>
            {/* Header với filter ngày */}
            <Paper elevation={2} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 20 }}>
                <h2 style={{ color: theme.palette.text.primary, margin: 0 }}>Bảng điều khiển</h2>
                <form
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        background: '#232526',
                        padding: '10px 18px',
                        borderRadius: 8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    }}
                    onSubmit={e => e.preventDefault()}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                        <label style={{ fontSize: 13, color: theme.palette.text.secondary, fontWeight: 500, marginBottom: 2 }}>Từ ngày</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            style={{
                                padding: '7px 12px',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 5,
                                fontSize: 14,
                                background: theme.palette.background.default,
                                color: theme.palette.text.primary,
                                minWidth: 120
                            }}
                        />
                    </div>
                    <span style={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: 16, margin: '0 4px' }}>–</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                        <label style={{ fontSize: 13, color: theme.palette.text.secondary, fontWeight: 500, marginBottom: 2 }}>Đến ngày</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            style={{
                                padding: '7px 12px',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 5,
                                fontSize: 14,
                                background: theme.palette.background.default,
                                color: theme.palette.text.primary,
                                minWidth: 120
                            }}
                        />
                    </div>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={clearDateFilter}
                        style={{
                            marginLeft: 12,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            padding: '8px 18px',
                            borderRadius: 6,
                            boxShadow: 'none',
                            textTransform: 'none',
                        }}
                    >
                        Xóa lọc
                    </Button>
                </form>
            </Paper>

            {/* Thống kê tổng quan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
                <Paper elevation={2} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={statIconStyle}>📊</div>
                        <div>
                            <h3 style={statTitleStyle}>Tổng đơn hàng</h3>
                            <p style={statNumberStyle}>{dashboardData.overview.totalOrders}</p>
                        </div>
                    </div>
                </Paper>
                <Paper elevation={2} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={statIconStyle}>💰</div>
                        <div>
                            <h3 style={statTitleStyle}>Tổng doanh thu</h3>
                            <p style={statNumberStyle}>{formatCurrency(dashboardData.overview.totalRevenue)}</p>
                        </div>
                    </div>
                </Paper>
                <Paper elevation={2} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={statIconStyle}>✅</div>
                        <div>
                            <h3 style={statTitleStyle}>Đơn hoàn thành</h3>
                            <p style={statNumberStyle}>{dashboardData.overview.completedOrders}</p>
                        </div>
                    </div>
                </Paper>
                <Paper elevation={2} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={statIconStyle}>💵</div>
                        <div>
                            <h3 style={statTitleStyle}>Doanh thu hoàn thành</h3>
                            <p style={statNumberStyle}>{formatCurrency(dashboardData.overview.completedRevenue)}</p>
                        </div>
                    </div>
                </Paper>
            </div>

            {/* Biểu đồ doanh thu theo ngày */}
            <Paper elevation={2} style={{ ...cardStyle, marginBottom: 30 }}>
                <div style={{ padding: '16px 0 8px 0' }}>
                    <h3 style={{
                        ...sectionTitleStyle,
                        margin: 0,
                        padding: 0,
                        textAlign: 'left',
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                    }}>
                        Doanh thu theo ngày
                    </h3>
                </div>
                <div style={{ minHeight: 250, padding: '0 16px 24px 16px' }}>
                    {dashboardData.dailyStats.length > 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 40, // tăng khoảng cách giữa các cột
                            height: 200,
                            width: '100%',
                            justifyContent: 'center', // căn giữa các cột
                            paddingBottom: 16,
                        }}>
                            {dashboardData.dailyStats.map((day, index) => {
                                const maxRevenue = Math.max(...dashboardData.dailyStats.map(d => d.revenue));
                                const barHeight = maxRevenue > 0 ? (day.revenue / maxRevenue) * 140 + 10 : 10;
                                return (
                                    <div key={day._id} style={{
                                        flex: '0 0 60px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minWidth: 60,
                                    }}>
                                        <div style={{
                                            width: 36,
                                            height: barHeight,
                                            background: 'linear-gradient(135deg, #42a5f5 0%, #7e57c2 100%)',
                                            borderRadius: '8px 8px 0 0',
                                            transition: 'all 0.3s ease',
                                            marginBottom: 8,
                                            boxShadow: '0 2px 8px rgba(66,165,245,0.12)'
                                        }}></div>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            marginTop: 0,
                                            marginBottom: 0,
                                        }}>
                                            <span style={{
                                                color: theme.palette.text.primary,
                                                fontWeight: 700,
                                                fontSize: 15,
                                                lineHeight: 1.2,
                                                textAlign: 'center',
                                                display: 'block',
                                            }}>
                                                {day.revenue.toLocaleString('vi-VN')}
                                                <span style={{
                                                    fontWeight: 400,
                                                    fontSize: 13,
                                                    marginLeft: 2,
                                                    color: theme.palette.text.primary,
                                                }}>₫</span>
                                            </span>
                                            <span style={{
                                                marginTop: 4,
                                                color: theme.palette.text.secondary,
                                                fontSize: 13,
                                                fontWeight: 500,
                                                textAlign: 'center',
                                                display: 'block',
                                            }}>
                                                {formatDate(day._id)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: theme.palette.text.secondary }}>Không có dữ liệu doanh thu</p>
                    )}
                </div>
            </Paper>

            {/* Top users và products */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 30 }}>
                <Paper elevation={2} style={cardStyle}>
                    <h3 style={sectionTitleStyle}>Top 3 khách hàng mua nhiều nhất</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {dashboardData.topUsers.length > 0 ? (
                            dashboardData.topUsers.map((user, index) => (
                                <div key={user.userId} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15, background: '#232526', borderRadius: 8 }}>
                                    <div style={{ ...statIconStyle, width: 30, height: 30, fontSize: 16, marginRight: 10 }}>#{index + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: 5 }}>{user.userName}</div>
                                        <div style={{ display: 'flex', gap: 15, fontSize: 12, color: theme.palette.text.secondary }}>
                                            <span>{user.orderCount} đơn hàng</span>
                                            <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>{formatCurrency(user.totalSpent)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: theme.palette.text.secondary }}>Không có dữ liệu khách hàng</p>
                        )}
                    </div>
                </Paper>

                <Paper elevation={2} style={cardStyle}>
                    <h3 style={sectionTitleStyle}>Top 3 sản phẩm bán chạy nhất</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        {dashboardData.topProducts.length > 0 ? (
                            dashboardData.topProducts.map((product, index) => (
                                <div key={product.productId} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15, background: '#232526', borderRadius: 8 }}>
                                    <div style={{ ...statIconStyle, width: 30, height: 30, fontSize: 16, marginRight: 10 }}>#{index + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: 5 }}>{product.productName}</div>
                                        <div style={{ display: 'flex', gap: 15, fontSize: 12, color: theme.palette.text.secondary }}>
                                            <span>{product.totalQuantity} sản phẩm</span>
                                            <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>{formatCurrency(product.totalRevenue)}</span>
                                            <span style={{
                                                color: product.stock > 10 ? theme.palette.success.main :
                                                    product.stock > 0 ? theme.palette.warning.main :
                                                        theme.palette.error.main,
                                                fontWeight: 600
                                            }}>
                                                Tồn kho: {product.stock || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: theme.palette.text.secondary }}>Không có dữ liệu sản phẩm</p>
                        )}
                    </div>
                </Paper>
            </div>

            {/* Đơn hàng mới nhất */}
            <Paper elevation={2} style={cardStyle}>
                <h3 style={sectionTitleStyle}>Đơn hàng mới nhất</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        ...tableStyle,
                        borderCollapse: 'collapse',
                        borderSpacing: 0,
                        width: '100%',
                        minWidth: '800px',
                        tableLayout: 'fixed'
                    }}>
                        <thead>
                            <tr>
                                <th style={{
                                    ...thStyle,
                                    width: '12%',
                                    minWidth: '100px',
                                    textAlign: 'center',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Mã đơn
                                </th>
                                <th style={{
                                    ...thStyle,
                                    width: '18%',
                                    minWidth: '120px',
                                    textAlign: 'left',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Khách hàng
                                </th>
                                <th style={{
                                    ...thStyle,
                                    width: '12%',
                                    minWidth: '100px',
                                    textAlign: 'center',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    SĐT
                                </th>
                                <th style={{
                                    ...thStyle,
                                    width: '18%',
                                    minWidth: '140px',
                                    textAlign: 'center',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Ngày đặt
                                </th>
                                <th style={{
                                    ...thStyle,
                                    width: '15%',
                                    minWidth: '120px',
                                    textAlign: 'center',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Trạng thái
                                </th>
                                <th style={{
                                    ...thStyle,
                                    width: '15%',
                                    minWidth: '120px',
                                    textAlign: 'right',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Tổng tiền
                                </th>
                                <th style={{
                                    ...thStyle,
                                    width: '10%',
                                    minWidth: '100px',
                                    textAlign: 'center',
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {console.log('Latest orders:', latestOrders)}
                            {latestOrders && latestOrders.length > 0 ? (
                                latestOrders.map(order => (
                                    <tr key={order._id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                                        <td style={{
                                            ...tdStyle,
                                            textAlign: 'center',
                                            fontWeight: 500
                                        }}>
                                            #{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}
                                        </td>
                                        <td style={{
                                            ...tdStyle,
                                            maxWidth: '120px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            textAlign: 'left'
                                        }}>
                                            {order.nguoi_dung_id?.name || 'Ẩn danh'}
                                        </td>
                                        <td style={{
                                            ...tdStyle,
                                            textAlign: 'center'
                                        }}>
                                            {order.nguoi_dung_id?.phone || '---'}
                                        </td>
                                        <td style={{
                                            ...tdStyle,
                                            textAlign: 'center'
                                        }}>
                                            {order.ngay_tao ? new Date(order.ngay_tao).toLocaleString('vi-VN') : '---'}
                                        </td>
                                        <td style={{
                                            ...tdStyle,
                                            textAlign: 'center'
                                        }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: 6,
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                display: 'inline-block',
                                                background: getStatusColor(order.trang_thai),
                                                color: '#fff',
                                                minWidth: '80px',
                                                textAlign: 'center'
                                            }}>
                                                {getStatusDisplay(order.trang_thai)}
                                            </span>
                                        </td>
                                        <td style={{
                                            ...tdStyle,
                                            color: '#2563eb',
                                            fontWeight: 600,
                                            textAlign: 'right'
                                        }}>
                                            {formatCurrency(order.tong_tien)}
                                        </td>
                                        <td style={{
                                            ...tdStyle,
                                            textAlign: 'center'
                                        }}>
                                            <button
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 6,
                                                    border: '1px solid #2563eb',
                                                    background: '#fff',
                                                    color: '#2563eb',
                                                    fontWeight: 600,
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    minWidth: '70px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = '#2563eb';
                                                    e.target.style.color = '#fff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = '#fff';
                                                    e.target.style.color = '#2563eb';
                                                }}
                                                onClick={() => handleShowDetail(order._id)}
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{
                                        ...tdStyle,
                                        color: theme.palette.text.secondary,
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        fontSize: '16px'
                                    }}>
                                        Không có đơn hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Paper>

            {/* Order Detail Modal */}
            {showModal && selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 32,
                        maxWidth: 700,
                        width: '95%',
                        maxHeight: '85vh',
                        overflow: 'auto',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        fontSize: '18px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 24, color: '#222', fontWeight: 700 }}>
                                Mã hóa đơn #{selectedOrder._id ? selectedOrder._id.slice(-8).toUpperCase() : 'N/A'}
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', color: '#888', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ marginBottom: 18, color: '#222', textAlign: 'left', fontSize: 18 }}>
                            <strong>Khách hàng:</strong> <span style={{ fontWeight: 500 }}>{selectedOrder.nguoi_dung_id?.name || 'Không có thông tin'}</span>
                        </div>
                        <div style={{ marginBottom: 18, color: '#222', textAlign: 'left', fontSize: 18 }}>
                            <strong>SĐT:</strong> <span style={{ fontWeight: 500 }}>{selectedOrder.nguoi_dung_id?.phone || '---'}</span>
                        </div>
                        <div style={{ marginBottom: 18, color: '#222', textAlign: 'left', fontSize: 18 }}>
                            <strong>Ngày đặt:</strong> <span style={{ fontWeight: 500 }}>{selectedOrder.ngay_tao ? formatDateTime(selectedOrder.ngay_tao) : '---'}</span>
                        </div>
                        <div style={{ marginBottom: 18, color: '#222', textAlign: 'left', fontSize: 18 }}>
                            <strong>Trạng thái:</strong> <span style={{ background: getStatusColor(selectedOrder.trang_thai || 'chờ xác nhận'), color: '#fff', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: 16 }}>
                                {selectedOrder.trang_thai === 'đã hủy' ? 'Hủy đơn hàng' : getStatusDisplayForModal(selectedOrder.trang_thai || 'chờ xác nhận')}
                            </span>
                            {selectedOrder.trang_thai === 'đã hủy' && selectedOrder.ly_do_huy && (
                                <div style={{ marginTop: 8, color: '#d32f2f', fontSize: 16 }}><strong>Lý do huỷ:</strong> {selectedOrder.ly_do_huy}</div>
                            )}
                        </div>
                        {selectedOrder.phuong_thuc_thanh_toan && (
                            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                                <strong>Phương thức thanh toán:</strong> <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: 14 }}>{selectedOrder.phuong_thuc_thanh_toan}</span>
                            </div>
                        )}
                        {selectedOrder.shippingFee !== undefined && (
                            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                                <strong>Phương thức vận chuyển:</strong> {selectedOrder.shippingFee === 0 ? 'Miễn phí (Đơn trên 300k)' : selectedOrder.shippingFee === 4990 ? 'Tiêu chuẩn (3-5 ngày)' : selectedOrder.shippingFee === 12990 ? 'Nhanh (1-2 ngày)' : `${selectedOrder.shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`}
                            </div>
                        )}
                        <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                            <strong>Trạng thái thanh toán:</strong>
                            <span style={{
                                background: selectedOrder.trang_thai === 'đã giao hàng' || selectedOrder.trang_thai === 'đã nhận hàng' || selectedOrder.trang_thai === 'hoàn thành' ? '#10b981' : '#f59e0b',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: 4,
                                marginLeft: 8,
                                fontSize: 14
                            }}>
                                {selectedOrder.trang_thai === 'đã giao hàng' || selectedOrder.trang_thai === 'đã nhận hàng' || selectedOrder.trang_thai === 'hoàn thành' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        </div>
                        <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                            Địa chỉ giao hàng:
                            <div style={{ marginTop: 4, fontSize: 14, color: '#222', textAlign: 'left' }}>
                                {selectedOrder.dia_chi_giao_hang ? (
                                    <>
                                        {parseAddress(selectedOrder.dia_chi_giao_hang).street}<br />
                                        {parseAddress(selectedOrder.dia_chi_giao_hang).ward && <span>Xã/Phường: {parseAddress(selectedOrder.dia_chi_giao_hang).ward}<br /></span>}
                                        {parseAddress(selectedOrder.dia_chi_giao_hang).district && <span>Quận/Huyện: {parseAddress(selectedOrder.dia_chi_giao_hang).district}<br /></span>}
                                        {parseAddress(selectedOrder.dia_chi_giao_hang).city && <span>Tỉnh/TP: {parseAddress(selectedOrder.dia_chi_giao_hang).city}</span>}
                                    </>
                                ) : (
                                    'Không có địa chỉ'
                                )}
                            </div>
                        </div>
                        {selectedOrder.ghi_chu && <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>Ghi chú: <span style={{ fontSize: 14 }}>{selectedOrder.ghi_chu}</span></div>}
                        <div style={{ marginBottom: 14, color: '#222' }}>Sản phẩm:</div>
                        {selectedOrder.danh_sach_san_pham && Array.isArray(selectedOrder.danh_sach_san_pham) && selectedOrder.danh_sach_san_pham.map((item, idx) => (
                            <div key={item._id || idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, borderBottom: idx < selectedOrder.danh_sach_san_pham.length - 1 ? '1px solid #eee' : 'none', paddingBottom: 10 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#f9fafb', border: '1px solid #eee', marginRight: 12, flexShrink: 0 }}>
                                    <img
                                        src={item.san_pham_id?.images && item.san_pham_id.images[0] ? (item.san_pham_id.images[0].startsWith('http') ? item.san_pham_id.images[0] : `http://localhost:5000${item.san_pham_id.images[0]}`) : 'https://via.placeholder.com/150'}
                                        alt={item.san_pham_id?.name || 'Sản phẩm'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.san_pham_id?.name || 'Không có tên'}</div>
                                    <div style={{ fontSize: 12, color: '#666' }}>SL: {item.so_luong || 0} | {item.mau_sac || '---'} | {item.kich_thuoc || '---'}</div>
                                </div>
                                <div style={{ color: '#2563eb', marginLeft: 12, fontSize: 14 }}>{((item.gia || 0) * (item.so_luong || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                            {/* Debug: Hiển thị trạng thái hiện tại và các tùy chọn */}
                            <div style={{ marginRight: 'auto', fontSize: '12px', color: '#666' }}>
                                Trạng thái hiện tại: {selectedOrder.trang_thai} |
                                Tùy chọn: {getNextStatusOptions(selectedOrder.trang_thai).join(', ')}
                            </div>
                            {getNextStatusOptions(selectedOrder.trang_thai).length > 0 &&
                                <>
                                    <strong style={{ marginRight: 'auto', fontSize: '16px' }}>Cập nhật trạng thái:</strong>
                                    {getNextStatusOptions(selectedOrder.trang_thai).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                if (status === 'đã hủy') {
                                                    handleAdminCancelOrder(selectedOrder);
                                                } else {
                                                    handleStatusChange(selectedOrder._id, status);
                                                }
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 6,
                                                background: status === 'đã hủy' ? '#ef4444' : (status === 'đã xác nhận' ? '#3b82f6' : '#10b981'),
                                                color: '#fff',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '14px',
                                            }}
                                        >
                                            {getStatusDisplayForModal(status)}
                                        </button>
                                    ))}
                                </>
                            }
                            <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', borderRadius: 6, background: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', marginLeft: getNextStatusOptions(selectedOrder.trang_thai).length > 0 ? 'initial' : 'auto' }}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320 }}>
                        <h4>Nhập lý do huỷ đơn</h4>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} style={{ width: '100%', marginBottom: 16 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="btn btn-secondary" onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>Huỷ</button>
                            <button className="btn btn-danger" onClick={confirmAdminCancelOrder}>Xác nhận huỷ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;