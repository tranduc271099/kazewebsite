import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoucherList from './VoucherList';
import VoucherAdd from './VoucherAdd';
import VoucherEdit from './VoucherEdit';
import '../../styles/UserManagement.css';

const initialForm = {
  name: '',
  minOrder: '',
  discountType: 'amount',
  discountValue: '',
  startDate: '',
  endDate: ''
};

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Lấy danh sách voucher từ backend (giả lập API)
  useEffect(() => {
    fetchVouchers();
  }, []);

  // Reset success/error message after 3s
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
      console.log('Vouchers from API:', res.data); // DEBUG
      setVouchers(res.data);
    } catch (err) {
      setVouchers([]);
      setError('Không thể tải danh sách voucher');
      console.error('Lỗi khi fetch vouchers:', err); // DEBUG
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  return (
    <div className="content-inner">
      {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
      {success && <div style={{color: 'green', marginBottom: 8}}>{success}</div>}
      <VoucherList vouchers={vouchers} handleEdit={handleEdit} handleDelete={handleDelete} onAdd={handleAddVoucher} />
      {/* Modal Thêm voucher */}
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
      {/* Modal Sửa voucher */}
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