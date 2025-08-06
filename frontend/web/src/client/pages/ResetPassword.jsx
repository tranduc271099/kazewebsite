import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token không hợp lệ. Vui lòng thử lại từ email của bạn.');
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validate passwords
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            if (response.data.success) {
                setMessage(response.data.message);
                setIsSuccess(true);
                setFormData({ newPassword: '', confirmPassword: '' });

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-layout">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h2>Lỗi</h2>
                            <p>Token không hợp lệ</p>
                        </div>
                        <div className="auth-error">
                            Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại quá trình quên mật khẩu.
                        </div>
                        <div className="auth-footer">
                            <p>
                                <Link to="/forgot-password" className="auth-link">Quên mật khẩu</Link>
                            </p>
                            <p>
                                <Link to="/login" className="auth-link">Đăng nhập</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Đặt lại mật khẩu</h2>
                        <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success">{message}</div>}

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="newPassword">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập mật khẩu mới"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập lại mật khẩu mới"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>

                            <div className="auth-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="success-content">
                            <div className="success-icon">
                                ✅
                            </div>
                            <p className="success-message">
                                Mật khẩu đã được đặt lại thành công!
                            </p>
                            <p className="success-note">
                                Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                            </p>
                        </div>
                    )}

                    <div className="auth-footer">
                        <p>
                            <Link to="/login" className="auth-link">Về trang đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
