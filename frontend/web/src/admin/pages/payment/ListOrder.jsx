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
  'yêu cầu trả hàng',
  'đang xử lý trả hàng',
  'đã hoàn tiền',
  'từ chối hoàn tiền',
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

  // Return request states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnRequestData, setReturnRequestData] = useState({
    adminNotes: '',
    images: [],
    status: ''
  });
  const [returnImages, setReturnImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'chờ xác nhận': return 'Chờ xác nhận';
      case 'đã xác nhận': return 'Đã xác nhận';
      case 'đang giao hàng': return 'Đang giao';
      case 'đã giao hàng': return 'Đã giao';
      case 'đã nhận hàng': return 'Đã nhận';
      case 'hoàn thành': return 'Hoàn thành';
      case 'đã hoàn tiền': return 'Đã hoàn tiền';
      case 'từ chối hoàn tiền': return 'Từ chối hoàn tiền';
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
      case 'yêu cầu trả hàng': return 'Yêu cầu trả hàng';
      case 'đang xử lý trả hàng': return 'Đang xử lý trả hàng';
      case 'đã hoàn tiền': return 'Đã hoàn tiền';
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
      setShowModal(false);
      toast.success(`Đơn hàng đã được cập nhật thành "${getStatusDisplay(newStatus)}".`);
      // Reload danh sách đơn hàng bất đồng bộ, không block UI
      setTimeout(() => fetchOrders(page), 100);
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

  // Handle return request
  const handleReturnRequest = (order) => {
    setSelectedOrder(order);
    setReturnRequestData({
      adminNotes: '',
      images: [],
      status: 'processing'
    });
    setReturnImages([]);
    setImagePreview([]);
    setShowReturnModal(true);
  };

  const handleReturnImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageUploading(true);

    const newImagePreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreview([...imagePreview, ...newImagePreviews]);
    setImageUploading(false);
  };

  const uploadReturnImages = async (files) => {
    console.log('Starting upload for', files.length, 'files');

    const uploadPromises = files.map(async (file, index) => {
      const formData = new FormData();
      formData.append('image', file);

      try {
        console.log(`Uploading file ${index + 1}/${files.length}:`, file.name);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.post(
          'http://localhost:5000/api/upload/image',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 second timeout
          }
        );

        console.log(`File ${index + 1} uploaded successfully:`, response.data.url);
        return response.data.url;
      } catch (error) {
        console.error(`Error uploading file ${index + 1}:`, error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        throw new Error(`Failed to upload ${file.name}: ${error.response?.data?.message || error.message}`);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log('All uploads completed successfully:', results);
      return results;
    } catch (error) {
      console.error('Upload batch failed:', error);
      throw error;
    }
  };

  const submitReturnUpdate = async () => {
    if (!selectedOrder || !returnRequestData.status) {
      toast.error('Vui lòng chọn trạng thái xử lý!');
      return;
    }

    // Additional validation
    if (returnRequestData.status === 'approved' && !returnRequestData.adminNotes.trim()) {
      toast.error('Vui lòng nhập ghi chú khi chấp nhận yêu cầu trả hàng!');
      return;
    }

    try {
      setImageUploading(true);
      let imageUrls = [];

      // Upload images if any
      if (imagePreview.length > 0) {
        try {
          console.log('Uploading images:', imagePreview.length);
          const files = imagePreview.map(item => item.file);
          imageUrls = await uploadReturnImages(files);
          console.log('Upload successful, URLs:', imageUrls);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error(`Có lỗi khi tải lên hình ảnh: ${uploadError.response?.data?.message || uploadError.message}`);
          return;
        }
      }

      console.log('Submitting return update:', {
        orderId: selectedOrder._id,
        status: returnRequestData.status,
        adminNotes: returnRequestData.adminNotes.trim(),
        adminImages: imageUrls
      });

      const token = localStorage.getItem('token');
      // Nếu chọn Từ chối, gửi status là 'rejected' về backend
      let statusToSend = returnRequestData.status;
      if (statusToSend.toLowerCase().includes('từ chối')) statusToSend = 'rejected';
      const response = await axios.put(
        `http://localhost:5000/api/bill/${selectedOrder._id}/return-request/status`,
        {
          status: statusToSend,
          adminNotes: returnRequestData.adminNotes.trim(),
          adminImages: imageUrls
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('Return update response:', response.data);

      if (response.status === 200) {
        toast.success('Đã cập nhật yêu cầu trả hàng!');
        fetchOrders(page);
        setShowReturnModal(false);
        setShowModal(false);

        // Reset form
        setReturnRequestData({
          status: '',
          adminNotes: ''
        });
        setImagePreview([]);
      }
    } catch (error) {
      console.error('Submit return update error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        'Có lỗi không xác định khi cập nhật yêu cầu trả hàng!';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setImageUploading(false);
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
      case 'yêu cầu trả hàng': return '#9333ea';
      case 'đang xử lý trả hàng': return '#9333ea';
      case 'đã hoàn tiền': return '#0284c7';
      case 'từ chối hoàn tiền': return '#ef4444';
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
        return ['đang giao hàng', 'đã hủy']; // Cho phép hủy đơn hàng đã xác nhận
      case 'đang giao hàng':
        return ['đã giao hàng'];
      case 'yêu cầu trả hàng':
        return []; // Admin sẽ xử lý qua modal riêng
      case 'đang xử lý trả hàng':
        return [];
      case 'đã hoàn tiền':
        return [];
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
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Khách hàng:</span>
                <span className={styles.detailValue}>{selectedOrder.receiver_name || selectedOrder.customer_name || selectedOrder.nguoi_dung_id?.name || 'Không có thông tin'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SĐT:</span>
                <span className={styles.detailValue}>{selectedOrder.receiver_phone || selectedOrder.customer_phone || selectedOrder.nguoi_dung_id?.phone || '---'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{selectedOrder.receiver_email || selectedOrder.customer_email || selectedOrder.nguoi_dung_id?.email || '---'}</span>
              </div>
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
                  <span className={styles.detailValue}>{
                    (selectedOrder.phi_van_chuyen && selectedOrder.phi_van_chuyen > 0)
                      ? `${selectedOrder.phi_van_chuyen.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                      : '30.000 ₫'
                  }</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Trạng thái thanh toán:</span>
                <span className={styles.detailValue} style={{ background: (selectedOrder.paymentStatus === 'paid' || selectedOrder.thanh_toan === 'đã thanh toán') ? '#10b981' : '#f59e0b', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: '0.9rem' }}>
                  {(selectedOrder.paymentStatus === 'paid' || selectedOrder.thanh_toan === 'đã thanh toán') ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
              <div className={styles.detailRow} style={{ alignItems: 'flex-start' }}>
                <span className={styles.detailLabel}>Địa chỉ giao hàng:</span>
                <span className={styles.detailValue}>
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
                </span>
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

              {/* Return Request Information */}
              {(selectedOrder.trang_thai === 'yêu cầu trả hàng' || selectedOrder.trang_thai === 'đang xử lý trả hàng' || selectedOrder.trang_thai === 'đã hoàn tiền') && selectedOrder.returnRequest && (
                <div style={{ marginTop: 20, padding: 15, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                  <h4 style={{ marginBottom: 12, fontSize: '1.1rem', color: '#495057', fontWeight: 600 }}>THÔNG TIN YÊU CẦU TRẢ HÀNG</h4>

                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#6c757d' }}>Trạng thái:</strong>
                    <span style={{
                      marginLeft: 8,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: selectedOrder.returnRequest.status === 'pending' ? '#fff3cd' :
                        selectedOrder.returnRequest.status === 'processing' ? '#cce5ff' :
                          selectedOrder.returnRequest.status === 'approved' ? '#d4edda' :
                            selectedOrder.returnRequest.status === 'rejected' ? '#f8d7da' : '#f8f9fa',
                      color: selectedOrder.returnRequest.status === 'pending' ? '#856404' :
                        selectedOrder.returnRequest.status === 'processing' ? '#004085' :
                          selectedOrder.returnRequest.status === 'approved' ? '#155724' :
                            selectedOrder.returnRequest.status === 'rejected' ? '#721c24' : '#6c757d'
                    }}>
                      {selectedOrder.returnRequest.status === 'pending' ? 'Chờ xử lý' :
                        selectedOrder.returnRequest.status === 'processing' ? 'Đang xử lý' :
                          selectedOrder.returnRequest.status === 'approved' ? 'Đã chấp nhận' :
                            selectedOrder.returnRequest.status === 'rejected' ? 'Đã từ chối' : '---'}
                    </span>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#6c757d' }}>Ngày yêu cầu:</strong>
                    <span style={{ marginLeft: 8, color: '#495057' }}>
                      {selectedOrder.returnRequest.requestDate ? formatDateTime(selectedOrder.returnRequest.requestDate) : '---'}
                    </span>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#6c757d' }}>Lý do:</strong>
                    <div style={{
                      marginTop: 4,
                      padding: '8px',
                      background: '#fff',
                      borderRadius: 4,
                      border: '1px solid #dee2e6',
                      fontSize: '0.9rem',
                      color: '#495057',
                      maxHeight: '60px',
                      overflow: 'auto'
                    }}>
                      {selectedOrder.returnRequest.reason || '---'}
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#6c757d' }}>Thông tin hoàn tiền:</strong>
                    {selectedOrder.returnRequest.bankInfo ? (
                      <div style={{ marginTop: 4, padding: '8px', background: '#fff', borderRadius: 4, border: '1px solid #dee2e6', fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: '#495057' }}>Ngân hàng:</strong>
                          <span style={{ marginLeft: 8, color: '#007bff', fontWeight: '500' }}>
                            {selectedOrder.returnRequest.bankInfo.bankName || '---'}
                          </span>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: '#495057' }}>Số tài khoản:</strong>
                          <span style={{ marginLeft: 8, color: '#28a745', fontWeight: '600', fontFamily: 'monospace' }}>
                            {selectedOrder.returnRequest.bankInfo.accountNumber || '---'}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#495057' }}>Tên chủ tài khoản:</strong>
                          <span style={{ marginLeft: 8, color: '#6c757d', fontWeight: '500' }}>
                            {selectedOrder.returnRequest.bankInfo.accountName || '---'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        marginTop: 4,
                        padding: '8px',
                        background: '#f8f9fa',
                        borderRadius: 4,
                        border: '1px solid #dee2e6',
                        fontSize: '0.85rem',
                        color: '#6c757d',
                        fontStyle: 'italic'
                      }}>
                        Khách hàng chưa cung cấp thông tin hoàn tiền
                      </div>
                    )}
                  </div>

                  {selectedOrder.returnRequest.images && selectedOrder.returnRequest.images.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#6c757d' }}>Hình ảnh từ khách hàng:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        {selectedOrder.returnRequest.images.map((img, idx) => (
                          <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                            <img
                              src={img}
                              alt={`Return image ${idx}`}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 4,
                                border: '1px solid #dee2e6'
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedOrder.returnRequest.adminNotes && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#6c757d' }}>Ghi chú từ admin:</strong>
                      <div style={{
                        marginTop: 4,
                        padding: '8px',
                        background: '#fff3cd',
                        borderRadius: 4,
                        border: '1px solid #ffeaa7',
                        fontSize: '0.9rem',
                        color: '#495057'
                      }}>
                        {selectedOrder.returnRequest.adminNotes}
                      </div>
                    </div>
                  )}

                  {selectedOrder.returnRequest.adminImages && selectedOrder.returnRequest.adminImages.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#6c757d' }}>Hình ảnh từ admin:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        {selectedOrder.returnRequest.adminImages.map((img, idx) => (
                          <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                            <img
                              src={img}
                              alt={`Admin image ${idx}`}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 4,
                                border: '1px solid #dee2e6'
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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

              {/* Return Request Button */}
              {selectedOrder.trang_thai === 'yêu cầu trả hàng' && (
                <button
                  onClick={() => handleReturnRequest(selectedOrder)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    background: '#9333ea',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Xử lý trả hàng
                </button>
              )}

              <button onClick={() => setShowModal(false)} className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: '8px 20px', marginLeft: getNextStatusOptions(selectedOrder.trang_thai).length > 0 || selectedOrder.trang_thai === 'yêu cầu trả hàng' ? 'initial' : 'auto' }}>
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

      {/* Return Request Processing Modal */}
      {showReturnModal && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className={styles.card} style={{
            background: 'var(--card-bg)',
            borderRadius: 12,
            padding: 24,
            minWidth: 500,
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            color: 'var(--text-primary)'
          }}>
            <h4 style={{ fontSize: '1.5rem', marginBottom: 20, color: 'var(--text-primary)' }}>
              Xử lý yêu cầu trả hàng - #{selectedOrder.orderId || selectedOrder._id.slice(-8).toUpperCase()}
            </h4>

            {/* Customer Return Info */}
            <div style={{ marginBottom: 20, padding: 15, background: '#f8f9fa', borderRadius: 8 }}>
              <h5 style={{ marginBottom: 10, color: '#495057' }}>Thông tin từ khách hàng:</h5>

              <div style={{ marginBottom: 8 }}>
                <strong>Lý do:</strong>
                <div style={{ marginTop: 4, padding: 8, background: '#fff', borderRadius: 4, fontSize: '0.9rem' }}>
                  {selectedOrder.returnRequest?.reason || '---'}
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Thông tin hoàn tiền:</strong>
                {selectedOrder.returnRequest?.bankInfo ? (
                  <div style={{ marginTop: 4, padding: 8, background: '#fff', borderRadius: 4, fontSize: '0.85rem', border: '1px solid #dee2e6' }}>
                    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                      <span style={{ minWidth: '80px', color: '#495057', fontWeight: '500' }}>Ngân hàng:</span>
                      <span style={{ color: '#007bff', fontWeight: '600', marginLeft: 8 }}>
                        {selectedOrder.returnRequest.bankInfo.bankName || '---'}
                      </span>
                    </div>
                    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                      <span style={{ minWidth: '80px', color: '#495057', fontWeight: '500' }}>STK:</span>
                      <span style={{ color: '#28a745', fontWeight: '600', fontFamily: 'monospace', marginLeft: 8 }}>
                        {selectedOrder.returnRequest.bankInfo.accountNumber || '---'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ minWidth: '80px', color: '#495057', fontWeight: '500' }}>Chủ TK:</span>
                      <span style={{ color: '#6c757d', fontWeight: '500', marginLeft: 8 }}>
                        {selectedOrder.returnRequest.bankInfo.accountName || '---'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    marginTop: 4,
                    padding: 8,
                    background: '#f8f9fa',
                    borderRadius: 4,
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    fontStyle: 'italic',
                    border: '1px solid #dee2e6'
                  }}>
                    Khách hàng chưa cung cấp thông tin hoàn tiền
                  </div>
                )}
              </div>

              {selectedOrder.returnRequest?.images && selectedOrder.returnRequest.images.length > 0 && (
                <div>
                  <strong>Hình ảnh:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {selectedOrder.returnRequest.images.map((img, idx) => (
                      <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                        <img src={img} alt={`Return ${idx}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Response Form */}
            <div style={{ marginBottom: 20 }}>
              <h5 style={{ marginBottom: 15, color: '#495057' }}>Phản hồi của admin:</h5>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Trạng thái xử lý *</label>
                <select
                  value={returnRequestData.status}
                  onChange={e => setReturnRequestData({ ...returnRequestData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                >
                  <option value="processing">Đang xử lý</option>
                  <option value="approved">Chấp nhận - Hoàn tiền</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Ghi chú cho khách hàng</label>
                <textarea
                  value={returnRequestData.adminNotes}
                  onChange={e => setReturnRequestData({ ...returnRequestData, adminNotes: e.target.value })}
                  placeholder="Nhập ghi chú, hướng dẫn cho khách hàng..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Hình ảnh đính kèm (không bắt buộc)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReturnImageChange}
                  style={{ marginBottom: 10 }}
                />

                {imagePreview.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {imagePreview.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={img.preview}
                          alt={`Preview ${idx}`}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <button
                          onClick={() => {
                            const newPreview = [...imagePreview];
                            newPreview.splice(idx, 1);
                            setImagePreview(newPreview);
                          }}
                          style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: 'rgba(255,0,0,0.7)',
                            color: 'white',
                            border: 'none',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnRequestData({ adminNotes: '', images: [], status: 'processing' });
                  setImagePreview([]);
                }}
                disabled={imageUploading}
              >
                Hủy
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={submitReturnUpdate}
                disabled={imageUploading || !returnRequestData.status}
                style={{
                  background: returnRequestData.status === 'approved' ? '#10b981' :
                    returnRequestData.status === 'rejected' ? '#ef4444' : '#3b82f6'
                }}
              >
                {imageUploading ? 'Đang xử lý...' :
                  returnRequestData.status === 'approved' ? 'Chấp nhận & Hoàn tiền' :
                    returnRequestData.status === 'rejected' ? 'Từ chối yêu cầu' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrder;