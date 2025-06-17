import React from 'react';

const VoucherAdd = ({ form, setForm, handleSubmit, editingId, setEditingId, initialForm, error, success }) => (
  <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
    <input
      type="text"
      name="name"
      placeholder="Tên voucher"
      value={form.name}
      onChange={e => setForm({ ...form, name: e.target.value })}
      required
    />
    <input
      type="number"
      name="minOrder"
      placeholder="Giá trị đơn hàng tối thiểu"
      value={form.minOrder}
      onChange={e => setForm({ ...form, minOrder: e.target.value })}
      required
    />
    <select
      name="discountType"
      value={form.discountType}
      onChange={e => setForm({ ...form, discountType: e.target.value })}
    >
      <option value="amount">Giảm theo giá</option>
      <option value="percent">Giảm theo %</option>
    </select>
    <input
      type="number"
      name="discountValue"
      placeholder={form.discountType === 'amount' ? 'Số tiền giảm' : 'Phần trăm giảm'}
      value={form.discountValue}
      onChange={e => setForm({ ...form, discountValue: e.target.value })}
      required
    />
    <input
      type="date"
      name="startDate"
      value={form.startDate}
      onChange={e => setForm({ ...form, startDate: e.target.value })}
      required
    />
    <input
      type="date"
      name="endDate"
      value={form.endDate}
      onChange={e => setForm({ ...form, endDate: e.target.value })}
      required
    />
    <button type="submit">{editingId ? 'Cập nhật' : 'Thêm'} voucher</button>
    {editingId && (
      <button type="button" onClick={() => { setForm(initialForm); setEditingId(null); }}>Hủy</button>
    )}
    {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
    {success && <div style={{color: 'green', marginBottom: 8}}>{success}</div>}
  </form>
);

export default VoucherAdd; 