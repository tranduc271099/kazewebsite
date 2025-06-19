import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../CategoryLayout.module.css';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                setError('Không thể xóa danh mục');
            }
        }
    };

    return (
        <div>
            <div className={styles.card}>
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
            <div className={styles.card}>
                <div className={styles.header}>Danh sách danh mục</div>
                {error && <div className={styles.error}>{error}</div>}
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
                                    <button className={styles.btnEdit} onClick={() => handleEdit(category)}>Sửa</button>
                                    <button className={styles.btnDelete} onClick={() => handleDelete(category._id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Category; 