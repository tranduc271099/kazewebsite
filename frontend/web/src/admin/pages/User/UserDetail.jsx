import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdWork } from 'react-icons/md';
import { FaDollarSign, FaTransgender } from 'react-icons/fa';
import styles from '../../styles/ProductLayout.module.css'; // Reusing existing styles
import { Typography } from '@mui/material'; // Assuming Typography is from MUI

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserDetail();
    }, [userId]);

    const fetchUserDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải thông tin người dùng');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return <div className={styles.container} style={{ textAlign: 'center', padding: '20px' }}>Đang tải thông tin người dùng...</div>;
    }

    if (error) {
        return <div className={styles.container} style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
    }

    if (!user) {
        return <div className={styles.container} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không tìm thấy thông tin người dùng.</div>;
    }

    return (
        <div className={styles.container} style={{ padding: '20px' }}>
            <h1 className={styles.title} style={{ marginBottom: '20px' }}>Chi tiết người dùng: {user.name || 'Ẩn danh'}</h1>
            <div className={styles.card} style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 300px', maxWidth: '350px', textAlign: 'center' }}>
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)', marginBottom: '20px' }}
                        />
                    ) : (
                        <FaUserCircle size={150} color="var(--text-secondary)" style={{ marginBottom: '20px' }} />
                    )}
                    <Typography variant="h4" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{user.name || 'Ẩn danh'}</Typography>
                    <Typography variant="h6" style={{ color: 'var(--text-secondary)' }}>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</Typography>
                </div>

                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdEmail size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Email: {user.email || 'Chưa cập nhật'}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdPhone size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Số điện thoại: {user.phone || 'Chưa cập nhật'}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdLocationOn size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Địa chỉ: {user.address || 'Chưa cập nhật'}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaTransgender size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Giới tính: {user.gender || 'Chưa cập nhật'}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdCalendarToday size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Ngày sinh: {formatDate(user.dob)}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdWork size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Chức vụ: {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaDollarSign size={20} color="var(--primary-color)" />
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Tổng chi tiêu: <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{formatCurrency(user.totalSpent || 0)}</span>
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                            className={styles.status}
                            style={{
                                backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                                color: 'white',
                            }}
                        >
                            {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                        <Typography variant="body1" style={{ color: 'var(--text-primary)' }}>
                            Trạng thái tài khoản
                        </Typography>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate(-1)} className={`${styles.btn} ${styles.btnSecondary}`}>Quay lại</button>
                {/* Add edit button if needed */}
                <button onClick={() => navigate(`/admin/users/edit/${userId}`)} className={`${styles.btn} ${styles.btnPrimary}`}>Chỉnh sửa</button>
            </div>
        </div>
    );
};

export default UserDetail; 