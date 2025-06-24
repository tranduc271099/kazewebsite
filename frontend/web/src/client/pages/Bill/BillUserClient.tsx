import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';
import '../../styles/BillHistory.css';

interface SanPhamTrongHoaDon {
    san_pham_id: {
        _id: string;
        name: string;
        images?: string[];
    };
    so_luong: number;
    gia: number;
    mau_sac: string;
    kich_thuoc: string;
    _id: string;
}

interface HoaDon {
    _id: string;
    nguoi_dung_id: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    dia_chi_giao_hang: string;
    tong_tien: number;
    phuong_thuc_thanh_toan: string;
    ghi_chu: string;
    trang_thai: string;
    ngay_tao: string;
    danh_sach_san_pham: Array<{
        _id: string;
        san_pham_id: {
            _id: string;
            name: string;
            images: string[];
        };
        so_luong: number;
        gia: number;
        mau_sac: string;
        kich_thuoc: string;
    }>;
    thanh_toan?: string;
    ly_do_huy?: string;
    nguoi_huy?: {
        id: string;
        loai: string;
    };
    shippingFee?: number;
}

const BillUserClient = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [bills, setBills] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedBill, setSelectedBill] = useState<HoaDon | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelingBillId, setCancelingBillId] = useState<string | null>(null);
    const [sortType, setSortType] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
    const [dateFilter, setDateFilter] = useState('');

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

    const handleCancelOrder = (billId: string) => {
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setShowCancelModal(false);
            setCancelingBillId(null);
            setCancelReason('');
        }
    };

    const handleConfirmReceived = async (billId: string) => {
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi khi xác nhận nhận hàng.');
        }
    };

    const showBillDetail = (bill: HoaDon) => {
        setSelectedBill(bill);
        setShowDetailModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'chờ xác nhận': return '#f59e0b';
            case 'đã xác nhận': return '#3b82f6';
            case 'đang giao': return '#8b5cf6';
            case 'đã giao': return '#10b981';
            case 'đã hủy': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const parseAddress = (address: string) => {
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

    const isNewOrder = (dateString: string) => {
        const orderDate = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="bill-history-page" style={{ background: '#f5f5f7', minHeight: '100vh', padding: '40px 0', marginTop: 80 }}>
                <div className="bill-container" style={{ display: 'flex', gap: 32, maxWidth: 1100, margin: '0 auto' }}>

                    <aside className="bill-profile-sidebar" style={{
                        width: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minHeight: 400
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%', background: '#eee', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bbb', overflow: 'hidden'
                            }}>
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ fontWeight: 600, textAlign: 'center' }}>{user?.name}</div>
                            <div style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>Quản lý đơn hàng</div>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16, textAlign: 'left' }}>
                            <li style={{ margin: '16px 0' }}>
                                <Link to="/profile" style={{ color: '#333', textDecoration: 'none' }}>Hồ Sơ</Link>
                            </li>
                            <li style={{ margin: '16px 0' }}>
                                <Link to="/change-password" style={{ color: '#333', textDecoration: 'none' }}>Đổi Mật Khẩu</Link>
                            </li>
                            <li style={{ margin: '16px 0' }}>
                                <Link to="/bill" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Đơn Mua</Link>
                            </li>
                        </ul>
                    </aside>

                    <main className="bill-main" style={{
                        flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 36, minWidth: 0
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Lịch Sử Đơn Hàng</h2>
                                <div style={{ color: '#888', cursor: 'pointer' }} onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}>
                                    Tổng cộng <span style={{ fontWeight: 600, color: '#2563eb' }}>{bills.length}</span> đơn hàng
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select 
                                    className="bill-status-select"
                                    value={selectedStatus} 
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', fontSize: 13 }}
                                >
                                    <option value="all">Tất cả đơn hàng</option>
                                    <option value="chờ xác nhận">Chờ xác nhận</option>
                                    <option value="đã xác nhận">Đã xác nhận</option>
                                    <option value="đang giao">Đang giao</option>
                                    <option value="đã giao">Đã giao</option>
                                    <option value="đã hủy">Đã hủy</option>
                                </select>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}
                                    style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', fontSize: 13 }}
                                />
                                <select
                                    value={sortType}
                                    onChange={e => { setSortType(e.target.value as any); setCurrentPage(1); }}
                                    style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ddd', fontSize: 13 }}
                                >
                                    <option value="newest">Ngày mới nhất</option>
                                    <option value="oldest">Ngày cũ nhất</option>
                                    <option value="highest">Tổng tiền cao nhất</option>
                                    <option value="lowest">Tổng tiền thấp nhất</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="bill-loading-state" style={{ textAlign: 'center', padding: '50px 0' }}>
                                <div style={{ fontSize: 16, color: '#888' }}>Đang tải...</div>
                            </div>
                        ) : error ? (
                            <div className="bill-error-state" style={{ textAlign: 'center', padding: '50px 0', color: 'red' }}>
                                {error}
                            </div>
                        ) : currentBills.length === 0 ? (
                            <div className="bill-empty-state">
                                <div className="bill-empty-state-icon">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div className="bill-empty-state-title">Chưa có đơn hàng nào</div>
                                <div className="bill-empty-state-description">Bắt đầu mua sắm để tạo đơn hàng đầu tiên</div>
                                <Link to="/" className="bill-btn-primary">
                                    Mua sắm ngay!
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {currentBills.map((bill, index) => {
                                        const addressInfo = parseAddress(bill.dia_chi_giao_hang);
                                        const isNewest = bill._id === trulyNewestBillId;
                                        return (
                                            <div key={bill._id} className="bill-card" style={{
                                                border: isNewest ? '2px solid #ff5722' : (isNewOrder(bill.ngay_tao) ? '2px solid #10b981' : '1px solid #e5e7eb'),
                                                borderRadius: 8,
                                                padding: 16,
                                                background: isNewest ? '#fffde7' : (isNewOrder(bill.ngay_tao) ? '#f0fdf4' : '#fff'),
                                                position: 'relative',
                                                boxShadow: isNewest ? '0 0 12px 2px #ff9800a0' : undefined
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                            Đơn hàng #{bill._id.slice(-8).toUpperCase()}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                                                            Ngày: {formatDate(bill.ngay_tao)}
                                                        </div>
                                                        {isNewest && (
                                                            <span style={{
                                                                background: '#ff5722',
                                                                color: '#fff',
                                                                padding: '2px 8px',
                                                                borderRadius: 4,
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 4
                                                            }}>
                                                                <span role="img" aria-label="fire">🔥</span> MỚI NHẤT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ fontSize: 12, color: '#666' }}>
                                                            {formatDate(bill.ngay_tao)}
                                                        </div>
                                                        <div className="bill-status-badge" style={{ 
                                                            backgroundColor: getStatusColor(bill.trang_thai),
                                                            color: '#fff',
                                                            padding: '4px 8px',
                                                            borderRadius: 4,
                                                            fontSize: 11,
                                                            fontWeight: 600
                                                        }}>
                                                            {bill.trang_thai}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: 12 }}>
                                                    {bill.danh_sach_san_pham && bill.danh_sach_san_pham.slice(0, 2).map((item, index) => (
                                                        <div key={item._id || index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 10,
                                                            padding: '6px 0',
                                                            borderBottom: index < bill.danh_sach_san_pham.length - 1 ? '1px solid #f3f4f6' : 'none'
                                                        }}>
                                                            <div style={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 4,
                                                                overflow: 'hidden',
                                                                background: '#f9fafb',
                                                                border: '1px solid #eee',
                                                                flexShrink: 0
                                                            }}>
                                                                <img
                                                                    src={item.san_pham_id?.images && item.san_pham_id.images[0] && (item.san_pham_id.images[0].startsWith('http') 
                                                                        ? item.san_pham_id.images[0] 
                                                                        : `http://localhost:5000${item.san_pham_id.images[0]}`)
                                                                    }
                                                                    alt={item.san_pham_id?.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = 'https://via.placeholder.com/150'; 
                                                                    }}
                                                                />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ 
                                                                    fontSize: 13, 
                                                                    fontWeight: 500,
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}>
                                                                    {item.san_pham_id?.name || 'Sản phẩm không xác định'}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: '#666' }}>
                                                                    SL: {item.so_luong} | {item.mau_sac} | {item.kich_thuoc}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#2563eb' }}>
                                                                {formatPrice(item.gia)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {bill.danh_sach_san_pham && bill.danh_sach_san_pham.length > 2 && (
                                                        <div style={{ 
                                                            fontSize: 11, 
                                                            color: '#666', 
                                                            textAlign: 'center', 
                                                            padding: '4px 0',
                                                            borderTop: '1px solid #f3f4f6'
                                                        }}>
                                                            +{bill.danh_sach_san_pham.length - 2} sản phẩm khác
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Address Info */}
                                                <div style={{ marginBottom: 12, fontSize: 12, color: '#666' }}>
                                                    <div style={{ marginBottom: 4 }}>
                                                        <strong>Địa chỉ:</strong> {addressInfo.street}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                                        {addressInfo.ward && <span><strong>Xã/Phường:</strong> {addressInfo.ward}</span>}
                                                        {addressInfo.district && <span><strong>Quận/Huyện:</strong> {addressInfo.district}</span>}
                                                        {addressInfo.city && <span><strong>Tỉnh/TP:</strong> {addressInfo.city}</span>}
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    paddingTop: 12,
                                                    borderTop: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{ fontSize: 12, color: '#666' }}>
                                                        Tổng cộng: <span style={{ fontWeight: 600, color: '#2563eb', fontSize: 14 }}>{formatPrice(bill.tong_tien)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => showBillDetail(bill)}
                                                            style={{ fontSize: 11, padding: '4px 8px' }}
                                                        >
                                                            Chi tiết
                                                        </button>
                                                        {bill.trang_thai === 'chờ xác nhận' && (
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => handleCancelOrder(bill._id)}
                                                                style={{ fontSize: 11, padding: '4px 8px' }}
                                                            >
                                                                Hủy đơn
                                                            </button>
                                                        )}
                                                        {bill.trang_thai === 'đã giao hàng' && (
                                                            <button className="btn btn-outline-success btn-sm" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleConfirmReceived(bill._id)}>
                                                                Đã nhận hàng
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        gap: 8, 
                                        marginTop: 24,
                                        paddingTop: 20,
                                        borderTop: '1px solid #e5e7eb'
                                    }}>
                                        <button 
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{ fontSize: 12, padding: '6px 12px' }}
                                        >
                                            &larr; Trước
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                                            <button
                                                key={pageNumber}
                                                className={`btn btn-sm ${currentPage === pageNumber ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => handlePageChange(pageNumber)}
                                                style={{ fontSize: 12, padding: '6px 12px', minWidth: 36 }}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                        
                                        <button 
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{ fontSize: 12, padding: '6px 12px' }}
                                        >
                                            Sau &rarr;
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Modal chi tiết đơn hàng */}
            {showDetailModal && selectedBill && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        maxWidth: 600,
                        width: '95%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 18 }}>Chi tiết đơn hàng #{selectedBill._id.slice(-8).toUpperCase()}</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                            Khách hàng: {selectedBill.nguoi_dung_id?.name}
                        </div>
                        <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                            SĐT: {selectedBill.nguoi_dung_id?.phone || '---'}
                        </div>
                        <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                            Ngày đặt: {formatDate(selectedBill.ngay_tao)}
                        </div>
                        <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                            Trạng thái: <span style={{ backgroundColor: getStatusColor(selectedBill.trang_thai), color: '#fff', padding: '4px 8px', borderRadius: 4, marginLeft: 8, fontSize: 12 }}>{selectedBill.trang_thai}</span>
                        </div>
                        {selectedBill.phuong_thuc_thanh_toan && (
                            <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                                Phương thức thanh toán: {selectedBill.phuong_thuc_thanh_toan}
                            </div>
                        )}
                        {selectedBill.shippingFee !== undefined && (
                            <div style={{ marginBottom: 16, color: '#222', textAlign: 'left', fontWeight: 500 }}>
                                <strong>Phương thức vận chuyển:</strong> {selectedBill.shippingFee === 0 ? 'Miễn phí (Đơn trên 300k)' : selectedBill.shippingFee === 4990 ? 'Tiêu chuẩn (3-5 ngày)' : selectedBill.shippingFee === 12990 ? 'Nhanh (1-2 ngày)' : `${selectedBill.shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`}
                                {selectedBill.shippingFee > 0 && (
                                    <span style={{ marginLeft: 8, color: '#e53935', fontWeight: 600 }}>
                                        ({selectedBill.shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })})
                                    </span>
                                )}
                            </div>
                        )}
                        <div style={{ marginBottom: 16, color: '#222' }}>Sản phẩm:</div>
                        {selectedBill.danh_sach_san_pham.map((item, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: index < selectedBill.danh_sach_san_pham.length - 1 ? '1px solid #eee' : 'none' }}>
                                <div style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', background: '#f9fafb', border: '1px solid #eee', marginRight: 12, flexShrink: 0 }}>
                                    <img
                                        src={item.san_pham_id?.images && item.san_pham_id.images[0] && (item.san_pham_id.images[0].startsWith('http')
                                            ? item.san_pham_id.images[0]
                                            : `http://localhost:5000${item.san_pham_id.images[0]}`)
                                        }
                                        alt={item.san_pham_id?.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: '#222', fontWeight: 500 }}>{item.san_pham_id?.name}</div>
                                    <div style={{ fontSize: 11, color: '#666' }}>
                                        SL: {item.so_luong} | {item.mau_sac} | {item.kich_thuoc}
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginLeft: 12 }}>{formatPrice(item.gia * item.so_luong)}</div>
                            </div>
                        ))}
                        <div style={{ borderTop: '2px solid #eee', paddingTop: 16, textAlign: 'right', fontSize: 16, fontWeight: 700 }}>
                            Tổng cộng: {formatPrice(selectedBill.tong_tien)}
                        </div>
                        <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                            <strong>Trạng thái thanh toán:</strong> {selectedBill.thanh_toan || '---'}
                        </div>
                        {selectedBill.ly_do_huy && (
                            <div style={{ marginBottom: 16, color: 'red', textAlign: 'left' }}>
                                <strong>Lý do huỷ:</strong> {selectedBill.ly_do_huy}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320 }}>
                        <h4>Nhập lý do huỷ đơn</h4>
                        <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} style={{ width: '100%', marginBottom: 16 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="btn btn-secondary" onClick={() => { setShowCancelModal(false); setCancelingBillId(null); setCancelReason(''); }}>Huỷ</button>
                            <button className="btn btn-danger" onClick={confirmCancelOrder}>Xác nhận huỷ</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillUserClient;