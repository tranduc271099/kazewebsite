import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ProductLayout.module.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

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

    useEffect(() => {
        // Listen for stock updates from client cart operations
        socket.on('client_cart_update', (data) => {
            toast.info(`${data.username} đã ${data.action} sản phẩm: ${data.productName}`);
            // Refresh products to get updated stock
            fetchProducts();
        });

        // Listen for order creation
        socket.on('order_created', (data) => {
            toast.success(`${data.username} đã tạo đơn hàng #${data.orderId} - ${data.productCount} sản phẩm`);
            // Refresh products to get updated stock
            fetchProducts();
        });

        // Listen for stock reduction from orders
        socket.on('stock_reduced', (data) => {
            toast.info(`${data.username} đã giảm tồn kho: ${data.productName} (${data.color} - ${data.size}) -${data.quantity}`);
            // Refresh products to get updated stock
            fetchProducts();
        });

        // Listen for stock updates
        const handleStockUpdate = async (event) => {
            if (event.detail.productId) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/products/${event.detail.productId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Update products with new stock info
                    setProducts(prev =>
                        prev.map(product =>
                            product._id === event.detail.productId ? res.data : product
                        )
                    );

                    // Hiển thị thông báo tồn kho đã cập nhật
                    toast.success(`Tồn kho sản phẩm "${res.data.name}" đã được cập nhật!`);
                } catch (error) {
                    console.error('Lỗi khi cập nhật thông tin sản phẩm:', error);
                }
            }
        };

        window.addEventListener('stockUpdated', handleStockUpdate);

        return () => {
            socket.off('client_cart_update');
            socket.off('order_created');
            socket.off('stock_reduced');
            window.removeEventListener('stockUpdated', handleStockUpdate);
        };
    }, []);

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

    // Hàm tính tổng tồn kho của sản phẩm (bao gồm cả variants)
    const calculateTotalStock = (product) => {
        if (product.variants && product.variants.length > 0) {
            // Nếu có variants, tính tổng tồn kho của tất cả variants
            return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
        } else {
            // Nếu không có variants, sử dụng tồn kho sản phẩm gốc
            return product.stock || 0;
        }
    };

    // Hàm lấy màu sắc cho tồn kho
    const getStockColor = (stock) => {
        if (stock > 10) return '#4caf50'; // Xanh lá
        if (stock > 0) return '#ff9800'; // Cam
        return '#f44336'; // Đỏ
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
                            <th className={styles.productNameHeader}>Tên sản phẩm</th>
                            <th>Giá bán (VND)</th>
                            <th>Giá nhập (VND)</th>
                            <th>Lãi (%)</th>
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
                                <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>Đang tải sản phẩm...</td>
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
                                    <td className={styles.productNameCell}>{product.name}</td>
                                    <td>{product.price.toLocaleString('vi-VN')}</td>
                                    <td>{product.costPrice ? product.costPrice.toLocaleString('vi-VN') : '-'}</td>
                                    <td>
                                        {product.costPrice && product.price ? (
                                            <span style={{
                                                color: product.price > product.costPrice ? 'green' : 'red',
                                                fontWeight: 'bold'
                                            }}>
                                                {(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%
                                            </span>
                                        ) : (
                                            <span style={{ color: '#999' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ color: getStockColor(calculateTotalStock(product)), fontWeight: 'bold' }}>
                                        {calculateTotalStock(product)}
                                    </td>

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
                                <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy sản phẩm nào.</td>
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
