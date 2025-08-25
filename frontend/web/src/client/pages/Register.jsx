import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Chỉ gửi các trường cần thiết (không gửi address)
            const { name, email, password, phone } = formData;
            const response = await axios.post('http://localhost:5000/api/users/register', { name, email, password, phone });
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-card register-card">
                    <div className="auth-header">
                        <h2>Đăng ký tài khoản</h2>
                        <p>Điền thông tin để tạo tài khoản mới</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form register-form-grid">
                        <div className="form-row">
                            <div className="form-group form-col-2">
                                <label htmlFor="name">Họ và tên</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập họ và tên"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>
                            <div className="form-group form-col-2">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập email của bạn"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group form-col-2">
                                <label htmlFor="password">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Tạo mật khẩu mới"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>
                            <div className="form-group form-col-2">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập số điện thoại"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>
                        </div>
                        {/* Đã bỏ phần nhập địa chỉ */}
                        <div className="auth-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 