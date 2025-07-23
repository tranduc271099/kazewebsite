import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineEye, AiOutlineEdit } from 'react-icons/ai';
import { FaUserCircle } from 'react-icons/fa';
import styles from '../../styles/ProductLayout.module.css'; // Reusing general styles

const ListCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Number of items per page
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, [searchTerm, page]);

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('role', 'user');
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            params.append('limit', limit);
            params.append('page', page);

            const response = await axios.get(`http://localhost:5000/api/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải danh sách khách hàng');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (userId) => {
        // Assuming a detail page for user exists or will be created
        navigate(`/admin/users/view/${userId}`);
    };

    const handleEditUser = (userId) => {
        // Assuming an edit page for user exists or will be created
        navigate(`/admin/users/edit/${userId}`);
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const totalPages = Math.ceil(customers.length / limit); // This will need to come from backend total count eventually

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Danh sách khách hàng</h1>
            {error && <div className="error-banner">{error}</div>}

            <div className={styles.filterBar} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flexGrow: 1 }}
                />
                <button onClick={fetchCustomers} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: 'auto', padding: '10px 18px' }}>
                    <BiSearch size={20} />
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải danh sách khách hàng...</div>
            ) : customers.length > 0 ? (
                <div className={styles.card} style={{ marginTop: '16px' }}>
                    <table className={styles.productTable} style={{ fontSize: '1rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '5%', textAlign: 'center' }}>STT</th>
                                <th style={{ width: '20%', textAlign: 'left' }}>Khách hàng</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Số điện thoại</th>
                                <th style={{ width: '20%', textAlign: 'left' }}>Email</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Chi tiêu (VND)</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Giới tính</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Ngày sinh</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ width: '9%', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer, index) => (
                                <tr key={customer._id}>
                                    <td style={{ textAlign: 'center' }}>{(page - 1) * limit + index + 1}</td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {customer.image ? (
                                            <img src={customer.image} alt={customer.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <FaUserCircle size={40} color="var(--text-secondary)" />
                                        )}
                                        <span style={{ whiteSpace: 'nowrap' }}>{customer.name || 'Ẩn danh'}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{customer.phone || '---'}</td>
                                    <td style={{ textAlign: 'left' }}>{customer.email || '---'}</td>
                                    <td style={{ textAlign: 'right', color: '#7c3aed', fontWeight: 600 }}>{formatCurrency(customer.totalSpent || 0)}</td>
                                    <td style={{ textAlign: 'center' }}>{customer.gender || '---'}</td>
                                    <td style={{ textAlign: 'center' }}>{formatDate(customer.dob)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={styles.status} style={{ backgroundColor: customer.isActive ? '#10b981' : '#ef4444', color: 'white' }}>
                                            {customer.isActive ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button
                                                className={`${styles.actionBtn} ${styles.iconBtn}`}
                                                onClick={() => handleViewDetail(customer._id)}
                                                title="Xem chi tiết"
                                            >
                                                <AiOutlineEye size={20} />
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.iconBtn}`}
                                                onClick={() => handleEditUser(customer._id)}
                                                title="Chỉnh sửa"
                                            >
                                                <AiOutlineEdit size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
                        <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} className={`${styles.btn} ${styles.btnSecondary}`}>Trước</button>
                        <button onClick={() => setPage(prev => prev + 1)} disabled={page * limit >= customers.length} className={`${styles.btn} ${styles.btnSecondary}`}>Sau</button>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không tìm thấy khách hàng nào.</div>
            )}
        </div>
    );
};

export default ListCustomer; 