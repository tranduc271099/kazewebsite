import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ProductLayout.module.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const navigate = useNavigate();

    const getImageUrl = (imgData) => {
        if (!imgData) return '/assets/img/no-image.png';

        const imgUrl = typeof imgData === 'string' ? imgData : imgData.url;

        if (!imgUrl) return '/assets/img/no-image.png';
        if (imgUrl.startsWith('http') || imgUrl.startsWith('blob:')) {
            return imgUrl;
        }
        if (imgUrl.startsWith('/uploads/')) return `http://localhost:5000${imgUrl}`;
        return `http://localhost:5000/uploads/${imgUrl}`;
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchTerm, filterCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterCategory) params.append('category', filterCategory);

            const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
            setError('');
        } catch (error) {
            setError('Lỗi khi tải danh sách sản phẩm');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            setError('Lỗi khi tải danh mục');
        }
    };

    const handleEditClick = (productId) => {
        navigate(`/admin/products/edit/${productId}`);
    };

    const handleAddProductClick = () => {
        navigate('/admin/products/add');
    };

    const handleViewClick = (productId) => {
        navigate(`/admin/products/view/${productId}`);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Danh sách sản phẩm</h1>
            {error && <div className="error-banner">{error}</div>}

            <div className={styles.filterBar} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                    className={styles.select}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ width: '150px' }}
                >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    className={styles.select}
                    style={{ width: '150px' }}
                >
                    <option value="">Chọn thương hiệu</option>
                    {/* Thêm các option thương hiệu nếu có */}
                </select>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flexGrow: 1 }}
                />
                <button onClick={fetchProducts} className={`${styles.btn} ${styles.btnPrimary}`}>
                    <i className="bi bi-search"></i>
                </button>
                <button onClick={handleAddProductClick} className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                    + Thêm sản phẩm
                </button>
            </div>

            <div className={styles.card} style={{ marginTop: '24px' }}>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th style={{ width: '25%', maxWidth: '25%' }}>Tên sản phẩm</th>
                            <th>Thương hiệu</th>
                            <th>Giá bán (VND)</th>
                            <th>Tồn kho</th>
                            <th>Ngày tạo</th>
                            <th>Ngày cập nhật</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Đang tải sản phẩm...</td>
                            </tr>
                        ) : products.length > 0 ? (
                            products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <img
                                            src={getImageUrl(product.images?.[0])}
                                            alt={product.name}
                                            className={styles.productImage}
                                            onClick={() => { setSelectedImage(getImageUrl(product.images?.[0])); setShowImageModal(true); }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ width: '25%', maxWidth: '25%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</td>
                                    <td>{product.brand || '---'}</td>
                                    <td>{product.price.toLocaleString('vi-VN')}</td>
                                    <td>{product.stock}</td>
                                    <td>{formatDateTime(product.createdAt)}</td>
                                    <td>{formatDateTime(product.updatedAt)}</td>
                                    <td>
                                        <span className={`${styles.status} ${product.isActive ? styles.statusActive : styles.statusInactive}`}>
                                            {product.isActive ? 'Đang kinh doanh' : 'Dừng kinh doanh'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleViewClick(product._id)} className={`${styles.actionBtn} ${styles.iconBtn}`} title="Xem chi tiết">
                                                <VisibilityOutlinedIcon />
                                            </button>
                                            <button onClick={() => handleEditClick(product._id)} className={`${styles.actionBtn} ${styles.iconBtn}`} title="Chỉnh sửa">
                                                <EditOutlinedIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy sản phẩm nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showImageModal && (
                <div className={styles.imageModal}>
                    <div className={styles.imageModalContent}>
                        <span className={styles.close} onClick={() => setShowImageModal(false)}>&times;</span>
                        <img src={selectedImage} alt="Full Size" className={styles.fullImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
