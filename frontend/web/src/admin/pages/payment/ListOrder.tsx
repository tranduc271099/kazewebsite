import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  trang_thai: 'chờ xác nhận' | 'đã xác nhận' | 'đang giao hàng' | 'đã giao hàng' | 'đã nhận hàng' | 'hoàn thành' | 'đã hủy';
  ngay_tao: string;
  danh_sach_san_pham: OrderProduct[];
  thanh_toan?: 'đã thanh toán' | 'chưa thanh toán';
  ly_do_huy?: string;
  nguoi_huy?: { id: string; loai: string };
}

const statusOptions = [
  'chờ xác nhận',
  'đã xác nhận',
  'đang giao hàng',
  'đã giao hàng',
  'đã nhận hàng',
  'hoàn thành',
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
      
      if (res.data && res.data.bills) {
        setOrders(res.data.bills);
        setTotal(res.data.bills.length);
      } else {
        console.error('Invalid response format:', res.data);
        setError('Dữ liệu không đúng định dạng');
      }
      setPage(1);
    } catch (err: any) {
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

  const handleAdminCancelOrder = (order: Order) => {
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
    } catch (err: any) {
      alert('Lỗi khi huỷ đơn hàng');
    } finally {
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchText = search.toLowerCase();
    return (
      (order.nguoi_dung_id?.name || '').toLowerCase().includes(searchText) ||
      (order._id || '').toLowerCase().includes(searchText) ||
      (order.nguoi_dung_id?.phone || '').toLowerCase().includes(searchText)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortType === 'newest') {
      return new Date(b.ngay_tao || 0).getTime() - new Date(a.ngay_tao || 0).getTime();
    } else if (sortType === 'oldest') {
      return new Date(a.ngay_tao || 0).getTime() - new Date(b.ngay_tao || 0).getTime();
    } else if (sortType === 'price_asc') {
      return (a.tong_tien || 0) - (b.tong_tien || 0);
    } else if (sortType === 'price_desc') {
      return (b.tong_tien || 0) - (a.tong_tien || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedOrders.length / limit);
  const pagedOrders = sortedOrders.slice((page - 1) * limit, page * limit);

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

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  const getNextStatusOptions = (currentStatus: string) => {
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
              <div key={order._id || idx} style={{ background: pastelColors[idx % pastelColors.length], borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, color: '#222' }}>#{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}</div>
                  <span style={{ background: getStatusColor(order.trang_thai || 'chờ xác nhận'), color: '#fff', padding: '4px 10px', borderRadius: 4, fontWeight: 600, fontSize: 13, minWidth: 90, textAlign: 'center' }}>{order.trang_thai || 'chờ xác nhận'}</span>
                </div>
                <div style={{ fontSize: 14, color: '#222', marginBottom: 2 }}>Khách hàng: {order.nguoi_dung_id?.name || 'Ẩn danh'}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>SĐT: {order.nguoi_dung_id?.phone || '---'}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>Ngày đặt: {order.ngay_tao ? new Date(order.ngay_tao).toLocaleString('vi-VN') : '---'}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>Phương thức: <span style={{ color: '#1976d2', fontWeight: 500 }}>{order.phuong_thuc_thanh_toan || '---'}</span></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', marginBottom: 2 }}>Tổng: {(order.tong_tien || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                <button
                  style={{ marginTop: 8, padding: '6px 0', borderRadius: 4, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                    setNewStatus(order.trang_thai || 'chờ xác nhận');
                  }}
                >
                  Chi tiết
                </button>
              </div>
            ))}
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
                Mã hóa đơn #{selectedOrder._id ? selectedOrder._id.slice(-8).toUpperCase() : 'N/A'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              Khách hàng: {selectedOrder.nguoi_dung_id?.name || 'Không có thông tin'}
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              SĐT: {selectedOrder.nguoi_dung_id?.phone || '---'}
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              Ngày đặt: {selectedOrder.ngay_tao ? formatDateTime(selectedOrder.ngay_tao) : '---'}
            </div>
            <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
              <strong>Trạng thái:</strong> <span style={{ background: getStatusColor(selectedOrder.trang_thai || 'chờ xác nhận'), color: '#fff', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: 14 }}>{selectedOrder.trang_thai || 'chờ xác nhận'}</span>
              {selectedOrder.trang_thai === 'đã hủy' && selectedOrder.ly_do_huy && (
                <div style={{ marginTop: 8, color: '#d32f2f' }}><strong>Lý do huỷ:</strong> {selectedOrder.ly_do_huy}</div>
              )}
            </div>
            {selectedOrder.phuong_thuc_thanh_toan && (
              <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                Phương thức thanh toán: <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: 4, marginLeft: 8, fontSize: 14 }}>{selectedOrder.phuong_thuc_thanh_toan}</span>
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
            <div style={{ borderTop: '2px solid #eee', paddingTop: 16, textAlign: 'right', fontSize: 18, fontWeight: 700, marginTop: 8, color: '#222' }}>
              Tổng cộng: <span style={{ color: '#2563eb', fontWeight: 700 }}>{(selectedOrder.tong_tien || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
            </div>
            {selectedOrder.thanh_toan && (
              <div style={{ marginBottom: 14, color: '#222', textAlign: 'left' }}>
                Trạng thái thanh toán: {selectedOrder.thanh_toan}
              </div>
            )}
            {selectedOrder && getNextStatusOptions(selectedOrder.trang_thai).map((status) => (
              status === 'đã hủy' ? (
                <button
                  key={status}
                  style={{ marginLeft: 10, padding: '4px 12px', borderRadius: 4, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                  onClick={() => handleAdminCancelOrder(selectedOrder)}
                  disabled={updatingStatus}
                >
                  Huỷ đơn
                </button>
              ) : (
                <button
                  key={status}
                  style={{ marginLeft: 10, padding: '4px 12px', borderRadius: 4, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                  disabled={updatingStatus}
                  onClick={async () => {
                    if (!selectedOrder || !selectedOrder._id) {
                      alert('Dữ liệu đơn hàng không hợp lệ');
                      return;
                    }
                    
                    setUpdatingStatus(true);
                    try {
                      console.log('Updating status to:', status);
                      console.log('Order ID:', selectedOrder._id);
                      console.log('Current order status:', selectedOrder.trang_thai);
                      
                      if (!selectedOrder._id) {
                        throw new Error('Order ID is missing');
                      }
                      
                      const token = localStorage.getItem('token');
                      if (!token) {
                        throw new Error('Token is missing');
                      }
                      
                      const requestData = { trang_thai: status };
                      console.log('Request data:', requestData);
                      
                      const response = await axios.put(`http://localhost:5000/api/bill/${selectedOrder._id}/status`, requestData, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      console.log('Update response:', response.data);
                      await fetchOrders(page);
                      setShowModal(false);
                      toast.success('Trạng thái đơn hàng đã được cập nhật thành công!');
                    } catch (err: any) {
                      console.error('Error updating status:', err);
                      console.error('Error response:', err.response?.data);
                      console.error('Error status:', err.response?.status);
                      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
                    } finally {
                      setUpdatingStatus(false);
                    }
                  }}
                >
                  {status}
                </button>
              )
            ))}
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