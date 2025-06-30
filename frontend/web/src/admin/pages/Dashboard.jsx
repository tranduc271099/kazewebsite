import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import '../styles/Dashboard.css';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await axios.get(`http://localhost:5000/api/dashboard/stats?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDashboardData(response.data);
        } catch (err) {
            setError('Không thể tải dữ liệu dashboard');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
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
            'chờ xác nhận': isDark ? 'badge-warning-dark' : 'badge-warning',
            'đã xác nhận': isDark ? 'badge-info-dark' : 'badge-info',
            'đang giao hàng': isDark ? 'badge-primary-dark' : 'badge-primary',
            'đã giao hàng': isDark ? 'badge-success-dark' : 'badge-success',
            'đã nhận hàng': isDark ? 'badge-success-dark' : 'badge-success',
            'hoàn thành': isDark ? 'badge-success-dark' : 'badge-success',
            'đã hủy': isDark ? 'badge-danger-dark' : 'badge-danger'
        };
        return statusClasses[status] || (isDark ? 'badge-secondary-dark' : 'badge-secondary');
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
        background: isDark
            ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        background: isDark ? theme.palette.background.default : '#f8f9fa',
        color: theme.palette.text.primary,
        padding: 12,
        textAlign: 'left',
        fontWeight: 600,
        borderBottom: `2px solid ${theme.palette.divider}`,
    };
    const tdStyle = {
        padding: 12,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
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
            <Paper elevation={2} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h2 style={{ color: theme.palette.text.primary, margin: 0 }}>Bảng điều khiển</h2>
                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 12, color: theme.palette.text.secondary, fontWeight: 500 }}>Từ ngày:</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            style={{ padding: '8px 12px', border: `1px solid ${theme.palette.divider}`, borderRadius: 5, fontSize: 14, background: theme.palette.background.default, color: theme.palette.text.primary }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 12, color: theme.palette.text.secondary, fontWeight: 500 }}>Đến ngày:</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            style={{ padding: '8px 12px', border: `1px solid ${theme.palette.divider}`, borderRadius: 5, fontSize: 14, background: theme.palette.background.default, color: theme.palette.text.primary }}
                        />
                    </div>
                    <Button variant="outlined" color="secondary" onClick={clearDateFilter}>Xóa filter</Button>
                </div>
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
                <div style={{ minHeight: 250, padding: '0 16px 16px 16px' }}>
                    {dashboardData.dailyStats.length > 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'end',
                            gap: 20,
                            height: 200,
                            width: '100%',
                        }}>
                            {dashboardData.dailyStats.map((day, index) => (
                                <div key={day._id} style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 10,
                                    minWidth: 60,
                                }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            background: isDark
                                                ? 'linear-gradient(135deg, #42a5f5 0%, #7e57c2 100%)'
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '5px 5px 0 0',
                                            minHeight: 10,
                                            height: `${(day.revenue / Math.max(...dashboardData.dailyStats.map(d => d.revenue))) * 200}px`,
                                            transition: 'all 0.3s ease',
                                        }}
                                    ></div>
                                    <div style={{ textAlign: 'center', fontSize: 12 }}>
                                        <div style={{ color: theme.palette.text.secondary }}>{formatDate(day._id)}</div>
                                        <div style={{ color: theme.palette.text.primary, fontWeight: 600 }}>{formatCurrency(day.revenue)}</div>
                                    </div>
                                </div>
                            ))}
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
                                <div key={user.userId} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15, background: isDark ? '#232526' : '#f8f9fa', borderRadius: 8 }}>
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
                                <div key={product.productId} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15, background: isDark ? '#232526' : '#f8f9fa', borderRadius: 8 }}>
                                    <div style={{ ...statIconStyle, width: 30, height: 30, fontSize: 16, marginRight: 10 }}>#{index + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: 5 }}>{product.productName}</div>
                                        <div style={{ display: 'flex', gap: 15, fontSize: 12, color: theme.palette.text.secondary }}>
                                            <span>{product.totalQuantity} sản phẩm</span>
                                            <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>{formatCurrency(product.totalRevenue)}</span>
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
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Khách hàng</th>
                                <th style={thStyle}>Tổng tiền</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={thStyle}>Ngày đặt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.latestOrders.length > 0 ? (
                                dashboardData.latestOrders.map(order => (
                                    <tr key={order.orderId}>
                                        <td style={tdStyle}>{order.userName}</td>
                                        <td style={tdStyle}>{formatCurrency(order.totalAmount)}</td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyles[getStatusBadgeClass(order.status)]}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ ...tdStyle, color: theme.palette.text.secondary }}>Không có đơn hàng nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Paper>
        </div>
    );
};

export default Dashboard; 