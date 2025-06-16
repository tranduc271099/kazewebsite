import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Category.css';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
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
            setFormData({ name: '', description: '' });
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
            name: category.name,
            description: category.description
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
        <div className="content-inner">
            <div className="category-container">
                <div className="category-header">
                    <h2>Quản lý danh mục</h2>
                </div>

                {error && <div className="category-error">{error}</div>}

                <form onSubmit={handleSubmit} className="category-form">
                    <div className="form-group">
                        <label htmlFor="name">Tên danh mục</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên danh mục"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Nhập mô tả danh mục"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </form>

                <div className="category-list">
                    <h3>Danh sách danh mục</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Mô tả</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>{category.description}</td>
                                    <td>
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(category)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(category._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Category; 