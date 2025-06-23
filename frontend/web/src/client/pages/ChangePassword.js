import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // State cho user profile
    const [profile, setProfile] = useState({ name: '', image: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile({
                    name: res.data.name || 'Tên người dùng',
                    image: res.data.image || ''
                });
            } catch { }
        };
        fetchProfile();
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (form.newPassword !== form.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/change-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Đổi mật khẩu thành công!');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý avatar giống Profile
    let avatar = '';
    if (profile.image) {
        if (profile.image.startsWith('http')) {
            avatar = profile.image;
        } else {
            // fallback: luôn thêm domain nếu không phải http
            let imgPath = profile.image.replace('/api', '');
            if (!imgPath.startsWith('/')) imgPath = '/' + imgPath;
            avatar = `http://localhost:5000${imgPath}`;
        }
    }
    const userName = profile.name || 'Tên người dùng';

    return (
        <div className="profile-page" style={{ background: '#f5f5f7', minHeight: '100vh', padding: '40px 0', marginTop: 80 }}>
            <div className="container" style={{ display: 'flex', gap: 32, maxWidth: 1100, margin: '0 auto', flexWrap: 'wrap' }}>
                {/* Sidebar */}
                <aside className="profile-sidebar" style={{
                    width: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minHeight: 400
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', background: '#eee', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bbb', overflow: 'hidden'
                        }}>
                            {avatar ? (
                                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className="bi bi-person"></i>
                            )}
                        </div>
                        <div style={{ fontWeight: 600, textAlign: 'center' }}>{userName}</div>
                        <div style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>Sửa Hồ Sơ</div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16, textAlign: 'left' }}>
                        <li style={{ margin: '16px 0' }}>
                            <Link to="/profile" style={{ color: '#333', textDecoration: 'none' }}>Hồ Sơ</Link>
                        </li>
                        <li style={{ margin: '16px 0' }}>
                            <Link to="/change-password" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Đổi Mật Khẩu</Link>
                        </li>
                        <li style={{ margin: '16px 0' }}>
                            <Link to="/orders" style={{ color: '#333', textDecoration: 'none' }}>Đơn Mua</Link>
                        </li>
                    </ul>
                </aside>
                {/* Main content */}
                <div style={{ flex: 1, minWidth: 320 }}>
                    <div className="profile-content" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 36, margin: '0 auto' }}>
                        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 28 }}>Đổi Mật Khẩu</h2>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
                            {/* Current password */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                                <label htmlFor="currentPassword" style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={form.currentPassword}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                    style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                            </div>
                            {/* New password */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                                <label htmlFor="newPassword" style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                    style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                            </div>
                            {/* Confirm password */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                                <label htmlFor="confirmPassword" style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                    style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                            </div>
                            {/* Nút lưu */}
                            <div style={{ marginLeft: 120 }}>
                                <button type="submit" className="btn-save" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, fontSize: 16 }}>
                                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
            @media (max-width: 900px) {
                .profile-page .container { flex-direction: column !important; gap: 24px !important; }
                .profile-sidebar { width: 100% !important; margin-bottom: 24px; }
            }
            `}</style>
        </div>
    );
};

export default ChangePassword; 