import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';
import { useUser } from '../context/UserContext';
import ProfileSidebar from '../components/ProfileSidebar';

const Profile = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        image: '',
        imageFile: null,
        role: '',
        gender: '', // Add gender field
        dob: '',    // Add dob field
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
                gender: res.data.gender || '', // Populate gender
                dob: res.data.dob ? new Date(res.data.dob).toISOString().split('T')[0] : '', // Populate dob
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

    let avatar = '';
    if (formData.image && formData.image.startsWith('blob:')) {
        avatar = formData.image;
    } else if (user?.image) {
        if (user.image.startsWith('http')) avatar = user.image;
        else if (user.image.startsWith('/uploads/')) avatar = `http://localhost:5000${user.image}`;
        else if (user.image.startsWith('/api/uploads/')) avatar = `http://localhost:5000${user.image.replace('/api', '')}`;
        else avatar = `http://localhost:5000/${user.image}`;
    } else {
        avatar = '/default-avatar.png';
    }

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
            form.append('gender', formData.gender); // Append gender
            form.append('dob', formData.dob);       // Append dob
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
            window.location.reload();
            localStorage.setItem('userName', formData.name);
            const res = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setFormData(f => ({ ...f, image: res.data.image || '' }));
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
                <ProfileSidebar activePage="profile" />
                {/* Main content */}
                <main className="profile-main" style={{
                    flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 36, minWidth: 0
                }}>
                    <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Hồ Sơ Của Tôi</h2>
                    <div style={{ color: '#888', marginBottom: 24 }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
                    <form style={{ maxWidth: 600 }} onSubmit={handleSubmit}>
                        {/* Avatar upload */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Ảnh đại diện</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src={avatar}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 14 }} />
                            </div>
                        </div>
                        {/* Name */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Tên</label>
                            <input type="text" value={formData.name} onChange={handleChange} name="name"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} required />
                        </div>
                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Email</label>
                            <input type="email" value={formData.email} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* Phone */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Số điện thoại</label>
                            <input type="tel" value={formData.phone} onChange={handleChange} name="phone"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        {/* Address */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Địa chỉ</label>
                            <input type="text" value={formData.address} onChange={handleChange} name="address"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        {/* Gender */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Giới tính</label>
                            <select
                                value={formData.gender}
                                onChange={handleChange}
                                name="gender"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        {/* Date of Birth */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Ngày sinh</label>
                            <input type="date" value={formData.dob} onChange={handleChange} name="dob"
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        {/* Role (readonly) */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ width: 140, color: '#555', textAlign: 'right', marginRight: 16 }}>Vai trò</label>
                            <input type="text" value={formData.role || ''} disabled
                                style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #eee', background: '#f5f5f5' }} />
                        </div>
                        {/* Nút lưu */}
                        <div style={{ marginLeft: 120 }}>
                            <button type="submit" style={{
                                background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 32px', fontWeight: 600, fontSize: 16
                            }}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Profile; 