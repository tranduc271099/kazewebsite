import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// @ts-ignore
import styles from '../../styles/ProductLayout.module.css';

const statusOptions = [
  'chờ xác nhận',
  'đã xác nhận',
  'đang giao hàng',
  'đã giao hàng',
  'đã nhận hàng',
  'hoàn thành',
  'đã hủy',
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
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
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

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching orders...');
      const res = await axios.get(`http://localhost:5000/api/bill/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Orders response:', res.data);
      setOrders(res.data.bills);
      console.log('Set orders:', res.data.bills);
      setTotal(res.data.bills.length);
    } catch (err) {
      console.error('Error fetching orders:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const filteredOrders = orders.filter(order => {
    // Tạm thời bỏ filter loại bỏ đơn hàng ảo để hiển thị tất cả đơn hàng
    // const isFakeOrder =
    //   !order.nguoi_dung_id?.name ||
    //   order.tong_tien === 0 ||
    //   !order.dia_chi_giao_hang ||
    //   order.nguoi_dung_id.name === 'Ẩn danh' ||
    //   order.nguoi_dung_id.name === 'Không có thông tin';
    // if (isFakeOrder) return false;
    const searchText = search.toLowerCase();
    const matchSearch =
      (order.nguoi_dung_id?.name || '').toLowerCase().includes(searchText) ||
      (order._id || '').toLowerCase().includes(searchText) ||
      (order.nguoi_dung_id?.phone || '').toLowerCase().includes(searchText);
    const matchStatus = statusFilter === 'all' || order.trang_thai === statusFilter;
    let matchDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.ngay_tao);
      const filterDate = new Date(dateFilter);
      matchDate = orderDate.toISOString().slice(0, 10) === filterDate.toISOString().slice(0, 10);
    }
    return matchSearch && matchStatus && matchDate;
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
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortType === 'newest') {
      return new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime();
    } else if (sortType === 'oldest') {
      return new Date(a.ngay_tao || 0).getTime() - new Date(b.ngay_tao || 0).getTime();
    } else if (sortType === 'price_asc') {
      return (a.tong_tien || 0) - (b.tong_tien || 0);
    } else if (sortType === 'price_desc') {
      return (b.tong_tien || 0) - (a.tong_tien || 0);
    } else if (sortType === 'status') {
      return statusOrder.indexOf(a.trang_thai) - statusOrder.indexOf(b.trang_thai);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedOrders.length / limit);
  const pagedOrders = sortedOrders.slice((page - 1) * limit, page * limit);

  const trulyNewestOrder = orders.length > 0
    ? orders.reduce((latest, order) =>
      new Date(order.ngay_tao) > new Date(latest.ngay_tao) ? order : latest, orders[0])
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
      case 'đã giao hàng':
        return ['hoàn thành'];
      case 'đã nhận hàng':
        return ['hoàn thành'];
      default:
        return [];
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Quản lý đơn hàng</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã đơn, SĐT..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', minWidth: 220, fontSize: 14 }}
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
        >
          <option value="all">Tất cả trạng thái</option>
          {statusOptions.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
        />
        <select
          value={sortType}
          onChange={e => { setSortType(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="price_asc">Tổng tiền tăng dần</option>
          <option value="price_desc">Tổng tiền giảm dần</option>
        </select>
        <span style={{ color: '#888', fontSize: 13 }}>Tổng sản phẩm: {total}</span>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div className={styles.card} style={{ marginTop: 16 }}>
            <table className={styles.productTable} style={{ fontSize: '16px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Mã đơn</th>
                  <th style={{ textAlign: 'left' }}>Khách hàng</th>
                  <th style={{ textAlign: 'center' }}>SĐT</th>
                  <th style={{ textAlign: 'center' }}>Ngày đặt</th>
                  <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                  <th style={{ textAlign: 'center' }}>Phương thức</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((order, idx) => {
                  const isNewest = trulyNewestOrderId === order._id;
                  return (
                    <tr key={order._id || idx}>
                      <td style={{ textAlign: 'center', fontWeight: 500 }}>#{order.orderId ? order.orderId : (order._id ? order._id.slice(-8).toUpperCase() : 'N/A')}</td>
                      <td>{order.nguoi_dung_id?.name || 'Ẩn danh'}</td>
                      <td style={{ textAlign: 'center' }}>{order.nguoi_dung_id?.phone || '---'}</td>
                      <td style={{ textAlign: 'center' }}>{order.ngay_tao ? new Date(order.ngay_tao).toLocaleString('vi-VN') : '---'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.status + ' ' + (order.trang_thai === 'đã hủy' ? styles.statusInactive : styles.statusActive)}>
                          {getStatusDisplay(order.trang_thai || 'chờ xác nhận')}
                        </span>
                      </td>
                      <td style={{ color: '#2563eb', fontWeight: 600, textAlign: 'right' }}>
                        {((order.tong_tien || 0) - (order.discount || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </td>
                      <td style={{ textAlign: 'center' }}>{order.phuong_thuc_thanh_toan || '---'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={styles.actionBtn}
                          style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', fontWeight: 600, fontSize: 13, marginRight: 4 }}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                            setNewStatus(order.trang_thai || 'chờ xác nhận');
                          }}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pagedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có đơn hàng nào phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'center' }}>
              <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ padding: '6px 16px' }}>&larr; Trước</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{ padding: '6px 12px', background: p === page ? '#2563eb' : '#fff', color: p === page ? '#fff' : '#2563eb', border: '1px solid #2563eb', borderRadius: 4 }}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} style={{ padding: '6px 16px' }}>Sau &rarr;</button>
            </div>
          )}
        </>
      )}

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
                Mã hóa đơn #{selectedOrder.orderId ? selectedOrder.orderId : (selectedOrder._id ? selectedOrder._id.slice(-8).toUpperCase() : 'N/A')}
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
                {selectedOrder.trang_thai === 'đã hủy' ? 'Hủy đơn hàng' : getStatusDisplay(selectedOrder.trang_thai || 'chờ xác nhận')}
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
                      {getStatusDisplay(status)}
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

export default ListOrder;