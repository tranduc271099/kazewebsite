import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProfileSidebar = ({ activePage }) => {
    const { user } = useUser();

    // Avatar handling
    let avatar = '';
    if (user?.image) {
        if (user.image.startsWith('http')) avatar = user.image;
        else if (user.image.startsWith('/uploads/')) avatar = `http://localhost:5000${user.image}`;
        else if (user.image.startsWith('/api/uploads/')) avatar = `http://localhost:5000${user.image.replace('/api', '')}`;
        else avatar = `http://localhost:5000/${user.image}`;
    } else {
        avatar = '/default-avatar.png';
    }

    const getLinkStyle = (page) => ({
        color: activePage === page ? '#2563eb' : '#333',
        fontWeight: activePage === page ? 600 : 'normal',
        textDecoration: 'none'
    });

    const getSubtitle = () => {
        switch (activePage) {
            case 'profile':
                return 'Sửa Hồ Sơ';
            case 'bill':
                return 'Quản lý đơn hàng';
            case 'change-password':
                return 'Bảo mật tài khoản';
            default:
                return 'Sửa Hồ Sơ';
        }
    }

    return (
        <aside className="profile-sidebar" style={{
            width: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minHeight: 400, flexShrink: 0
        }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: '#eee', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bbb', overflow: 'hidden'
                }}>
                    <img
                        src={avatar}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div style={{ fontWeight: 600, textAlign: 'center' }}>{user?.name || 'Tên người dùng'}</div>
                <div style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>{getSubtitle()}</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16, textAlign: 'left' }}>
                <li style={{ margin: '16px 0' }}>
                    <Link to="/profile" style={getLinkStyle('profile')}>Hồ Sơ</Link>
                </li>
                <li style={{ margin: '16px 0' }}>
                    <Link to="/change-password" style={getLinkStyle('change-password')}>Đổi Mật Khẩu</Link>
                </li>
                <li style={{ margin: '16px 0' }}>
                    <Link to="/bill" style={getLinkStyle('bill')}>Đơn Mua</Link>
                </li>
            </ul>
        </aside>
    );
};

export default ProfileSidebar; 