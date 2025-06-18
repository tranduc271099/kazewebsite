import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        image: '',
        imageFile: null,
        role: '',
        isLocked: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                image: res.data.image || '',
                imageFile: null,
                role: res.data.role || '',
                isLocked: res.data.isLocked || false
            });
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            setError('Không thể tải thông tin cá nhân');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setFormData(f => ({
                ...f,
                imageFile: file,
                image: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            const form = new FormData();
            form.append('name', formData.name);
            form.append('phone', formData.phone);
            form.append('address', formData.address);
            if (formData.imageFile) {
                form.append('image', formData.imageFile);
            }
            await axios.put('http://localhost:5000/api/users/me', form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Cập nhật thông tin thành công!');
            localStorage.setItem('userName', formData.name);
            fetchProfile();
        } catch (err) {
            setError('Cập nhật thất bại!');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page" style={{ background: '#f5f5f7', minHeight: '100vh', padding: '40px 0', marginTop: 80 }}>
            <div className="container" style={{ display: 'flex', gap: 32, maxWidth: 1100, margin: '0 auto' }}>
                {/* Sidebar */}
                <aside className="profile-sidebar" style={{
                    width: 220, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minHeight: 400
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', background: '#eee', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bbb', overflow: 'hidden'
                        }}>
                            {formData.image ? (
                                <img
                                    src={formData.image.startsWith('blob:')
                                        ? formData.image
                                        : formData.image.startsWith('http')
                                            ? formData.image
                                            : formData.image.startsWith('/api/uploads/')
                                                ? `http://localhost:5000${formData.image.replace('/api', '')}`
                                                : formData.image
                                    }
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                                />
                            ) : (
                                <i className="bi bi-person"></i>
                            )}
                        </div>
                        <div style={{ fontWeight: 600 }}>{formData.name || 'Tên người dùng'}</div>
                        <div style={{ fontSize: 13, color: '#888' }}>Sửa Hồ Sơ</div>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16 }}>
                        <li style={{ margin: '16px 0' }}>
                            <Link to="/profile" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Hồ Sơ</Link>
                        </li>
                        <li style={{ margin: '16px 0' }}>
                            <Link to="/change-password" style={{ color: '#333', textDecoration: 'none' }}>Đổi Mật Khẩu</Link>
                        </li>
                        <li style={{ margin: '16px 0' }}>
                            <Link to="/orders" style={{ color: '#333', textDecoration: 'none' }}>Đơn Mua</Link>
                        </li>
                    </ul>
                </aside>
                {/* Main content */}
                <main className="profile-main" style={{
                    flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 36, minWidth: 0
                }}>
                    <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Hồ Sơ Của Tôi</h2>
                    <div style={{ color: '#888', marginBottom: 24 }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
                    <form style={{ maxWidth: 600 }} onSubmit={handleSubmit}>
                        {/* Avatar upload */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Ảnh đại diện</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {formData.image ? (
                                        <img
                                            src={formData.image.startsWith('blob:')
                                                ? formData.image
                                                : formData.image.startsWith('http')
                                                    ? formData.image
                                                    : formData.image.startsWith('/api/uploads/')
                                                        ? `http://localhost:5000${formData.image.replace('/api', '')}`
                                                        : formData.image
                                            }
                                            alt="avatar"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                                        />
                                    ) : (
                                        <i className="bi bi-person" style={{ fontSize: 28, color: '#bbb' }}></i>
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 14 }} />
                            </div>
                        </div>
                        {/* Name */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Tên</label>
                            <input type="text" value={formData.name} onChange={handleChange} name="name"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} required />
                        </div>
                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Email</label>
                            <input type="email" value={formData.email} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* Phone */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Số điện thoại</label>
                            <input type="tel" value={formData.phone} onChange={handleChange} name="phone"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        {/* Address */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Địa chỉ</label>
                            <input type="text" value={formData.address} onChange={handleChange} name="address"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        {/* Role (readonly) */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Vai trò</label>
                            <input type="text" value={formData.role || ''} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* isLocked (readonly) */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 120, color: '#555' }}>Trạng thái</label>
                            <input type="text" value={formData.isLocked ? 'Bị khóa' : 'Hoạt động'} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* Nút lưu */}
                        <div style={{ marginLeft: 120 }}>
                            <button type="submit" style={{
                                background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, fontSize: 16
                            }}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Profile; 