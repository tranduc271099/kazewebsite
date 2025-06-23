import React from 'react';
import '../styles/UserDetail.css';

const UserDetail = ({ user }) => {
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    return (
        <div className="user-detail">
            <div className="detail-header">
                <div className="user-avatar">
                    {getInitials(user.name)}
                </div>
                <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <span className="user-role">{user.role}</span>
                </div>
            </div>

            <div className="user-detail-grid">
                <div className="detail-item">
                    <div className="detail-label">Trạng thái</div>
                    <div className="detail-value">
                        <span className={`status-badge ${user.isLocked ? 'locked' : 'active'}`}>
                            {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                    </div>
                </div>

                <div className="detail-item">
                    <div className="detail-label">Thông tin liên hệ</div>
                    <div className="contact-info">
                        <div className="contact-item">
                            <i className="fas fa-envelope"></i>
                            {user.email}
                        </div>
                        {user.phone && (
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                {user.phone}
                            </div>
                        )}
                    </div>
                </div>

                {user.address && (
                    <div className="detail-item">
                        <div className="detail-label">Địa chỉ</div>
                        <div className="detail-value">{user.address}</div>
                    </div>
                )}

                <div className="detail-item">
                    <div className="detail-label">Thời gian</div>
                    <div className="detail-value">
                        <div>Tạo tài khoản: {formatDate(user.createdAt)}</div>
                        <div className="created-at">
                            Cập nhật: {formatDate(user.updatedAt)}
                        </div>
                    </div>
                </div>
            </div>

            {user.vouchers && user.vouchers.length > 0 && (
                <div className="detail-section">
                    <h4 className="section-title">Vouchers</h4>
                    <div className="voucher-list">
                        {user.vouchers.map((voucher, index) => (
                            <div key={index} className="voucher-item">
                                {voucher}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail; 