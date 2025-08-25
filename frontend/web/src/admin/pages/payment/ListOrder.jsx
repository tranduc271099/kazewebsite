import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
// @ts-ignore
import styles from '../../styles/ProductLayout.module.css';
import { BiSearch } from 'react-icons/bi'; // Import icon tìm kiếm
import { FaFileExcel } from 'react-icons/fa'; // Import icon Excel
import { FiRefreshCcw } from 'react-icons/fi'; // Import icon Refresh
import { AiOutlineEye, AiOutlineEdit } from 'react-icons/ai'; // Import icons cho thao tác

const statusOptions = [
  'chờ xác nhận',
  'đã xác nhận',
  'đang giao hàng',
  'đã giao hàng',
  'đã nhận hàng',
  'hoàn thành',
  'đã hủy',
];

const paymentMethods = [
  'COD', 'VNPAY'
];

console.log('ListOrder component mounted');

const ListOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Đổi từ search thành searchTerm
  const [sortType, setSortType] = useState('newest');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(''); // Filter mới cho phương thức thanh toán
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allFetchedOrders, setAllFetchedOrders] = useState([]); // Thêm state mới để lưu tất cả đơn hàng từ backend
  const [shipping, setShipping] = useState(() => {
    const saved = localStorage.getItem('selectedShipping');
    return saved !== null ? Number(saved) : 4990;
  });

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

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await axios.get(`http://localhost:5000/api/bill/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllFetchedOrders(res.data.bills); // Lưu tất cả đơn hàng đã fetch
      setTotal(res.data.bills.length); // Total ban đầu là tổng số đơn hàng đã fetch
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [paymentMethodFilter, searchTerm, startDate, endDate]); // Xóa statusFilter khỏi dependencies

  // Socket.IO connection để lắng nghe real-time updates
  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Join admin room
    socket.emit('admin_join');

    // Lắng nghe event khi đơn hàng được xác nhận nhận hàng
    socket.on('order_completed', (data) => {
      console.log('Order completed:', data);
      toast.success(`🎉 ${data.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reload danh sách đơn hàng
      fetchOrders(page);
    });

    // Cleanup khi component unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array vì chỉ cần chạy một lần

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bill/${orderId}/status`, { trang_thai: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(page);
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
      alert(err.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng');
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
      fetchOrders(page);
      setShowModal(false);
      toast.success('Đơn hàng đã được hủy thành công!');
    } catch (err) {
      alert('Lỗi khi huỷ đơn hàng');
    } finally {
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  // Filter and sort logic moved to fetchOrders or handled by backend
  // const filteredOrders = orders.filter(...) - REMOVED
  // const sortedOrders = [...filteredOrders].sort(...) - REMOVED

  const filteredAndSortedOrders = allFetchedOrders.filter(order => {
    // Áp dụng statusFilter ở frontend
    const matchStatus = statusFilter === 'all' ? true : order.trang_thai === statusFilter;
    return matchStatus;
  });

  const statusOrder = [
    'chờ xác nhận',
    'đã xác nhận',
    'đang giao hàng',
    'đã giao hàng',
    'đã nhận hàng',
    'hoàn thành',
    'đã hủy',
  ];

  const totalPages = Math.ceil(filteredAndSortedOrders.length / limit);
  const pagedOrders = filteredAndSortedOrders.slice((page - 1) * limit, page * limit);

  const trulyNewestOrder = filteredAndSortedOrders.length > 0
    ? filteredAndSortedOrders.reduce((latest, order) =>
      new Date(order.ngay_tao) > new Date(latest.ngay_tao) ? order : latest, filteredAndSortedOrders[0])
    : null;
  const trulyNewestOrderId = trulyNewestOrder?._id;

  function parseAddress(address) {
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
  }
  function getStatusColor(status) {
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
  }
  const pastelColors = [
    '#fef6e4', '#e0f2fe', '#f0fdf4', '#f3e8ff', '#f1f5f9', '#fce7f3', '#f3f4f6', '#fef9c3',
  ];

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  const handleShippingSelect = (value) => {
    setShipping(value);
    localStorage.setItem('selectedShipping', value.toString());
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Đơn hàng</h1>

      {/* Status Tabs */}
      <div className={styles.orderStatusTabs}>
        {['all', ...statusOptions].map(status => (
          <button
            key={status}
            className={`${styles.statusTab} ${statusFilter === status ? styles.statusTabActive : ''}`}
            onClick={() => { setStatusFilter(status); setPage(1); }}
          >
            {status === 'all' ? 'Tất cả' : getStatusDisplay(status)} ({allFetchedOrders.filter(order => status === 'all' ? true : order.trang_thai === status).length})
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
        <input
          type="date"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); setPage(1); }}
          className={styles.input}
          style={{ width: '150px' }}
        />
        <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
        <input
          type="date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); setPage(1); }}
          className={styles.input}
          style={{ width: '150px' }}
        />
        <select
          className={styles.select}
          value={paymentMethodFilter}
          onChange={e => { setPaymentMethodFilter(e.target.value); setPage(1); }}
          style={{ width: '150px' }}
        >
          <option value="">Phương thức TT</option>
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
        <input
          type="text"
          className={styles.input}
          placeholder="Tìm kiếm đơn hàng..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
          style={{ flexGrow: 1 }}
        />
        <button onClick={() => fetchOrders()} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: 'auto', padding: '10px 18px' }}>
          <BiSearch size={20} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải đơn hàng...</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : (
        <>
          <div className={styles.card} style={{ marginTop: 16 }}>
            <table className={styles.productTable} style={{ fontSize: '16px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>STT</th>
                  <th style={{ textAlign: 'left' }}>Mã đơn hàng</th>
                  <th style={{ textAlign: 'left' }}>Khách hàng</th>
                  <th style={{ textAlign: 'center' }}>SĐT</th>
                  <th style={{ textAlign: 'right' }}>Giá trị đơn hàng (VND)</th>
                  <th style={{ textAlign: 'center' }}>Ngày đặt hàng</th>
                  <th style={{ textAlign: 'center' }}>Phương thức thanh toán</th>
                  <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((order, idx) => {
                  const displayedIndex = (page - 1) * limit + idx + 1;
                  return (
                    <tr key={order._id || idx}>
                      <td style={{ textAlign: 'center' }}>{displayedIndex}</td>
                      <td style={{ textAlign: 'left', fontWeight: 500 }}>#{order.orderId ? order.orderId : (order._id ? order._id.slice(-8).toUpperCase() : 'N/A')}</td>
                      <td style={{ textAlign: 'left' }}>{order.nguoi_dung_id?.name || 'Ẩn danh'}</td>
                      <td style={{ textAlign: 'center' }}>{order.nguoi_dung_id?.phone || '---'}</td>
                      <td style={{ color: '#7c3aed', fontWeight: 600, textAlign: 'right' }}>
                        {((order.tong_tien || 0) - (order.discount || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td style={{ textAlign: 'center' }}>{order.ngay_tao ? new Date(order.ngay_tao).toLocaleDateString('vi-VN') : '---'}</td>
                      <td style={{ textAlign: 'center' }}>{order.phuong_thuc_thanh_toan || '---'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.status} style={{ backgroundColor: getStatusColor(order.trang_thai), color: 'white' }}>
                          {getStatusDisplay(order.trang_thai || 'chờ xác nhận')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            className={`${styles.actionBtn} ${styles.iconBtn}`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                              setNewStatus(order.trang_thai || 'chờ xác nhận');
                            }}
                            title="Cập nhật trạng thái"
                          >
                            <AiOutlineEdit size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pagedOrders.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>Không có đơn hàng nào phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'center' }}>
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className={`${styles.btn} ${styles.btnSecondary}`}>&larr; Trước</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  style={{ background: p === page ? '#7c3aed' : 'var(--input-bg)', color: p === page ? '#fff' : 'var(--text-primary)', border: '1px solid var(--input-border)' }}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className={`${styles.btn} ${styles.btnSecondary}`}>Sau &rarr;</button>
            </div>
          )}
        </>
      )}

      {showModal && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className={styles.card} style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 32,
            maxWidth: 800,
            width: '95%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontSize: '1rem',
            color: 'var(--text-primary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderBottom: '1px solid var(--card-border)', paddingBottom: 15 }}>
              <div style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Chi tiết đơn hàng #{selectedOrder.orderId ? selectedOrder.orderId : (selectedOrder._id ? selectedOrder._id.slice(-8).toUpperCase() : 'N/A')}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1 }}>×</button>
            </div>
            <div className={styles.detailModalContent}>
              {/* Thông tin tài khoản */}
              <div style={{ marginBottom: 20, padding: 15, borderRadius: 8, border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1.1rem' }}>📋 Thông tin tài khoản</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên tài khoản:</span>
                  <span className={styles.detailValue}>{selectedOrder.nguoi_dung_id?.name || 'Không có thông tin'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email tài khoản:</span>
                  <span className={styles.detailValue}>{selectedOrder.nguoi_dung_id?.email || '---'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>SĐT tài khoản:</span>
                  <span className={styles.detailValue}>{selectedOrder.nguoi_dung_id?.phone || '---'}</span>
                </div>
              </div>

              {/* Thông tin người nhận hàng */}
              <div style={{ marginBottom: 20, padding: 15, borderRadius: 8, border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1.1rem' }}>📦 Thông tin người nhận hàng</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên người nhận:</span>
                  <span className={styles.detailValue}>
                    {selectedOrder.dia_chi_giao_hang?.ho_ten || selectedOrder.nguoi_dung_id?.name || 'Không có thông tin'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email liên hệ:</span>
                  <span className={styles.detailValue}>
                    {selectedOrder.dia_chi_giao_hang?.email || selectedOrder.nguoi_dung_id?.email || '---'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>SĐT liên hệ:</span>
                  <span className={styles.detailValue}>
                    {selectedOrder.dia_chi_giao_hang?.so_dien_thoai || selectedOrder.nguoi_dung_id?.phone || '---'}
                  </span>
                </div>
              </div>

              {/* Thông tin đơn hàng */}
              <div style={{ marginBottom: 20, padding: 15, borderRadius: 8, border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1.1rem' }}>📋 Thông tin đơn hàng</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Ngày đặt:</span>
                  <span className={styles.detailValue}>{selectedOrder.ngay_tao ? formatDateTime(selectedOrder.ngay_tao) : '---'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Trạng thái:</span>
                  <span className={styles.detailValue} style={{ background: getStatusColor(selectedOrder.trang_thai || 'chờ xác nhận'), color: '#fff', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: '0.9rem' }}>
                    {selectedOrder.trang_thai === 'đã hủy' ? 'Hủy đơn hàng' : getStatusDisplayForModal(selectedOrder.trang_thai || 'chờ xác nhận')}
                  </span>
                </div>
                {selectedOrder.trang_thai === 'đã hủy' && selectedOrder.ly_do_huy && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel} style={{ color: '#d32f2f' }}>Lý do huỷ:</span>
                    <span className={styles.detailValue} style={{ color: '#d32f2f' }}>{selectedOrder.ly_do_huy}</span>
                  </div>
                )}
                {selectedOrder.phuong_thuc_thanh_toan && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phương thức thanh toán:</span>
                    <span className={styles.detailValue} style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: 4, fontSize: '0.9rem' }}>{selectedOrder.phuong_thuc_thanh_toan}</span>
                  </div>
                )}
                {selectedOrder.shippingFee !== undefined && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phí vận chuyển:</span>
                    <span className={styles.detailValue}>{selectedOrder.shippingFee === 0 ? 'Miễn phí (Đơn trên 300k)' : selectedOrder.shippingFee === 4990 ? 'Tiêu chuẩn (3-5 ngày)' : selectedOrder.shippingFee === 12990 ? 'Nhanh (1-2 ngày)' : `${selectedOrder.shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Trạng thái thanh toán:</span>
                  <span className={styles.detailValue} style={{ background: (selectedOrder.paymentStatus === 'paid' || selectedOrder.thanh_toan === 'đã thanh toán') ? '#10b981' : '#f59e0b', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: '0.9rem' }}>
                    {(selectedOrder.paymentStatus === 'paid' || selectedOrder.thanh_toan === 'đã thanh toán') ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div style={{ marginBottom: 20, padding: 15, borderRadius: 8, border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057', fontSize: '1.1rem' }}>📍 Địa chỉ giao hàng</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Địa chỉ:</span>
                  <span className={styles.detailValue}>
                    {selectedOrder.dia_chi_giao_hang?.dia_chi_chi_tiet && `${selectedOrder.dia_chi_giao_hang.dia_chi_chi_tiet}, `}
                    {selectedOrder.dia_chi_giao_hang?.phuong_xa && `${selectedOrder.dia_chi_giao_hang.phuong_xa}, `}
                    {selectedOrder.dia_chi_giao_hang?.quan_huyen && `${selectedOrder.dia_chi_giao_hang.quan_huyen}, `}
                    {selectedOrder.dia_chi_giao_hang?.tinh_thanh || '---'}
                  </span>
                </div>
              </div>
              {selectedOrder.ghi_chu &&
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Ghi chú:</span>
                  <span className={styles.detailValue}>{selectedOrder.ghi_chu}</span>
                </div>
              }
              <h3 style={{ marginTop: 20, marginBottom: 15, fontSize: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: 10 }}>Sản phẩm trong đơn hàng:</h3>
              {selectedOrder.danh_sach_san_pham && Array.isArray(selectedOrder.danh_sach_san_pham) && selectedOrder.danh_sach_san_pham.map((item, idx) => (
                <div key={item._id || idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 15, borderBottom: idx < selectedOrder.danh_sach_san_pham.length - 1 ? '1px solid var(--card-border)' : 'none', paddingBottom: 15 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: 'var(--input-bg)', border: '1px solid var(--input-border)', marginRight: 15, flexShrink: 0 }}>
                    <img
                      src={item.san_pham_id?.images && item.san_pham_id.images[0] ? (item.san_pham_id.images[0].startsWith('http') ? item.san_pham_id.images[0] : `http://localhost:5000${item.san_pham_id.images[0]}`) : 'https://via.placeholder.com/150'}
                      alt={item.san_pham_id?.name || 'Sản phẩm'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.san_pham_id?.name || 'Không có tên'}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 3 }}>SL: {item.so_luong || 0} | {item.mau_sac || '---'} | {item.kich_thuoc || '---'}</div>
                  </div>
                  <div style={{ color: '#7c3aed', marginLeft: 20, fontSize: '1.1rem', fontWeight: 600 }}>{((item.gia || 0) * (item.so_luong || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                </div>
              ))}
              <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 15, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Tổng cộng: {((selectedOrder.tong_tien || 0) - (selectedOrder.discount || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </div>
            </div>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
              {/* Debug: Hiển thị trạng thái hiện tại và các tùy chọn */}
              <div style={{ marginRight: 'auto', fontSize: '12px', color: '#666' }}>
                Trạng thái hiện tại: {selectedOrder.trang_thai} |
                Tùy chọn: {getNextStatusOptions(selectedOrder.trang_thai).join(', ')}
              </div>
              {getNextStatusOptions(selectedOrder.trang_thai).length > 0 &&
                <>
                  <strong style={{ marginRight: 'auto', fontSize: '1rem', color: 'var(--text-primary)' }}>Cập nhật trạng thái:</strong>
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
                        fontSize: '0.9rem',
                      }}
                    >
                      {getStatusDisplayForModal(status)}
                    </button>
                  ))}
                </>
              }
              <button onClick={() => setShowModal(false)} className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: '8px 20px', marginLeft: getNextStatusOptions(selectedOrder.trang_thai).length > 0 ? 'initial' : 'auto' }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className={styles.card} style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 24,
            minWidth: 400,
            maxWidth: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            color: 'var(--text-primary)'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: 15, color: 'var(--text-primary)' }}>Nhập lý do huỷ đơn</h4>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={4} className={styles.textarea} style={{ width: '100%', marginBottom: 20 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>Huỷ</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={confirmAdminCancelOrder} style={{ background: '#ef4444' }}>Xác nhận huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrder;