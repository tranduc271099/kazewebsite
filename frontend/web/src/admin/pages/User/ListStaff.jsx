import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineEye } from 'react-icons/ai';
import { FaUserCircle } from 'react-icons/fa';
import styles from '../../styles/ProductLayout.module.css'; // Reusing general styles

const ListStaff = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // Number of items per page
    const navigate = useNavigate();

    useEffect(() => {
        fetchStaffs();
    }, [searchTerm, selectedRole, page]);

    const fetchStaffs = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('role', 'admin'); // Fetching admin users for staff list
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            if (selectedRole) {
                // If more roles are added beyond 'admin', this will filter them
                params.append('role', selectedRole);
            }
            params.append('limit', limit);
            params.append('page', page);

            const response = await axios.get(`http://localhost:5000/api/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffs(response.data.filter(staff => staff.role === 'admin')); // Ensure only admin users are shown
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải danh sách nhân sự');
            setStaffs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (userId) => {
        navigate(`/admin/users/view/${userId}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const totalPages = Math.ceil(staffs.length / limit); // This will need to come from backend total count eventually

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Danh sách nhân sự</h1>
            {error && <div className="error-banner">{error}</div>}

            <div className={styles.filterBar} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                    className={styles.input}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ width: '150px' }}
                >
                    <option value="">Tất cả chức năng</option>
                    <option value="admin">Quản trị viên</option>
                    {/* Add more roles here if they exist in your system */}
                </select>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Tìm kiếm nhân sự..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flexGrow: 1 }}
                />
                <button onClick={fetchStaffs} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: 'auto', padding: '10px 18px' }}>
                    <BiSearch size={20} />
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải danh sách nhân sự...</div>
            ) : staffs.length > 0 ? (
                <div className={styles.card} style={{ marginTop: '16px' }}>
                    <table className={styles.productTable} style={{ fontSize: '1rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '5%', textAlign: 'center' }}>STT</th>
                                <th style={{ width: '15%', textAlign: 'left' }}>Người dùng</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Số điện thoại</th>
                                <th style={{ width: '15%', textAlign: 'left' }}>Email</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Chức năng</th>
                                <th style={{ width: '8%', textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ width: '9%', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffs.map((staff, index) => (
                                <tr key={staff._id}>
                                    <td style={{ textAlign: 'center' }}>{(page - 1) * limit + index + 1}</td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {staff.image ? (
                                            <img src={staff.image} alt={staff.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <FaUserCircle size={40} color="var(--text-secondary)" />
                                        )}
                                        <span style={{ whiteSpace: 'nowrap' }}>{staff.name || 'Ẩn danh'}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{staff.phone || '---'}</td>
                                    <td style={{ textAlign: 'left' }}>{staff.email || '---'}</td>
                                    <td style={{ textAlign: 'center' }}>{staff.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={styles.status} style={{ backgroundColor: staff.isActive ? '#10b981' : '#ef4444', color: 'white' }}>
                                            {staff.isActive ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button
                                                className={`${styles.actionBtn} ${styles.iconBtn}`}
                                                onClick={() => handleViewDetail(staff._id)}
                                                title="Xem chi tiết"
                                            >
                                                <AiOutlineEye size={20} />
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
                        <button onClick={() => setPage(prev => prev + 1)} disabled={page * limit >= staffs.length} className={`${styles.btn} ${styles.btnSecondary}`}>Sau</button>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không tìm thấy nhân sự nào.</div>
            )}
        </div>
    );
};

export default ListStaff; 