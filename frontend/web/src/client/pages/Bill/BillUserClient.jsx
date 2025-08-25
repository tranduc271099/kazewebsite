import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import '../../styles/BillHistory.css';
import ProfileSidebar from '../../components/ProfileSidebar';

const BillUserClient = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelingBillId, setCancelingBillId] = useState(null);
    const [sortType, setSortType] = useState('newest');
    const [dateFilter, setDateFilter] = useState('');

    const statusTabs = [
        { key: 'all', name: 'Tất cả' },
        { key: 'chờ xác nhận', name: 'Chờ xác nhận' },
        { key: 'đã xác nhận', name: 'Chờ lấy hàng' },
        { key: 'đang giao hàng', name: 'Đang giao' },
        { key: 'đã giao hàng', name: 'Hoàn thành' },
        { key: 'đã hủy', name: 'Đã hủy' },
    ];

    // Avatar handling
    let avatar = '';
    if (user?.image) {
        if (user.image.startsWith('http')) avatar = user.image;
        else if (user.image.startsWith('/uploads/')) avatar = `http://localhost:5000${user.image}`;
        else if (user.image.startsWith('/api/uploads/')) avatar = `http://localhost:5000${user.image.replace('/api', '')}`;
        else avatar = `http://localhost:5000/${user.image}`;
    } else {
        avatar = '/default-avatar.png';
    }

    useEffect(() => {
        const fetchBills = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const { data } = await axios.get('http://localhost:5000/api/bill', config);
                setBills(data);
            } catch (err) {
                setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
                console.error(err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [navigate]);

    const handleCancelOrder = (billId) => {
        setCancelingBillId(billId);
        setShowCancelModal(true);
    };

    const confirmCancelOrder = async () => {
        if (!cancelingBillId) return;
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do huỷ đơn!');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/bill/${cancelingBillId}/cancel`,
                { ly_do_huy: cancelReason },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.status === 200) {
                toast.success('Hủy đơn hàng thành công!');
                setBills(bills.map(bill => bill._id === cancelingBillId ? { ...bill, trang_thai: 'đã hủy', ly_do_huy: cancelReason } : bill));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setShowCancelModal(false);
            setCancelingBillId(null);
            setCancelReason('');
        }
    };

    const handleConfirmReceived = async (billId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/bill/${billId}/confirm-received`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.status === 200) {
                toast.success('Đã xác nhận nhận hàng!');
                setBills(bills.map(bill => bill._id === billId ? { ...bill, trang_thai: 'hoàn thành' } : bill));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi khi xác nhận nhận hàng.');
        }
    };

    const showBillDetail = (bill) => {
        setSelectedBill(bill);
        setShowDetailModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'chờ xác nhận': return '#f59e0b';
            case 'đã xác nhận': return '#3b82f6';
            case 'đang giao': return '#8b5cf6';
            case 'đã giao hàng': return '#10b981';
            case 'đã hủy': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'chờ xác nhận': 'CHỜ XÁC NHẬN',
            'đã xác nhận': 'CHỜ LẤY HÀNG',
            'đang giao hàng': 'ĐANG VẬN CHUYỂN',
            'đã giao hàng': 'GIAO HÀNG THÀNH CÔNG',
            'hoàn thành': 'ĐÃ HOÀN THÀNH',
            'đã hủy': 'ĐƠN HÀNG ĐÃ HỦY',
        };
        return statusMap[status] || status.toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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

    const filteredBills = bills.filter(bill => {
        const matchStatus = selectedStatus === 'all' || bill.trang_thai === selectedStatus;
        let matchDate = true;
        if (dateFilter) {
            const billDate = new Date(bill.ngay_tao);
            const filterDate = new Date(dateFilter);
            matchDate = billDate.toISOString().slice(0, 10) === filterDate.toISOString().slice(0, 10);
        }
        return matchStatus && matchDate;
    });

    const sortedBills = [...filteredBills].sort((a, b) => {
        if (sortType === 'newest') {
            return new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime();
        } else if (sortType === 'oldest') {
            return new Date(a.ngay_tao).getTime() - new Date(b.ngay_tao).getTime();
        } else if (sortType === 'highest') {
            return (b.tong_tien || 0) - (a.tong_tien || 0);
        } else if (sortType === 'lowest') {
            return (a.tong_tien || 0) - (b.tong_tien || 0);
        }
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBills = sortedBills.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedBills.length / itemsPerPage);

    // Xác định đơn hàng mới nhất thực sự (theo ngày tạo lớn nhất trong toàn bộ bills)
    const trulyNewestBill = bills.length > 0 ? bills.reduce((latest, bill) => new Date(bill.ngay_tao) > new Date(latest.ngay_tao) ? bill : latest, bills[0]) : null;
    const trulyNewestBillId = trulyNewestBill?._id;

    const isNewOrder = (dateString) => {
        const orderDate = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bill-history-page" style={{ background: '#f5f5f7', minHeight: '100vh', padding: '40px 0', marginTop: 80 }}>
            <div className="bill-container" style={{ display: 'flex', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
                <ProfileSidebar activePage="bill" />

                <main className="bill-main">
                    <div className="status-tabs-container">
                        {statusTabs.map(tab => (
                            <div
                                key={tab.key}
                                className={`status-tab ${selectedStatus === tab.key ? 'active' : ''}`}
                                onClick={() => { setSelectedStatus(tab.key); setCurrentPage(1); }}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>

                    {loading ? <div className="loading-state">Đang tải...</div> :
                        error ? <div className="error-state">{error}</div> :
                            currentBills.length === 0 ? (
                                <div className="bill-empty-state">
                                    <div className="bill-empty-state-icon">
                                        <i className="bi bi-receipt"></i>
                                    </div>
                                    <div className="bill-empty-state-title">Chưa có đơn hàng nào</div>
                                </div>
                            ) : (
                                <div className="order-list">
                                    {currentBills.map(bill => (
                                        <div key={bill._id} className="shopee-order-card">
                                            <div className="order-header">
                                                <span style={{ color: '#000' }}>Mã đơn hàng: {(bill.orderId || bill._id.slice(-8).toUpperCase())}</span>
                                                <span className="order-status" style={{ color: '#000' }}>{getStatusDisplay(bill.trang_thai)}</span>
                                            </div>

                                            {bill.danh_sach_san_pham.map(item => (
                                                <div key={item._id} className="product-item">
                                                    <img
                                                        src={item.san_pham_id?.images?.[0] || 'https://via.placeholder.com/150'}
                                                        alt={item.san_pham_id?.name || 'Sản phẩm'}
                                                        className="product-image"
                                                    />
                                                    <div className="product-details">
                                                        <p className="product-name" style={{ color: '#000' }}>{item.san_pham_id?.name || 'Sản phẩm không tồn tại'}</p>
                                                        <p className="product-variation">Phân loại: {item.mau_sac}, {item.kich_thuoc}</p>
                                                        <p className="product-quantity">x{item.so_luong}</p>
                                                    </div>
                                                    <span className="product-price">{formatPrice(item.gia)}</span>
                                                </div>
                                            ))}                                            <div className="order-footer">
                                                <div className="total-amount">
                                                    <span>Thành tiền:</span>
                                                    <span className="amount">{formatPrice((bill.tong_tien || 0) - (bill.discount || 0))}</span>
                                                </div>
                                                <div className="order-actions">
                                                    <button className="shopee-btn shopee-btn-secondary" onClick={() => showBillDetail(bill)}>Xem Chi Tiết</button>
                                                    {bill.trang_thai === 'chờ xác nhận' && (
                                                        <button className="shopee-btn shopee-btn-primary" onClick={() => handleCancelOrder(bill._id)}>Hủy Đơn</button>
                                                    )}
                                                    {bill.trang_thai === 'đã giao hàng' && (
                                                        <button className="shopee-btn shopee-btn-primary" onClick={() => handleConfirmReceived(bill._id)}>Đã Nhận Hàng</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    {/* Pagination here if needed */}
                </main>
            </div>

            {showDetailModal && selectedBill && (
                <div className="bill-detail-modal" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content order-detail-modern" onClick={e => e.stopPropagation()} style={{ maxWidth: 1050, minWidth: 800 }}>
                        {/* Header */}
                        <div className="order-detail-header">
                            <span>Chi tiết đơn hàng <b>#{selectedBill.orderId || selectedBill._id.slice(-8).toUpperCase()}</b></span>
                            <span style={{ fontSize: '1rem', color: '#888', fontWeight: 400, marginLeft: 'auto', marginRight: 24 }}>
                                Ngày đặt hàng: {formatDate(selectedBill.ngay_tao)}
                            </span>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div className="order-detail-body">
                            {/* Bên trái: Sản phẩm và tổng */}
                            <div className="order-detail-left order-detail-left-border">
                                {/* Danh sách sản phẩm */}
                                {selectedBill.danh_sach_san_pham.map((item, idx) => (
                                    <div className="order-detail-product-row order-detail-product-row-large" key={item.san_pham_id?._id + idx || idx}>
                                        <img className="order-detail-product-img" src={item.san_pham_id?.images?.[0] || 'https://via.placeholder.com/80'} alt={item.san_pham_id?.name || 'Sản phẩm'} />
                                        <div className="order-detail-product-info">
                                            <div className="order-detail-product-name">{item.san_pham_id?.name || 'Sản phẩm không tồn tại'}</div>
                                            <div className="order-detail-product-variant">
                                                Phân loại: {item.kich_thuoc} - {item.mau_sac} &nbsp;|&nbsp; SL: {item.so_luong}
                                            </div>
                                            <div className="order-detail-product-variant-price" style={{ fontSize: 14, color: '#2563eb', marginTop: 2 }}>
                                                Giá biến thể: {formatPrice(item.gia)}
                                            </div>
                                            <div className="order-detail-product-variant-total" style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                                                Tổng: {formatPrice(item.gia * item.so_luong)}
                                            </div>
                                        </div>
                                        <div className="order-detail-product-price">{formatPrice(item.gia)}</div>
                                    </div>
                                ))}
                                <hr className="order-detail-hr order-detail-hr-bold" />
                                {/* Bảng tạm tính, phí ship, tổng cộng */}
                                <div className="order-detail-summary-row" style={{ marginTop: 24 }}>
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(selectedBill.danh_sach_san_pham.reduce((sum, item) => sum + (item.gia * item.so_luong), 0))}</span>
                                </div>
                                <div className="order-detail-summary-row">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatPrice(selectedBill.shippingFee || 0)}</span>
                                </div>
                                <div className="order-detail-summary-row">
                                    <span>Giảm giá</span>
                                    <span style={{ color: '#10b981' }}>-{formatPrice(selectedBill.discount || 0)}</span>
                                </div>
                                <div className="order-detail-summary-row order-detail-summary-total">
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice((selectedBill.tong_tien || 0) - (selectedBill.discount || 0))}</span>
                                </div>
                            </div>
                            {/* Bên phải: Box thông tin trạng thái, giao hàng, thanh toán */}
                            <div className="order-detail-right-box">
                                <div className="order-detail-status">TRẠNG THÁI ĐƠN HÀNG<br /><span style={{ color: '#000' }}>{getStatusDisplay(selectedBill.trang_thai)}</span></div>
                                <div className="order-detail-section">
                                    <div className="order-detail-section-title">THÔNG TIN GIAO HÀNG</div>
                                    <div><b style={{ color: '#000' }}>Tên người đặt:</b> <span style={{ color: '#000' }}>{selectedBill.dia_chi_giao_hang?.ho_ten || selectedBill.nguoi_dung_id?.name || '---'}</span></div>
                                    <div><b style={{ color: '#000' }}>Số điện thoại:</b> <span style={{ color: '#000' }}>{selectedBill.dia_chi_giao_hang?.so_dien_thoai || selectedBill.nguoi_dung_id?.phone || '---'}</span></div>
                                    <div><b style={{ color: '#000' }}>Email:</b> <span style={{ color: '#000' }}>{selectedBill.dia_chi_giao_hang?.email || selectedBill.nguoi_dung_id?.email || '---'}</span></div>
                                    <div><b style={{ color: '#000' }}>Địa chỉ giao hàng:</b> <span style={{ color: '#000' }}>
                                      {selectedBill.dia_chi_giao_hang?.dia_chi_chi_tiet && `${selectedBill.dia_chi_giao_hang.dia_chi_chi_tiet}, `}
                                      {selectedBill.dia_chi_giao_hang?.phuong_xa && `${selectedBill.dia_chi_giao_hang.phuong_xa}, `}
                                      {selectedBill.dia_chi_giao_hang?.quan_huyen && `${selectedBill.dia_chi_giao_hang.quan_huyen}, `}
                                      {selectedBill.dia_chi_giao_hang?.tinh_thanh || '---'}
                                    </span></div>
                                    {selectedBill.ghi_chu && (
                                        <div style={{ marginTop: 6 }}><b>Ghi chú:</b> {selectedBill.ghi_chu}</div>
                                    )}
                                    {selectedBill.trang_thai === 'đã hủy' && (
                                        <>
                                            <div style={{ marginTop: 6, color: '#ef4444' }}><b>Lý do hủy:</b> {selectedBill.ly_do_huy || 'Không có lý do'}</div>
                                            <div><b>Người hủy:</b> {selectedBill.nguoi_huy?.id?.name || 'Không rõ'}{selectedBill.nguoi_huy?.loai ? ` (${selectedBill.nguoi_huy.loai})` : ''}</div>
                                        </>
                                    )}
                                </div>
                                <div className="order-detail-section">
                                    <div className="order-detail-section-title" style={{ color: '#000' }}>THANH TOÁN</div>
                                    <div style={{ color: '#000' }}>Phương thức: {selectedBill.phuong_thuc_thanh_toan || '---'}</div>
                                    <div style={{ color: '#000' }}>Trạng thái thanh toán: <span style={{ color: selectedBill.thanh_toan === 'đã thanh toán' ? '#10b981' : selectedBill.thanh_toan === 'chưa thanh toán' ? '#f59e0b' : '#000', fontWeight: 600 }}>{selectedBill.thanh_toan || '---'}</span></div>
                                    <div style={{ color: '#000' }}>Trạng thái đơn hàng: <span style={{ color: selectedBill.trang_thai === 'đã hoàn thành' || selectedBill.trang_thai === 'hoàn thành' ? '#10b981' : selectedBill.trang_thai === 'đã hủy' ? '#ef4444' : selectedBill.trang_thai === 'chờ xác nhận' ? '#2563eb' : '#000' }}>{getStatusDisplay(selectedBill.trang_thai)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showCancelModal && (
                <div className="cancel-modal">
                    <div className="cancel-modal-content">
                        <h4 style={{ fontWeight: 600, marginBottom: 15 }}>Lý do hủy đơn hàng</h4>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Nhập lý do..." rows={4} />
                        <div className="cancel-modal-actions">
                            <button className="shopee-btn shopee-btn-secondary" onClick={() => setShowCancelModal(false)}>Đóng</button>
                            <button className="shopee-btn shopee-btn-primary" onClick={confirmCancelOrder}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillUserClient;