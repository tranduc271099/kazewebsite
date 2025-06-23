import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Product {
  _id: string;
  name: string;
  images?: string[];
}

interface OrderProduct {
  san_pham_id: Product;
  so_luong: number;
  gia: number;
  mau_sac: string;
  kich_thuoc: string;
  _id: string;
}

interface Order {
  _id: string;
  nguoi_dung_id: User;
  dia_chi_giao_hang: string;
  tong_tien: number;
  phuong_thuc_thanh_toan?: string;
  ghi_chu?: string;
  trang_thai: string;
  ngay_tao: string;
  danh_sach_san_pham: OrderProduct[];
}

const statusOptions = [
  'chờ xác nhận',
  'đã xác nhận',
  'đang giao',
  'đã giao',
  'đã hủy',
];

const ListOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('newest');

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/bill/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.bills);
      setTotal(res.data.bills.length);
      setPage(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bill/${orderId}/status`, { trang_thai: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleShowDetail = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/bill/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data);
      setShowModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }
  };

  // Tìm kiếm
  const filteredOrders = orders.filter(order => {
    const searchText = search.toLowerCase();
    return (
      order.nguoi_dung_id?.name?.toLowerCase().includes(searchText) ||
      order._id.toLowerCase().includes(searchText) ||
      order.nguoi_dung_id?.phone?.toLowerCase().includes(searchText)
    );
  });

  // Sắp xếp
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortType === 'newest') {
      return new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime();
    } else if (sortType === 'oldest') {
      return new Date(a.ngay_tao).getTime() - new Date(b.ngay_tao).getTime();
    } else if (sortType === 'price_asc') {
      return a.tong_tien - b.tong_tien;
    } else if (sortType === 'price_desc') {
      return b.tong_tien - a.tong_tien;
    }
    return 0;
  });

  // Phân trang
  const totalPages = Math.ceil(sortedOrders.length / limit);
  const pagedOrders = sortedOrders.slice((page - 1) * limit, page * limit);

  // Helper: parseAddress và getStatusColor
  function parseAddress(address: string) {
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
  function getStatusColor(status: string) {
    switch (status) {
      case 'chờ xác nhận': return '#f59e0b';
      case 'đã xác nhận': return '#3b82f6';
      case 'đang giao': return '#8b5cf6';
      case 'đã giao': return '#10b981';
      case 'đã hủy': return '#ef4444';
      default: return '#6b7280';
    }
  }
  // Màu pastel cho card
  const pastelColors = [
    '#fef6e4', '#e0f2fe', '#f0fdf4', '#f3e8ff', '#f1f5f9', '#fce7f3', '#f3f4f6', '#fef9c3',
  ];

  // Helper: formatDateTime
  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  // Hiển thị danh sách đơn hàng dạng card
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
          value={sortType}
          onChange={e => { setSortType(e.target.value); setPage(1); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
        <span style={{ color: '#888', fontSize: 13 }}>Tổng: {sortedOrders.length} đơn hàng</span>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {pagedOrders.map((order, idx) => (
              <div key={order._id} style={{ background: pastelColors[idx % pastelColors.length], borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, color: '#222' }}>#{order._id.slice(-8).toUpperCase()}</div>
                  <span style={{ background: getStatusColor(order.trang_thai), color: '#fff', padding: '4px 10px', borderRadius: 4, fontWeight: 600, fontSize: 13, minWidth: 90, textAlign: 'center' }}>{order.trang_thai}</span>
                </div>
                <div style={{ fontSize: 14, color: '#222', marginBottom: 2 }}>Khách hàng: {order.nguoi_dung_id?.name || 'Ẩn danh'}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>SĐT: {order.nguoi_dung_id?.phone || '---'}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>Ngày đặt: {new Date(order.ngay_tao).toLocaleString('vi-VN')}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>Phương thức: <span style={{ color: '#1976d2', fontWeight: 500 }}>{order.phuong_thuc_thanh_toan || '---'}</span></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', marginBottom: 2 }}>Tổng: {order.tong_tien.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                <button
                  style={{ marginTop: 8, padding: '6px 0', borderRadius: 4, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                    setNewStatus(order.trang_thai);
                  }}
                >
                  Chi tiết
                </button>
              </div>
            ))}
          </div>
          {/* Pagination */}
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

      {/* Modal chi tiết đơn hàng */}
      {showModal && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ 
            background: pastelColors[0],
            borderRadius: 12, 
            padding: 24, 
            maxWidth: 600, 
            width: '90%', 
            maxHeight: '80vh', 
            overflow: 'auto', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, color: '#222', fontWeight: 500 }}>
                Mã hóa đơn #{selectedOrder._id.slice(-8).toUpperCase()}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              Khách hàng: {selectedOrder.nguoi_dung_id?.name}
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              SĐT: {selectedOrder.nguoi_dung_id?.phone || '---'}
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              Ngày đặt: {formatDateTime(selectedOrder.ngay_tao)}
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              Trạng thái: 
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                style={{ background: getStatusColor(newStatus), color: '#fff', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: 14, border: 'none', outline: 'none' }}
                disabled={updatingStatus}
              >
                {statusOptions.map(st => <option key={st} value={st} style={{ color: '#222' }}>{st}</option>)}
              </select>
              <button
                style={{ marginLeft: 10, padding: '4px 12px', borderRadius: 4, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                disabled={updatingStatus || newStatus === selectedOrder.trang_thai}
                onClick={async () => {
                  setUpdatingStatus(true);
                  try {
                    const token = localStorage.getItem('token');
                    await axios.put(`http://localhost:5000/api/bill/${selectedOrder._id}/status`, { trang_thai: newStatus }, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    fetchOrders(page);
                    setShowModal(false);
                  } catch (err) {
                    alert('Lỗi khi cập nhật trạng thái');
                  } finally {
                    setUpdatingStatus(false);
                  }
                }}
              >
                Cập nhật
              </button>
            </div>
            {selectedOrder.phuong_thuc_thanh_toan && (
              <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                Phương thức thanh toán: <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: 14 }}>{selectedOrder.phuong_thuc_thanh_toan}</span>
              </div>
            )}
            {/* Địa chỉ giao hàng tách dòng */}
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              Địa chỉ giao hàng:
              <div style={{ marginTop: 4, fontSize: 14, color: '#222', textAlign: 'left' }}>
                {parseAddress(selectedOrder.dia_chi_giao_hang).street}<br />
                {parseAddress(selectedOrder.dia_chi_giao_hang).ward && <span>Xã/Phường: {parseAddress(selectedOrder.dia_chi_giao_hang).ward}<br /></span>}
                {parseAddress(selectedOrder.dia_chi_giao_hang).district && <span>Quận/Huyện: {parseAddress(selectedOrder.dia_chi_giao_hang).district}<br /></span>}
                {parseAddress(selectedOrder.dia_chi_giao_hang).city && <span>Tỉnh/TP: {parseAddress(selectedOrder.dia_chi_giao_hang).city}</span>}
              </div>
            </div>
            {selectedOrder.ghi_chu && <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>Ghi chú: <span style={{ fontSize: 14 }}>{selectedOrder.ghi_chu}</span></div>}
            <div style={{ marginBottom: 14, color: '#222' }}>Sản phẩm:</div>
            {selectedOrder.danh_sach_san_pham.map((item, idx) => (
              <div key={item._id || idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, borderBottom: idx < selectedOrder.danh_sach_san_pham.length - 1 ? '1px solid #eee' : 'none', paddingBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#f9fafb', border: '1px solid #eee', marginRight: 12, flexShrink: 0 }}>
                  <img
                    src={item.san_pham_id?.images && item.san_pham_id.images[0] ? (item.san_pham_id.images[0].startsWith('http') ? item.san_pham_id.images[0] : `http://localhost:5000${item.san_pham_id.images[0]}`) : 'https://via.placeholder.com/150'}
                    alt={item.san_pham_id?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.san_pham_id?.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>SL: {item.so_luong} | {item.mau_sac} | {item.kich_thuoc}</div>
                </div>
                <div style={{ color: '#2563eb', marginLeft: 12, fontSize: 14 }}>{(item.gia * item.so_luong).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #eee', paddingTop: 16, textAlign: 'right', fontSize: 18, fontWeight: 700, marginTop: 8, color: '#222' }}>
              Tổng cộng: <span style={{ color: '#2563eb', fontWeight: 700 }}>{selectedOrder.tong_tien.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrder;