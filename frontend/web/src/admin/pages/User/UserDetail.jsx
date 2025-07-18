import React from 'react';

const keyMap = {
    _id: 'Mã người dùng',
    name: 'Tên',
    email: 'Email',
    role: 'Vai trò',
    vouchers: 'Voucher',
    isLocked: 'Trạng thái',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
    phone: 'Số điện thoại',
    address: 'Địa chỉ',
    image: 'Link ảnh đại diện',
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa có';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
};

const UserDetail = ({ user }) => {
    if (!user) {
        return null;
    }

    return (
        <div style={{ padding: 24, background: '#181c24', color: '#fff', borderRadius: 10 }}>
            <h4 style={{ color: '#fff', marginBottom: 20 }}>Chi tiết người dùng</h4>
            <table style={{ width: '100%', background: 'transparent', borderCollapse: 'collapse' }}>
                <tbody>
                    {Object.entries(user).map(([key, value]) => {
                        if (key === 'password' || key === '__v') return null;
                        let displayValue = value;
                        if (value === null || value === undefined || value === '') displayValue = 'Chưa có';
                        if (key === 'createdAt' || key === 'updatedAt') displayValue = formatDate(value);
                        if (Array.isArray(value)) displayValue = value.length > 0 ? value.join(', ') : 'Chưa có';
                        if (typeof value === 'boolean') displayValue = key === 'isLocked' ? (value ? 'Đã khóa' : 'Hoạt động') : (value ? 'Có' : 'Không');
                        if (key === 'image') displayValue = value !== 'Chưa có' ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#4fa3ff' }}>{value}</a> : 'Chưa có';
                        return (
                            <tr key={key} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ fontWeight: 600, padding: '8px 12px', color: '#b0b8c1', width: 180 }}>
                                    {keyMap[key] || key}
                                </td>
                                <td style={{ padding: '8px 12px', color: '#fff' }}>{displayValue}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserDetail; 