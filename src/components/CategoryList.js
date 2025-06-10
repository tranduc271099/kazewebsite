import React, { useState, useEffect } from 'react';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editedName, setEditedName] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/category');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            setError('Lỗi khi tải danh mục');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error('Lỗi khi thêm danh mục');
            setName('');
            fetchCategories();
        } catch (err) {
            setError('Lỗi khi thêm danh mục');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:5000/api/category/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Lỗi khi xóa danh mục');
            fetchCategories();
        } catch (err) {
            setError('Lỗi khi xóa danh mục');
        }
        setLoading(false);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setEditedName(category.name);
    };

    const handleUpdate = async () => {
        if (!editedName.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:5000/api/category/${editingCategory._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editedName })
            });
            if (!res.ok) throw new Error('Lỗi khi cập nhật danh mục');
            setEditingCategory(null);
            setEditedName('');
            fetchCategories();
        } catch (err) {
            setError('Lỗi khi cập nhật danh mục');
        }
        setLoading(false);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditedName('');
    };

    return (
        <div className="content-wrapper" style={{ padding: 24 }}>
            <h2>Quản lý danh mục</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tên danh mục"
                    className="form-control"
                    style={{ maxWidth: 300 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    Thêm danh mục
                </button>
            </form>
            {error && <div className="alert alert-danger">{error}</div>}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên danh mục</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat, idx) => (
                        <tr key={cat._id}>
                            <td>{idx + 1}</td>
                            <td>{cat.name}</td>
                            <td>{new Date(cat.createdAt).toLocaleString()}</td>
                            <td>
                                {editingCategory && editingCategory._id === cat._id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="form-control form-control-sm"
                                            style={{ display: 'inline-block', width: 'auto', marginRight: 5 }}
                                        />
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={handleUpdate}
                                            disabled={loading}
                                            style={{ marginRight: 5 }}
                                        >
                                            Lưu
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleCancelEdit}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleEdit(cat)}
                                            disabled={loading}
                                            style={{ marginRight: 5 }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(cat._id)}
                                            disabled={loading}
                                        >
                                            Xóa
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryList; 