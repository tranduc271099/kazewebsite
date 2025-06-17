import React from 'react';

const VoucherList = ({ vouchers, handleEdit, handleDelete }) => (
  <table border="1" cellPadding="8" style={{width: '100%', borderCollapse: 'collapse'}}>
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
            <button onClick={() => handleEdit(v)}>Sửa</button>
            <button onClick={() => handleDelete(v._id)} style={{marginLeft: 8}}>Xóa</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default VoucherList; 