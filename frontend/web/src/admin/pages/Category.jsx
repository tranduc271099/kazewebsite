import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/CategoryLayout.module.css';
import commonStyles from '../styles/ProductLayout.module.css'; // Import common styles
import { useTheme } from '@mui/material/styles'; // Re-import useTheme
import { MdAdd } from 'react-icons/md'; // For the Add button icon

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // State cho modal thêm/sửa danh mục
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [image, setImage] = useState(null);

    const fileInputRef = useRef(null);

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

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log('handleSubmit called');
        console.log('formData:', formData);
        console.log('editingId:', editingId);
        try {
            const token = localStorage.getItem('token');
            const form = new FormData();
            form.append('name', formData.name);
            if (image) form.append('image', image);

            let response;
            if (editingId) {
                console.log('Sending PUT request for category update');
                response = await axios.put(`http://localhost:5000/api/categories/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                console.log('Category updated successfully:', response.data);
            } else {
                console.log('Sending POST request for new category');
                response = await axios.post('http://localhost:5000/api/categories', form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Category added successfully:', response.data);
            }
            setFormData({ name: '' });
            setImage(null);
            setEditingId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchCategories();
            setShowFormModal(false); // Close modal on success
        } catch (err) {
            console.error('Error during category submission:', err);
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
        setImage(null); // Clear image when editing existing category
        setShowFormModal(true); // Open modal for editing
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        
        setDeleteLoading(categoryToDelete._id);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/categories/${categoryToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            fetchCategories();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục');
        } finally {
            setDeleteLoading(null);
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <div className={commonStyles.container}>
            <div className={commonStyles.headerWithBtn}>
                <h1 className={commonStyles.title}><i className="fas fa-th-list" style={{ marginRight: '10px' }}></i>Danh sách danh mục</h1>
                <button
                    className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
                    onClick={() => { setEditingId(null); setFormData({ name: '' }); setImage(null); setShowFormModal(true); }}
                    style={{ padding: '10px 20px', width: 'auto' }}
                >
                    <MdAdd size={20} style={{ marginRight: '5px' }} />Thêm danh mục
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className={commonStyles.card} style={{ marginTop: '16px' }}>
                <table className={commonStyles.productTable}>
                    <thead>
                        <tr>
                            <th style={{ width: '5%', textAlign: 'center' }}>STT</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Ảnh</th>
                            <th style={{ width: '30%', textAlign: 'left' }}>Tên danh mục</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Số sản phẩm</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Ngày tạo</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Đang tải danh mục...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Không tìm thấy danh mục nào.</td></tr>
                        ) : (
                            categories.map((category, index) => (
                                <tr key={category._id}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {category.image && <img src={category.image} alt={category.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                                    </td>
                                    <td style={{ textAlign: 'left' }}>{category.name}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ 
                                            color: category.productCount > 0 ? '#e74c3c' : '#27ae60',
                                            fontWeight: 'bold'
                                        }}>
                                            {category.productCount || 0}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{formatDate(category.createdAt)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                className={`${commonStyles.actionBtn} ${commonStyles.iconBtn}`}
                                                onClick={() => handleEdit(category)}
                                                title="Cập nhật"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                Cập nhật
                                            </button>
                                            <button
                                                className={`${commonStyles.actionBtn}`}
                                                onClick={() => handleDelete(category)}
                                                title="Xóa"
                                                disabled={category.productCount > 0 || deleteLoading === category._id}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '12px',
                                                    backgroundColor: category.productCount > 0 ? '#95a5a6' : '#e74c3c',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: category.productCount > 0 ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {deleteLoading === category._id ? 'Đang xóa...' : 'Xóa'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit Category Form */}
            {showFormModal && (
                <div className={commonStyles.modalBackdrop}>
                    <div className={commonStyles.modalContent}>
                        <h2 className={commonStyles.modalTitle}>{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={commonStyles.formGroup}>
                                <label className={commonStyles.label} htmlFor="name">Tên danh mục</label>
                                <input
                                    className={commonStyles.input}
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>
                            <div className={commonStyles.formGroup}>
                                <label className={commonStyles.label} htmlFor="image">Ảnh danh mục</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        className={commonStyles.hiddenInput}
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                    />
                                    <button
                                        type="button"
                                        className={`${commonStyles.btn} ${commonStyles.btnSecondary}`}
                                        onClick={() => fileInputRef.current.click()}
                                        style={{ width: '120px', padding: '10px 15px' }}
                                    >
                                        Chọn tệp
                                    </button>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {image ? image.name : (editingId && categories.find(cat => cat._id === editingId)?.image ? 'Đã có ảnh' : 'Không có tệp nào được chọn')}
                                    </span>
                                </div>
                                {editingId && categories.find(cat => cat._id === editingId)?.image && !image && ( // Show current image if editing and no new image selected
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={categories.find(cat => cat._id === editingId)?.image} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </div>
                                )}
                                {image && ( // Show new image preview if selected
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={URL.createObjectURL(image)} alt="New" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </div>
                                )}
                            </div>
                            <div className={commonStyles.btnRow} style={{ justifyContent: 'flex-end', marginTop: '30px' }}>
                                <button type="button" className={`${commonStyles.btn} ${commonStyles.btnSecondary}`} onClick={() => setShowFormModal(false)} style={{ marginRight: '10px' }}>
                                    Hủy
                                </button>
                                <button type="submit" className={`${commonStyles.btn} ${commonStyles.btnPrimary}`} disabled={loading}>
                                    {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa danh mục */}
            {showDeleteModal && categoryToDelete && (
                <div className={commonStyles.modalBackdrop}>
                    <div className={commonStyles.modalContent} style={{ maxWidth: '400px' }}>
                        <h2 className={commonStyles.modalTitle} style={{ color: '#e74c3c' }}>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }}></i>
                            Xác nhận xóa danh mục
                        </h2>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '10px' }}>
                                Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryToDelete.name}"</strong>?
                            </p>
                            {categoryToDelete.productCount > 0 ? (
                                <div style={{ 
                                    backgroundColor: '#fff3cd', 
                                    border: '1px solid #ffeaa7', 
                                    borderRadius: '4px', 
                                    padding: '12px',
                                    color: '#856404'
                                }}>
                                    <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                                    Không thể xóa danh mục này vì có {categoryToDelete.productCount} sản phẩm đang thuộc danh mục.
                                </div>
                            ) : (
                                <div style={{ 
                                    backgroundColor: '#d4edda', 
                                    border: '1px solid #c3e6cb', 
                                    borderRadius: '4px', 
                                    padding: '12px',
                                    color: '#155724'
                                }}>
                                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                                    Danh mục này có thể xóa an toàn vì không có sản phẩm nào.
                                </div>
                            )}
                        </div>
                        <div className={commonStyles.btnRow} style={{ justifyContent: 'flex-end' }}>
                            <button 
                                type="button" 
                                className={`${commonStyles.btn} ${commonStyles.btnSecondary}`} 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCategoryToDelete(null);
                                }}
                                style={{ marginRight: '10px' }}
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                className={`${commonStyles.btn}`}
                                onClick={confirmDelete}
                                disabled={categoryToDelete.productCount > 0 || deleteLoading === categoryToDelete._id}
                                style={{ 
                                    backgroundColor: categoryToDelete.productCount > 0 ? '#95a5a6' : '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    cursor: categoryToDelete.productCount > 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {deleteLoading === categoryToDelete._id ? 'Đang xóa...' : 'Xóa danh mục'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category; 