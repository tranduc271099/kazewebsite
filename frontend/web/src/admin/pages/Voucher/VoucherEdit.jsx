import React from 'react';

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

export default VoucherEdit; 