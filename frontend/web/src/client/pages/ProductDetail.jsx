import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';

function ProductDetail() {
    const params = useParams();
    const productId = params.productId || params.id; // Ưu tiên id nếu có, fallback productId
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [fetchError, setFetchError] = useState(false);
    const [comments, setComments] = useState([]);
    const [canReviewOrders, setCanReviewOrders] = useState([]);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    const { addToCart } = useContext(CartContext);

    // Sửa logic tìm variant để khớp key số nhiều/số ít, truyền variants vào hàm
    const findMatchingVariant = (attrs, variants) => {
        if (!variants) return null;
        return variants.find(v =>
            Object.entries(attrs).every(([key, value]) =>
                v.attributes[key.endsWith('s') ? key.slice(0, -1) : key] === value
            )
        );
    };

    // Thêm hàm chuẩn hóa đường dẫn ảnh
    const normalizeImageUrl = (img) => {
        if (!img) return '/assets/img/no-image.png';
        if (img.startsWith('http')) return img;
        if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
        // Nếu chỉ là tên file
        return `http://localhost:5000/uploads/${img}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('API trả về:', res.data);
                setProduct(res.data);
                const images = res.data.images?.map(img =>
                    img.startsWith('/uploads/') ? `http://localhost:5000${img}` : img
                ) || [];
                setProduct({ ...res.data, images });
                setMainImage(images[0] || '/assets/img/no-image.png');

                // Initialize selected attributes with first available option for each attribute
                const initialAttributes = {};
                if (res.data.attributes) {
                    Object.entries(res.data.attributes).forEach(([attrName, attrValues]) => {
                        initialAttributes[attrName] = attrValues[0];
                    });
                }
                setSelectedAttributes(initialAttributes);

                // Find matching variant (dùng hàm mới, truyền variants)
                const variant = findMatchingVariant(initialAttributes, res.data.variants);
                setSelectedVariant(variant);
                setFetchError(false);
            } catch (err) {
                console.error('Lỗi khi fetch sản phẩm:', err);
                setProduct(null);
                setFetchError(true);
            }
        };
        fetchProduct();
    }, [productId]);

    // Lắng nghe sự kiện thay đổi tồn kho
    useEffect(() => {
        const handleStockUpdate = async (event) => {
            if (event.detail.productId === productId) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/products/${productId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const updatedProduct = res.data;
                    const images = updatedProduct.images?.map(img =>
                        img.startsWith('/uploads/') ? `http://localhost:5000${img}` : img
                    ) || [];
                    setProduct({ ...updatedProduct, images });
                    
                    // Cập nhật selectedVariant với thông tin tồn kho mới
                    const updatedVariant = updatedProduct.variants.find(
                        v => v.attributes.color === selectedAttributes.colors && v.attributes.size === selectedAttributes.sizes
                    );
                    setSelectedVariant(updatedVariant);
                } catch (error) {
                    console.error('Lỗi khi cập nhật thông tin sản phẩm:', error);
                }
            }
        };

        window.addEventListener('stockUpdated', handleStockUpdate);
        return () => {
            window.removeEventListener('stockUpdated', handleStockUpdate);
        };
    }, [productId, selectedAttributes]);

    const handleAttributeChange = (attributeName, value) => {
        const newAttributes = { ...selectedAttributes, [attributeName]: value };
        setSelectedAttributes(newAttributes);

        // Find matching variant (dùng hàm mới, truyền variants)
        const variant = findMatchingVariant(newAttributes, product?.variants);
        setSelectedVariant(variant);
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.warning('Vui lòng chọn đầy đủ các thuộc tính sản phẩm');
            return;
        }
        const itemToAdd = {
            id: product._id,
            name: product.name,
            price: selectedVariant.price || product.price,
            image: mainImage,
            color: selectedAttributes.colors,
            size: selectedAttributes.sizes,
            quantity: quantity,
            stock: selectedVariant.stock
        };
        
        try {
            await addToCart(itemToAdd);
            
            // Fetch lại thông tin sản phẩm để cập nhật số lượng tồn kho
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Cập nhật product state với thông tin mới
            const updatedProduct = res.data;
            const images = updatedProduct.images?.map(img =>
                img.startsWith('/uploads/') ? `http://localhost:5000${img}` : img
            ) || [];
            setProduct({ ...updatedProduct, images });
            
            // Cập nhật selectedVariant với thông tin tồn kho mới
            const updatedVariant = updatedProduct.variants.find(
                v => v.attributes.color === selectedAttributes.colors && v.attributes.size === selectedAttributes.sizes
            );
            setSelectedVariant(updatedVariant);
            
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
        }
    };

    const handleImageZoom = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    // Khi selectedVariant thay đổi, cập nhật mainImage và thumbnails
    useEffect(() => {
        if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
            // Chuẩn hóa đường dẫn ảnh biến thể
            const normalizedImages = selectedVariant.images.map(normalizeImageUrl);
            setMainImage(normalizedImages[0]);
        } else if (product && product.images && product.images.length > 0) {
            setMainImage(product.images[0]);
        } else {
            setMainImage('/assets/img/no-image.png');
        }
    }, [selectedVariant, product]);

    // thumbnails luôn ưu tiên ảnh biến thể, fallback về ảnh sản phẩm chung
    let thumbnails = [];
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        // Lấy ảnh biến thể + ảnh sản phẩm (loại trùng lặp)
        const variantImgs = selectedVariant.images.map(normalizeImageUrl);
        // const productImgs = (product?.images || []).map(normalizeImageUrl).filter(img => !variantImgs.includes(img));
        thumbnails = [...variantImgs];
    } else if (product?.images && product.images.length > 0) {
        thumbnails = product.images.map(normalizeImageUrl);
    } else {
        thumbnails = ['/assets/img/no-image.png'];
    }

    // Khi click vào thumbnail, đổi mainImage
    const handleThumbnailClick = (thumb) => {
        setMainImage(thumb);
    };

    useEffect(() => {
        console.log('selectedVariant:', selectedVariant);
        console.log('mainImage:', mainImage);
        if (selectedVariant && selectedVariant.images) {
            console.log('selectedVariant.images:', selectedVariant.images);
        }
    }, [selectedVariant, mainImage]);

    // Lấy danh sách bình luận (chỉ hiển thị những comment đã được duyệt và không bị ẩn)
    useEffect(() => {
        const fetchComments = async () => {
            setLoadingComments(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/comments/${productId}`);
                // Lọc chỉ hiển thị comments đã được duyệt và không bị ẩn
                const approvedComments = res.data.filter(comment => 
                    comment.status === 'approved' && !comment.isHidden && !comment.isDeleted
                );
                setComments(approvedComments);
            } catch (err) {
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        };
        if (productId) fetchComments();
    }, [productId]);

    // Lấy danh sách orderId hợp lệ để đánh giá
    useEffect(() => {
        const fetchEligibleOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`http://localhost:5000/api/comments/eligible-orders/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCanReviewOrders(res.data);
                if (res.data.length > 0) setSelectedOrderId(res.data[0].orderId);
            } catch (err) {
                setCanReviewOrders([]);
            }
        };
        if (productId) fetchEligibleOrders();
    }, [productId]);

    // Gửi đánh giá
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewContent || !reviewRating || !selectedOrderId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/comments', {
                productId,
                content: reviewContent,
                rating: reviewRating,
                orderId: selectedOrderId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviewContent('');
            setReviewRating(5);
            toast.success('Đánh giá đã được gửi và đang chờ duyệt!');
            // Reload bình luận và order hợp lệ
            const res = await axios.get(`http://localhost:5000/api/comments/${productId}`);
            const approvedComments = res.data.filter(comment => 
                comment.status === 'approved' && !comment.isHidden && !comment.isDeleted
            );
            setComments(approvedComments);
            const eligibleRes = await axios.get(`http://localhost:5000/api/comments/eligible-orders/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanReviewOrders(eligibleRes.data);
            if (eligibleRes.data.length > 0) setSelectedOrderId(eligibleRes.data[0].orderId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
        }
    };

    // Báo cáo bình luận
    const handleReportComment = async (commentId) => {
        const reason = prompt('Lý do báo cáo (spam/inappropriate/offensive/fake/other):');
        if (!reason) return;
        
        const description = prompt('Mô tả chi tiết (tùy chọn):');
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/comments/${commentId}/report`, {
                reason,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã báo cáo bình luận thành công!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi báo cáo bình luận');
        }
    };

    if (fetchError) return <div>Không tìm thấy sản phẩm hoặc có lỗi xảy ra.</div>;
    if (!product) return <div>Đang tải...</div>;

    console.log('Render ảnh:', mainImage, normalizeImageUrl(mainImage));

    return (
        <main className="main">
            {/* Breadcrumb */}
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">Chi tiết sản phẩm</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><a href="/">Trang chủ</a></li>
                            <li className="current">Chi tiết sản phẩm</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Product Details Section */}
            <section id="product-details" className="product-details section">
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="row">
                        {/* Product Images */}
                        <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right" data-aos-delay="200">
                            <div className="product-images">
                                <div className="main-image-container mb-3">
                                    <div
                                        className="image-zoom-container"
                                        onMouseMove={handleImageZoom}
                                        onMouseEnter={() => setIsZoomed(true)}
                                        onMouseLeave={() => setIsZoomed(false)}
                                        style={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <img
                                            src={normalizeImageUrl(mainImage)}
                                            alt="Sản phẩm"
                                            className="img-fluid main-image"
                                            style={{
                                                maxWidth: '100%',
                                                transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                                                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                                transition: 'transform 0.1s ease-out',
                                                cursor: 'zoom-in'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="product-thumbnails d-flex gap-2">
                                    {thumbnails.map((thumb, idx) => (
                                        <div
                                            key={idx}
                                            className={`thumbnail-item${mainImage === thumb ? ' active' : ''}`}
                                            style={{
                                                cursor: 'pointer',
                                                border: mainImage === thumb ? '2px solid #2563eb' : '2px solid transparent',
                                                borderRadius: 6,
                                                transition: 'all 0.3s ease',
                                                padding: '2px'
                                            }}
                                            onClick={() => handleThumbnailClick(thumb)}
                                        >
                                            <img
                                                src={normalizeImageUrl(thumb || '/assets/img/no-image.png')}
                                                alt="Ảnh thu nhỏ sản phẩm"
                                                className="img-fluid"
                                                style={{
                                                    width: 70,
                                                    height: 70,
                                                    objectFit: 'cover',
                                                    borderRadius: 4
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
                            <div className="product-info">
                                <div className="product-meta mb-2">
                                    <span className="product-category">{product.category?.name || 'Chưa phân loại'}</span>
                                    <div className="product-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-half"></i>
                                        <span className="rating-count">({product.reviews?.length || 0} đánh giá)</span>
                                    </div>
                                </div>
                                <h1 className="product-title">{product.name}</h1>
                                <div className="product-price-container mb-4">
                                    <span className="current-price">
                                        {(selectedVariant?.price || product.price)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                    {product.oldPrice && <span className="original-price">{product.oldPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>}
                                    {product.oldPrice && <span className="discount-badge">-{Math.round(100 - ((selectedVariant?.price || product.price) / product.oldPrice) * 100)}%</span>}
                                </div>
                                <div className="product-short-description mb-4">
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
                                </div>
                                <div className="product-availability mb-4">
                                    <i className={`bi bi-${selectedVariant?.stock > 0 ? 'check' : 'x'}-circle-fill text-${selectedVariant?.stock > 0 ? 'success' : 'danger'}`}></i>
                                    <span>{selectedVariant?.stock > 0 ? (selectedVariant.stock > 10 ? 'Còn hàng' : 'Sắp hết hàng') : 'Hết hàng'}</span>
                                    {selectedVariant?.stock > 0 && <span className="stock-count">({selectedVariant?.stock} sản phẩm có sẵn)</span>}
                                </div>

                                {/* Product Attributes */}
                                <div className="product-options mb-4">
                                    {Object.entries(product.attributes || {}).map(([attrName, attrValues]) => (
                                        <div key={attrName} className="option-group mb-3">
                                            <label className="option-label">{
                                                attrName === "sizes"
                                                    ? "Kích cỡ"
                                                    : attrName === "colors"
                                                        ? "Màu sắc"
                                                        : attrName.charAt(0).toUpperCase() + attrName.slice(1)
                                            }:</label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {attrValues.map((value, index) => (
                                                    <button
                                                        key={index}
                                                        className={`option-btn${selectedAttributes[attrName] === value ? ' active' : ''}`}
                                                        onClick={() => handleAttributeChange(attrName, value)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            border: '2px solid',
                                                            borderColor: selectedAttributes[attrName] === value ? '#2563eb' : '#e5e7eb',
                                                            borderRadius: '4px',
                                                            backgroundColor: selectedAttributes[attrName] === value ? '#2563eb' : '#fff',
                                                            color: selectedAttributes[attrName] === value ? '#fff' : '#374151',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quantity Selector */}
                                <div className="product-quantity mb-4">
                                    <h6 className="option-title">Số lượng:</h6>
                                    <div className="quantity-selector d-flex align-items-center gap-2">
                                        <button
                                            className="quantity-btn decrease btn btn-light"
                                            onClick={e => {
                                                e.preventDefault();
                                                setQuantity(q => Math.max(1, q - 1));
                                            }}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className="quantity-input form-control"
                                            value={quantity}
                                            min="1"
                                            max={selectedVariant?.stock || 0}
                                            style={{ width: 60 }}
                                            onChange={e => setQuantity(Math.max(1, Math.min(selectedVariant?.stock || 0, Number(e.target.value))))}
                                        />
                                        <button
                                            className="quantity-btn increase btn btn-light"
                                            onClick={e => {
                                                e.preventDefault();
                                                setQuantity(q => Math.min(selectedVariant?.stock || 0, q + 1));
                                            }}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="product-actions d-flex gap-2 mb-3">
                                    <button
                                        className="btn btn-primary add-to-cart-btn"
                                        onClick={handleAddToCart}
                                        disabled={!selectedVariant || selectedVariant.stock <= 0}
                                    >
                                        <i className="bi bi-cart-plus"></i> Thêm vào giỏ
                                    </button>
                                    <button
                                        className="btn btn-outline-primary buy-now-btn"
                                        disabled={!selectedVariant || selectedVariant.stock <= 0}
                                    >
                                        <i className="bi bi-lightning-fill"></i> Mua ngay
                                    </button>
                                </div>

                                {/* Additional Info */}
                                <div className="additional-info mt-4">
                                    <div className="info-item"><i className="bi bi-truck"></i> <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span></div>
                                    <div className="info-item"><i className="bi bi-arrow-repeat"></i> <span>Chính sách đổi trả trong 30 ngày</span></div>
                                    <div className="info-item"><i className="bi bi-shield-check"></i> <span>Bảo hành chính hãng 2 năm</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="row mt-5" data-aos="fade-up">
                        <div className="col-12">
                            <div className="product-details-tabs">
                                <ul className="nav nav-tabs" id="productTabs" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab" aria-controls="description" aria-selected="true">Mô tả</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="specifications-tab" data-bs-toggle="tab" data-bs-target="#specifications" type="button" role="tab" aria-controls="specifications" aria-selected="false">Thông số kỹ thuật</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">Đánh giá ({comments.length})</button>
                                    </li>
                                </ul>
                                <div className="tab-content" id="productTabsContent">
                                    {/* Description Tab */}
                                    <div className="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
                                        <div className="product-description">
                                            <h4>Tổng quan sản phẩm</h4>
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
                                        </div>
                                    </div>
                                    {/* Specifications Tab */}
                                    <div className="tab-pane fade" id="specifications" role="tabpanel" aria-labelledby="specifications-tab">
                                        <div className="product-specifications">
                                            <div className="specs-group">
                                                <h4>Thông số kỹ thuật</h4>
                                                <div className="specs-table">
                                                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                                        Object.entries(product.specifications).map(([key, value]) => (
                                                            <div key={key} className="specs-row">
                                                                <div className="specs-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                                                <div className="specs-value">{value}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p>Không có thông số kỹ thuật cho sản phẩm này.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Reviews Tab */}
                                    <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                                        <div className="product-reviews">
                                            {/* Form đánh giá nếu đủ điều kiện */}
                                            {canReviewOrders.length > 0 && (
                                                <div className="review-form-container mb-4 p-3 border rounded">
                                                    <h6 className="mb-3">Viết đánh giá của bạn</h6>
                                                    <form onSubmit={handleReviewSubmit}>
                                                        <div className="mb-3">
                                                            <label className="form-label">Đánh giá:</label>
                                                            <div className="rating-selector">
                                                                {[5,4,3,2,1].map(star => (
                                                                    <button
                                                                        key={star}
                                                                        type="button"
                                                                        className={`btn btn-sm ${reviewRating >= star ? 'btn-warning' : 'btn-outline-warning'}`}
                                                                        onClick={() => setReviewRating(star)}
                                                                        style={{ marginRight: '5px' }}
                                                                    >
                                                                        ★ {star}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">Nội dung đánh giá:</label>
                                                            <textarea 
                                                                className="form-control"
                                                                value={reviewContent} 
                                                                onChange={e => setReviewContent(e.target.value)} 
                                                                rows={3} 
                                                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                                                required 
                                                            />
                                                        </div>
                                                        {canReviewOrders.length > 1 && (
                                                            <div className="mb-3">
                                                                <label className="form-label">Chọn đơn hàng:</label>
                                                                <select 
                                                                    className="form-select"
                                                                    value={selectedOrderId} 
                                                                    onChange={e => setSelectedOrderId(e.target.value)}
                                                                >
                                                                    {canReviewOrders.map(o => (
                                                                        <option key={o.orderId} value={o.orderId}>
                                                                            Đơn #{o.orderId.slice(-5)} - {new Date(o.ngay_tao).toLocaleDateString('vi-VN')}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                        <button type="submit" className="btn btn-primary">
                                                            <i className="bi bi-send"></i> Gửi đánh giá
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                            {canReviewOrders.length === 0 && (
                                                <div className="alert alert-info mb-4">
                                                    <i className="bi bi-info-circle"></i>
                                                    Chỉ khách đã mua và hoàn thành đơn hàng mới được đánh giá sản phẩm này.
                                                </div>
                                            )}
                                            {/* Danh sách bình luận */}
                                            <h5 className="mb-3">Đánh giá sản phẩm ({comments.length})</h5>
                                            {loadingComments ? (
                                                <div className="text-center py-3">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Đang tải...</span>
                                                    </div>
                                                    <p className="mt-2">Đang tải đánh giá...</p>
                                                </div>
                                            ) : comments.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <i className="bi bi-chat-dots text-muted" style={{fontSize: '3rem'}}></i>
                                                    <p className="text-muted mt-2">Chưa có đánh giá nào cho sản phẩm này.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {(showAllComments ? comments : comments.slice(0, 5)).map((c, idx) => (
                                                        <div key={c._id || idx} className="comment-item border rounded p-3 mb-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>
                                                                    <div className="fw-bold text-primary">
                                                                        {c.userId?.name || 'Ẩn danh'}
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex gap-1">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() => handleReportComment(c._id)}
                                                                        title="Báo cáo bình luận"
                                                                    >
                                                                        <i className="bi bi-flag"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="rating-display mb-2">
                                                                {Array(5).fill(null).map((_, index) => (
                                                                    <span key={index} className={index < c.rating ? 'text-warning' : 'text-muted'}>
                                                                        ★
                                                                    </span>
                                                                ))}
                                                                <span className="ms-2 text-muted">({c.rating}/5)</span>
                                                            </div>
                                                            
                                                            <div className="comment-content mb-2">
                                                                <p className="mb-0">{c.content}</p>
                                                            </div>
                                                            
                                                            {/* Admin Reply */}
                                                            {c.adminReply && (
                                                                <div className="admin-reply bg-light border-start border-primary ps-3 py-2 mt-2">
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <i className="bi bi-shield-check text-primary me-2"></i>
                                                                        <small className="fw-bold text-primary">Phản hồi từ Admin</small>
                                                                    </div>
                                                                    <p className="mb-0 small">{c.adminReply.content}</p>
                                                                    <small className="text-muted">
                                                                        {new Date(c.adminReply.repliedAt).toLocaleString('vi-VN')}
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    
                                                    {comments.length > 5 && (
                                                        <div className="text-center">
                                                            {!showAllComments ? (
                                                                <button 
                                                                    className="btn btn-outline-primary" 
                                                                    onClick={() => setShowAllComments(true)}
                                                                >
                                                                    <i className="bi bi-chevron-down"></i> Hiển thị thêm ({comments.length - 5} đánh giá)
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    className="btn btn-outline-secondary" 
                                                                    onClick={() => setShowAllComments(false)}
                                                                >
                                                                    <i className="bi bi-chevron-up"></i> Ẩn bớt
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ProductDetail; 