import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UserManagement.css';

const initialForm = {
  name: '',
  minOrder: '',
  discountType: 'amount',
  discountValue: '',
  startDate: '',
  endDate: ''
};

// VoucherAdd component
const VoucherAdd = ({ form, setForm, handleSubmit, editingId, setEditingId, initialForm, error, success }) => (
  <form onSubmit={handleSubmit} style={{ marginBottom: 24, minWidth: 320 }}>
    <div className="form-group" style={{ marginBottom: 12 }}>
      <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Tên voucher *</label>
      <input
        type="text"
        name="name"
        className="form-control"
        placeholder="Tên voucher"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
        style={{ width: '100%' }}
      />
    </div>
    <div className="form-group" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
      <input
        type="number"
        name="minOrder"
        className="form-control"
        placeholder="Giá trị đơn hàng tối thiểu"
        value={form.minOrder}
        onChange={e => setForm({ ...form, minOrder: e.target.value })}
        required
        style={{ flex: 2 }}
      />
      <select
        name="discountType"
        className="form-control"
        value={form.discountType}
        onChange={e => setForm({ ...form, discountType: e.target.value })}
        style={{ flex: 1 }}
      >
        <option value="amount">Giảm theo giá</option>
        <option value="percent">Giảm theo %</option>
      </select>
    </div>
    <div className="form-group" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
      <input
        type="number"
        name="discountValue"
        className="form-control"
        placeholder={form.discountType === 'amount' ? 'Số tiền giảm' : 'Phần trăm giảm'}
        value={form.discountValue}
        onChange={e => setForm({ ...form, discountValue: e.target.value })}
        required
        style={{ flex: 1 }}
      />
      <input
        type="date"
        name="startDate"
        className="form-control"
        value={form.startDate}
        onChange={e => setForm({ ...form, startDate: e.target.value })}
        required
        style={{ flex: 1 }}
      />
      <input
        type="date"
        name="endDate"
        className="form-control"
        value={form.endDate}
        onChange={e => setForm({ ...form, endDate: e.target.value })}
        required
        style={{ flex: 1 }}
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <button type="submit" className="btn btn-primary">
        {editingId ? 'Cập nhật' : 'Thêm'} voucher
      </button>
    </div>
    {editingId && (
      <button type="button" onClick={() => { setForm(initialForm); setEditingId(null); }}>Hủy</button>
    )}
    {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
    {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
  </form>
);

// VoucherEdit component
const VoucherEdit = ({ form, setForm, handleSubmit, setEditingId, initialForm, error, success }) => (
  <form onSubmit={handleSubmit} style={{ marginBottom: 24, minWidth: 320 }}>
    <div className="form-group" style={{ marginBottom: 12 }}>
      <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Tên voucher *</label>
      <input
        type="text"
        name="name"
        className="form-control"
        placeholder="Tên voucher"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
        style={{ width: '100%' }}
      />
    </div>
    <div className="form-group" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
      <input
        type="number"
        name="minOrder"
        className="form-control"
        placeholder="Giá trị đơn hàng tối thiểu"
        value={form.minOrder}
        onChange={e => setForm({ ...form, minOrder: e.target.value })}
        required
        style={{ flex: 2 }}
      />
      <select
        name="discountType"
        className="form-control"
        value={form.discountType}
        onChange={e => setForm({ ...form, discountType: e.target.value })}
        style={{ flex: 1 }}
      >
        <option value="amount">Giảm theo giá</option>
        <option value="percent">Giảm theo %</option>
      </select>
    </div>
    <div className="form-group" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
      <input
        type="number"
        name="discountValue"
        className="form-control"
        placeholder={form.discountType === 'amount' ? 'Số tiền giảm' : 'Phần trăm giảm'}
        value={form.discountValue}
        onChange={e => setForm({ ...form, discountValue: e.target.value })}
        required
        style={{ flex: 1 }}
      />
      <input
        type="date"
        name="startDate"
        className="form-control"
        value={form.startDate}
        onChange={e => setForm({ ...form, startDate: e.target.value })}
        required
        style={{ flex: 1 }}
      />
      <input
        type="date"
        name="endDate"
        className="form-control"
        value={form.endDate}
        onChange={e => setForm({ ...form, endDate: e.target.value })}
        required
        style={{ flex: 1 }}
      />
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <button type="submit" className="btn btn-primary">
        Cập nhật voucher
      </button>
    </div>
    {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
    {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
  </form>
);

// VoucherList component
const VoucherList = ({ vouchers, handleEdit, handleDelete, onAdd }) => (
  <div className="user-management-container">
    <div className="user-management-header">
      <h2>Quản lý voucher</h2>
      <button className="btn btn-primary" onClick={onAdd}>
        <i className="fas fa-plus me-1"></i>
        Thêm voucher
      </button>
    </div>
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Đơn tối thiểu</th>
            <th>Kiểu giảm</th>
            <th>Giá trị giảm</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map(v => (
            <tr key={v._id}>
              <td>{v.name}</td>
              <td>{v.minOrder}</td>
              <td>{v.discountType === 'amount' ? 'Giá' : '%'}</td>
              <td>{v.discountType === 'amount' ? `${v.discountValue} đ` : `${v.discountValue}%`}</td>
              <td>{v.startDate.slice(0, 10)}</td>
              <td>{v.endDate.slice(0, 10)}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(v)}>Sửa</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Main Vouchers component
const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Thêm các state filter, search, phân trang
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortType, setSortType] = useState('newest');

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data);
    } catch (err) {
      setVouchers([]);
      setError('Không thể tải danh sách voucher');
    }
  };

  const validateForm = () => {
    if (!form.name || !form.minOrder || !form.discountValue || !form.startDate || !form.endDate) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return false;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('token');
      let submitForm = {
        ...form,
        minOrder: Number(form.minOrder),
        discountValue: Number(form.discountValue)
      };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/vouchers/${editingId}`, submitForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Cập nhật voucher thành công!');
      } else {
        await axios.post('http://localhost:5000/api/vouchers', submitForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Thêm voucher thành công!');
      }
      setForm(initialForm);
      setEditingId(null);
      setShowAddModal(false);
      setShowEditModal(false);
      fetchVouchers();
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu voucher');
    }
  };

  const handleEdit = (voucher) => {
    setForm({
      name: voucher.name,
      minOrder: voucher.minOrder,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      startDate: voucher.startDate.slice(0, 10),
      endDate: voucher.endDate.slice(0, 10)
    });
    setEditingId(voucher._id);
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Đã xóa voucher!');
      fetchVouchers();
    } catch (err) {
      setError('Không thể xóa voucher');
    }
  };

  const handleAddVoucher = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setForm(initialForm);
    setEditingId(null);
  };

  // Filter, search, sort, phân trang
  const filteredVouchers = vouchers.filter(v => {
    const searchText = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(searchText) ||
      (v._id || '').toLowerCase().includes(searchText)
    );
  });
  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    if (sortType === 'newest') {
      return new Date(b.startDate) - new Date(a.startDate);
    } else if (sortType === 'oldest') {
      return new Date(a.startDate) - new Date(b.startDate);
    } else if (sortType === 'minOrder_asc') {
      return a.minOrder - b.minOrder;
    } else if (sortType === 'minOrder_desc') {
      return b.minOrder - a.minOrder;
    }
    return 0;
  });
  const totalPages = Math.ceil(sortedVouchers.length / limit);
  const pagedVouchers = sortedVouchers.slice((page - 1) * limit, page * limit);

  return (
    <div className="content-inner" style={{ maxWidth: 1700, margin: '0 auto', padding: '32px 0' }}>
      {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
      {success && <div style={{color: 'green', marginBottom: 8}}>{success}</div>}
      <h2 style={{ fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Quản lý voucher</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={handleAddVoucher}>
          <i className="fas fa-plus me-1"></i>
          Thêm voucher
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã voucher..."
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
          <option value="minOrder_asc">Đơn tối thiểu tăng dần</option>
          <option value="minOrder_desc">Đơn tối thiểu giảm dần</option>
        </select>
        <span style={{ color: '#888', fontSize: 13 }}>Tổng voucher: {filteredVouchers.length}</span>
      </div>
      <div style={{ background: '#181f2a', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 0, marginBottom: 32 }}>
        <table className="table" style={{ margin: 0, minWidth: 1500 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Tên</th>
              <th style={{ textAlign: 'center' }}>Đơn tối thiểu</th>
              <th style={{ textAlign: 'center' }}>Kiểu giảm</th>
              <th style={{ textAlign: 'center' }}>Giá trị giảm</th>
              <th style={{ textAlign: 'center' }}>Bắt đầu</th>
              <th style={{ textAlign: 'center' }}>Kết thúc</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedVouchers.map(v => (
              <tr key={v._id}>
                <td style={{ textAlign: 'center', fontWeight: 500 }}>{v.name}</td>
                <td style={{ textAlign: 'center' }}>{v.minOrder}</td>
                <td style={{ textAlign: 'center' }}>{v.discountType === 'amount' ? 'Giá' : '%'}</td>
                <td style={{ textAlign: 'center' }}>{v.discountType === 'amount' ? `${v.discountValue} đ` : `${v.discountValue}%`}</td>
                <td style={{ textAlign: 'center' }}>{v.startDate.slice(0, 10)}</td>
                <td style={{ textAlign: 'center' }}>{v.endDate.slice(0, 10)}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className="action-buttons" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button className="btn btn-primary btn-sm me-2" style={{ width: 70 }} onClick={() => handleEdit(v)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" style={{ width: 70 }} onClick={() => handleDelete(v._id)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {pagedVouchers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Không có voucher nào phù hợp</td>
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
      {/* Modal Thêm/Sửa giữ nguyên như cũ */}
      {showAddModal && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Thêm voucher</h3>
            <VoucherAdd
              form={form}
              setForm={setForm}
              handleSubmit={handleSubmit}
              editingId={editingId}
              setEditingId={setEditingId}
              initialForm={initialForm}
              error={error}
              success={success}
            />
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Cập nhật voucher</h3>
            <VoucherEdit
              form={form}
              setForm={setForm}
              handleSubmit={handleSubmit}
              setEditingId={setEditingId}
              initialForm={initialForm}
              error={error}
              success={success}
            />
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers; 