import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/ProductLayout.module.css';
import toast from 'react-hot-toast';

const ProductView = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]); // State mới cho bình luận
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (productId) {
            fetchProductDetails();
            fetchComments(); // Gọi API lấy bình luận
        }
    }, [productId]);

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

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProduct(response.data);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Lỗi khi tải chi tiết sản phẩm');
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/comments/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi tải bình luận');
            setComments([]);
        }
    };

    if (loading) {
        return <div className={styles.container} style={{ textAlign: 'center', padding: '20px' }}>Đang tải chi tiết sản phẩm...</div>;
    }

    if (error) {
        return <div className={styles.container}><div className="error-banner">{error}</div></div>;
    }

    if (!product) {
        return <div className={styles.container} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy sản phẩm.</div>;
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Chi tiết sản phẩm: {product.name}</h1>

            <div className={styles.card}>
                <div className={styles.productDetailLayout}>
                    {/* Left Section: Product Images */}
                    <div className={styles.productImageSection}>
                        {product.images && product.images.length > 0 ? (
                            <img src={getImageUrl(product.images[0])} alt={product.name} className={styles.mainProductImage} />
                        ) : (
                            <p>Không có ảnh chính.</p>
                        )}
                        <div className={styles.imageGallery} style={{ marginTop: '15px' }}>
                            {product.images && product.images.length > 1 && (
                                product.images.slice(1).map((img, index) => (
                                    <img key={index} src={getImageUrl(img)} alt={`Product thumbnail ${index + 1}`} className={styles.imageGalleryItem} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Section: Product Info */}
                    <div className={styles.productInfoSection}>
                        <h2 className={styles.productName}>{product.name}</h2>
                        {product.category && (
                            <p className={styles.productCategory}>{product.category.name}</p>
                        )}
                        <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')} VND</p>
                        {product.costPrice && (
                            <>
                                <p className={styles.productCostPrice} style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                                    Giá nhập: {product.costPrice.toLocaleString('vi-VN')} VND
                                </p>
                                <p className={styles.productProfit} style={{
                                    color: product.price > product.costPrice ? 'green' : 'red',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginTop: '5px'
                                }}>
                                    Lãi: {(product.price - product.costPrice).toLocaleString('vi-VN')} VND
                                    ({(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%)
                                </p>
                            </>
                        )}
                        <hr className={styles.divider} />

                        <div className={styles.detailGroup}>
                            <label className={styles.detailLabel}>Thương hiệu:</label>
                            <span className={styles.detailValue}>{product.brand || '---'}</span>
                        </div>

                        {product.attributes?.colors && product.attributes.colors.length > 0 && (
                            <div className={styles.detailGroup}>
                                <label className={styles.detailLabel}>Màu sắc:</label>
                                <span className={styles.detailValue}>{product.attributes.colors.join(', ')}</span>
                            </div>
                        )}

                        {product.attributes?.sizes && product.attributes.sizes.length > 0 && (
                            <div className={styles.detailGroup}>
                                <label className={styles.detailLabel}>Kích thước:</label>
                                <span className={styles.detailValue}>{product.attributes.sizes.join(', ')}</span>
                            </div>
                        )}

                        <div className={styles.detailGroup}>
                            <label className={styles.detailLabel}>Tồn kho:</label>
                            <span className={styles.detailValue}>{product.stock}</span>
                        </div>

                        <div className={styles.detailGroup}>
                            <label className={styles.detailLabel}>Trạng thái:</label>
                            <span className={`${styles.status} ${product.isActive ? styles.statusActive : styles.statusInactive}`}>
                                {product.isActive ? 'Đang kinh doanh' : 'Dừng kinh doanh'}
                            </span>
                        </div>

                        <hr className={styles.divider} />

                        <h3 className={styles.sectionHeading}>Mô tả sản phẩm</h3>
                        <p className={styles.productDescription}>{product.description || 'Không có mô tả'}</p>

                        <h3 className={styles.sectionHeading} style={{ marginTop: '20px' }}>Thông tin bổ sung</h3>
                        <div className={styles.detailGroup}>
                            <label className={styles.detailLabel}>Ngày tạo:</label>
                            <span className={styles.detailValue}>{formatDateTime(product.createdAt)}</span>
                        </div>
                        <div className={styles.detailGroup}>
                            <label className={styles.detailLabel}>Ngày cập nhật:</label>
                            <span className={styles.detailValue}>{formatDateTime(product.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {product.variants && product.variants.length > 0 && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Biến thể sản phẩm</h2>
                    <table className={styles.variantTable}>
                        <thead>
                            <tr>
                                <th>Size</th>
                                <th>Màu</th>
                                <th>Tồn kho</th>
                                <th>Giá bán</th>
                                <th>Ảnh biến thể</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.variants.map((variant, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{variant.attributes?.size || '---'}</td>
                                        <td>{variant.attributes?.color || '---'}</td>
                                        <td>{variant.stock || 0}</td>
                                        <td>{variant.price ? variant.price.toLocaleString('vi-VN') + ' VND' : '---'}</td>
                                        <td>
                                            <div className={styles.variantImages}>
                                                {variant.images && variant.images.length > 0 ? (
                                                    variant.images.map((img, imgIdx) => (
                                                        <img key={imgIdx} src={getImageUrl(img)} alt={`Variant ${index + 1} image ${imgIdx + 1}`} className={styles.variantThumbnail} />
                                                    ))
                                                ) : (
                                                    <span>Không có ảnh</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Bình luận</h2>
                {comments.length > 0 ? (
                    <div className={styles.commentList}>
                        {comments.map((comment) => (
                            <div key={comment._id} className={styles.commentItem}>
                                <p className={styles.commentAuthor}><strong>{comment.userId ? comment.userId.name : 'Người dùng ẩn danh'}</strong></p>
                                <p className={styles.commentRating}>Đánh giá: {comment.rating} sao</p>
                                <p className={styles.commentContent}>{comment.content}</p>
                                <p className={styles.commentDate}>{formatDateTime(comment.createdAt)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Chưa có bình luận nào cho sản phẩm này.</p>
                )}
            </div>

            <div className={styles.btnGroup} style={{ justifyContent: 'flex-start' }}>
                <button onClick={() => navigate(-1)} className={`${styles.btn} ${styles.btnSecondary}`}>
                    Quay lại
                </button>
            </div>
        </div>
    );
};

export default ProductView; 