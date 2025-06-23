import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
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
    ngay_tao: string;
    trang_thai: 'chờ xác nhận' | 'đã xác nhận' | 'đang giao' | 'đã giao' | 'đã hủy';
    danh_sach_san_pham: SanPhamTrongHoaDon[];
    dia_chi_giao_hang: string;
    tong_tien: number;
    phuong_thuc_thanh_toan?: string;
    ghi_chu?: string;
    nguoi_dung_id?: {
        name: string;
        phone?: string;
    };
    trang_thai_lich_su: {
        trang_thai: string;
        thoi_gian: Date;
    }[];
    statusHistory: {
        status: string;
        time: Date;
    }[];
}

const BillUserClient = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedBill, setSelectedBill] = useState<HoaDon | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); 

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

    const handleCancelOrder = async (billId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.put(`http://localhost:5000/api/bill/${billId}/cancel`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                toast.success('Hủy đơn hàng thành công!');
                const updatedBills = bills.map(bill => 
                    bill._id === billId 
                        ? { ...bill, trang_thai: 'đã hủy' as const }
                        : bill
                );
                setBills(updatedBills);
            }
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            
            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Không thể hủy đơn hàng này');
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy đơn hàng');
            } else if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn');
                navigate('/login');
            } else {
                toast.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
            }
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

    const filteredBills = selectedStatus === 'all' 
        ? bills 
        : bills.filter(bill => bill.trang_thai === selectedStatus);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

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
                                <i className="bi bi-person"></i>
                            </div>
                            <div style={{ fontWeight: 600, textAlign: 'center' }}>Tài khoản</div>
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
                                <Link to="/orders" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Đơn Mua</Link>
                            </li>
                        </ul>
                    </aside>

                    <main className="bill-main" style={{
                        flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 36, minWidth: 0
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Lịch Sử Đơn Hàng</h2>
                                <div style={{ color: '#888' }}>Tổng cộng {filteredBills.length} đơn hàng</div>
                            </div>
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
                                        const isNewest = index === 0 && currentPage === 1;
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
                                                        {!isNewest && isNewOrder(bill.ngay_tao) && (
                                                            <span style={{
                                                                background: '#10b981',
                                                                color: '#fff',
                                                                padding: '2px 6px',
                                                                borderRadius: 4,
                                                                fontSize: 10,
                                                                fontWeight: 600
                                                            }}>
                                                                MỚI
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
                                                        {bill.trang_thai === 'đã giao' && (
                                                            <button className="btn btn-outline-success btn-sm" style={{ fontSize: 11, padding: '4px 8px' }}>
                                                                Mua lại
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
                        maxWidth: 800,
                        width: '95%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        display: 'flex',
                        gap: 32
                    }}>
                        {/* Bên trái: Thông tin đơn hàng */}
                        <div style={{ flex: 1 }}>
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
                            <div style={{ marginBottom: 16, color: '#222', textAlign: 'left' }}>
                                Địa chỉ giao hàng: {selectedBill.dia_chi_giao_hang}
                            </div>
                            {selectedBill.ghi_chu && (
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Ghi chú:</strong> <span style={{ fontSize: 13 }}>{selectedBill.ghi_chu}</span>
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
                        </div>
                        {/* Bên phải: Timeline trạng thái */}
                        <div style={{ width: 180, minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid #eee', paddingLeft: 24 }}>
                            {(() => {
                                const statusSteps = [
                                    { key: 'chờ xác nhận', label: 'Chờ xác nhận', icon: '⏳' },
                                    { key: 'đã xác nhận', label: 'Đã xác nhận', icon: '✔️' },
                                    { key: 'đang giao', label: 'Đang giao', icon: '🚚' },
                                    { key: 'đã giao', label: 'Đã giao', icon: '✅' },
                                    { key: 'đã hủy', label: 'Đã hủy', icon: '❌' }
                                ];
                                return statusSteps.map((step, idx) => {
                                    const history = selectedBill.trang_thai_lich_su?.find(s => s.trang_thai === step.key);
                                    const isActive = !!history;
                                    const isCurrent = selectedBill.trang_thai === step.key;
                                    return (
                                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                                            <div style={{
                                                width: isCurrent ? 28 : 18,
                                                height: isCurrent ? 28 : 18,
                                                borderRadius: '50%',
                                                background: isCurrent ? '#2563eb' : (isActive ? '#a5b4fc' : '#e5e7eb'),
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: isCurrent ? 18 : 14,
                                                fontWeight: 700,
                                                marginBottom: 4
                                            }}>
                                                {step.icon}
                                            </div>
                                            <div style={{ fontSize: 13, color: isCurrent ? '#2563eb' : (isActive ? '#222' : '#aaa'), fontWeight: isCurrent ? 700 : 500 }}>
                                                {step.label}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#666', minHeight: 16 }}>
                                                {history ? new Date(history.thoi_gian).toLocaleString('vi-VN') : ''}
                                            </div>
                                            {idx < statusSteps.length - 1 && (
                                                <div style={{ width: 2, height: 24, background: isActive ? '#2563eb' : '#e5e7eb', margin: '2px 0' }} />
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillUserClient;