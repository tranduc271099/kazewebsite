import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoucherList from './VoucherList';
import VoucherAdd from './VoucherAdd';
import VoucherEdit from './VoucherEdit';

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

  // Lấy danh sách voucher từ backend (giả lập API)
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data);
    } catch (err) {
      setVouchers([]);
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
      if (editingId) {
        await axios.put(`http://localhost:5000/api/vouchers/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Cập nhật voucher thành công!');
      } else {
        await axios.post('http://localhost:5000/api/vouchers', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Thêm voucher thành công!');
      }
      setForm(initialForm);
      setEditingId(null);
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

  return (
    <div className="voucher-management">
      <h2>Quản lý Voucher</h2>
      {editingId ? (
        <VoucherEdit
          form={form}
          setForm={setForm}
          handleSubmit={handleSubmit}
          setEditingId={setEditingId}
          initialForm={initialForm}
          error={error}
          success={success}
        />
      ) : (
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
      )}
      <VoucherList vouchers={vouchers} handleEdit={handleEdit} handleDelete={handleDelete} />
    </div>
  );
};

export default Vouchers; 