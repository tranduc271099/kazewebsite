import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/CategoryLayout.module.css';
import { useTheme } from '@mui/material/styles';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // State cho modal chi tiết danh mục
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailCategory, setDetailCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [errorProducts, setErrorProducts] = useState('');

    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (err) {
            setError('Không thể tải danh mục');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(`http://localhost:5000/api/categories/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/categories', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setFormData({ name: '' });
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name
        });
        setEditingId(category._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCategories();
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể xóa danh mục');
                alert(err.response?.data?.message || 'Không thể xóa danh mục');
            }
        }
    };

    // Hàm mở modal chi tiết và lấy sản phẩm theo danh mục
    const handleShowDetail = async (category) => {
        setDetailCategory(category);
        setDetailOpen(true);
        setLoadingProducts(true);
        setErrorProducts('');
        try {
            const response = await axios.get(`http://localhost:5000/api/products/category/${category._id}`);
            setCategoryProducts(response.data);
        } catch (err) {
            setErrorProducts('Không thể tải sản phẩm');
        } finally {
            setLoadingProducts(false);
        }
    };

    // Hàm đóng modal
    const handleCloseDetail = () => {
        setDetailOpen(false);
        setDetailCategory(null);
        setCategoryProducts([]);
        setErrorProducts('');
    };

    return (
        <div>
            <div className={`${styles.card} ${isDark ? styles.cardDark : ''}`}>
                <div className={styles.header}>Thêm danh mục mới</div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="name">Tên danh mục</label>
                            <input
                                className={styles.input}
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Nhập tên danh mục"
                            />
                        </div>
                    </div>
                    <div className={styles.btnRow}>
                        <button type="submit" className={styles.btnPrimary} disabled={loading}>
                            {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>

            <div className={`${styles.tableCard} ${isDark ? styles.tableCardDark : ''}`}>
                <div className={styles.tableTitle}>Danh sách danh mục</div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tên danh mục</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id}>
                                <td>{category.name}</td>
                                <td>
                                    <button
                                        className={`${styles.actionBtn} ${styles.editBtn}`}
                                        onClick={() => handleEdit(category)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={() => handleDelete(category._id)}
                                    >
                                        Xóa
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        style={{ background: '#0ea5e9', color: '#fff', marginLeft: 8 }}
                                        onClick={() => handleShowDetail(category)}
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal chi tiết danh mục */}
            {detailOpen && (
                <div className={styles.detailModalBackdrop}>
                    <div className={styles.detailModalBox}>
                        <div className={styles.detailModalHeader}>
                            <h2 className={styles.detailModalTitle}>Sản phẩm thuộc danh mục: {detailCategory?.name}</h2>
                            <button onClick={handleCloseDetail} className={styles.detailModalClose}>×</button>
                        </div>
                        {loadingProducts ? (
                            <div>Đang tải sản phẩm...</div>
                        ) : errorProducts ? (
                            <div style={{ color: 'red' }}>{errorProducts}</div>
                        ) : categoryProducts.length === 0 ? (
                            <div>Không có sản phẩm nào trong danh mục này.</div>
                        ) : (
                            <table className={styles.detailModalTable}>
                                <thead>
                                    <tr>
                                        <th>Tên sản phẩm</th>
                                        <th>Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryProducts.map(product => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.price?.toLocaleString('vi-VN')} đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category; 