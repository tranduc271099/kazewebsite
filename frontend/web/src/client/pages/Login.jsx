import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import '../styles/Auth.css';
import { useDispatch } from 'react-redux';
import { LOGIN_SUCCESS } from '../redux/types';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Kiểm tra nếu đã đăng nhập
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            try {
                const userObj = JSON.parse(user);
                if (userObj.role === 'admin') {
                    // Nếu là admin, chuyển đến trang admin
                    navigate('/dashboard');
                } else {
                    // Nếu là client, chuyển đến trang chủ
                    navigate('/');
                }
            } catch (error) {
                console.error('Lỗi phân tích dữ liệu người dùng:', error);
            }
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', formData);
            const token = response.data.token;
            const user = response.data.user;

            // Lưu token và user vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Lưu vào Redux
            dispatch({ type: LOGIN_SUCCESS, payload: { token, user } });

            // Kiểm tra role và chuyển hướng
            if (user?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/google', {
                credential: credentialResponse.credential,
            });

            const token = response.data.token;
            const user = response.data.user;

            // Lưu token và user vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Lưu vào Redux
            dispatch({ type: LOGIN_SUCCESS, payload: { token, user } });

            // Kiểm tra role và chuyển hướng
            if (user?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
        }
    };

    const handleGoogleError = () => {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    };

    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Đăng nhập</h2>
                        <p>Chào mừng bạn quay trở lại!</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Nhập email của bạn"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Nhập mật khẩu của bạn"
                            />
                        </div>

                        <div className="auth-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                        </div>

                        <div className="auth-divider">
                            <span>Hoặc</span>
                        </div>

                        <div className="google-login">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                            />
                        </div>

                        <div className="auth-footer">
                            <p>
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="auth-link">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 