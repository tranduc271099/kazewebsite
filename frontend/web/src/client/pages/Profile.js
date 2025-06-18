import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

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
                address: res.data.address || ''
            });
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

    const handlePasswordChange = e => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/me', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Cập nhật thông tin thành công!');
            localStorage.setItem('userName', formData.name);
        } catch (err) {
            setError('Cập nhật thất bại!');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPasswordSuccess('Đổi mật khẩu thành công!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-content">
                <h2>Thông tin cá nhân</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Họ tên</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            className="form-control"
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>

                <div className="password-section">
                    <h3>Đổi mật khẩu</h3>
                    {passwordError && <div className="error-message">{passwordError}</div>}
                    {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">Mật khẩu mới</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile; 