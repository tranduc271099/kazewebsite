import React from 'react';
import './UserDetail.css';

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
        <div className="user-detail-container">
            <div className="user-detail-left">
                <div className="user-avatar">
                    {user.image ? (
                        <img src={user.image} alt={user.name} />
                    ) : (
                        <div className="avatar-placeholder">No Image</div>
                    )}
                </div>
                <div className="user-main-info">
                    <h2>{user.name}</h2>
                    <div className="user-role">{user.role}</div>
                    <div className={`user-status ${user.isLocked ? 'locked' : 'active'}`}>{user.isLocked ? 'Đã khóa' : 'Hoạt động'}</div>
                </div>
            </div>
            <div className="user-detail-right">
                <h4>Chi tiết người dùng</h4>
                <div className="user-detail-grid">
                    {Object.entries(user).map(([key, value]) => {
                        if (['password', '__v', 'image', 'name', 'role', 'isLocked'].includes(key)) return null;
                        let displayValue = value;
                        if (value === null || value === undefined || value === '') displayValue = 'Chưa có';
                        if (key === 'createdAt' || key === 'updatedAt') displayValue = formatDate(value);
                        if (Array.isArray(value)) displayValue = value.length > 0 ? value.join(', ') : 'Chưa có';
                        if (typeof value === 'boolean') displayValue = value ? 'Có' : 'Không';
                        return (
                            <div className="detail-item" key={key}>
                                <div className="detail-label">{keyMap[key] || key}</div>
                                <div className="detail-value">{displayValue}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserDetail; 