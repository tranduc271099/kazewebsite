import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validate email format on frontend
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Định dạng email không hợp lệ');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email
            });

            if (response.data.success) {
                setMessage(response.data.message);
                setIsSuccess(true);
                setEmail('');
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setError(err.response?.data?.message || 'Bạn đã yêu cầu quá nhiều lần. Vui lòng chờ và thử lại sau.');
            } else {
                setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Quên mật khẩu</h2>
                        <p>Nhập email để nhận link đặt lại mật khẩu</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}
                    {message && <div className="auth-success">{message}</div>}

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Nhập email của bạn"
                                    style={{ color: '#222', backgroundColor: '#fafbfc' }}
                                />
                            </div>

                            <div className="auth-actions">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="success-content">
                            <div className="success-icon">
                                ✅
                            </div>
                            <p className="success-message">
                                Email đã được gửi thành công! Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                            </p>
                            <p className="success-note">
                                <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 15 phút.
                            </p>
                        </div>
                    )}

                    <div className="auth-footer">
                        <p>
                            Nhớ lại mật khẩu? <Link to="/login" className="auth-link">Đăng nhập</Link>
                        </p>
                        <p>
                            Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
