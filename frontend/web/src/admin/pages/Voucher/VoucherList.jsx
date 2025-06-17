import React from 'react';

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

export default VoucherList;
