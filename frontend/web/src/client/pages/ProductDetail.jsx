import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';

function ProductDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [fetchError, setFetchError] = useState(false);

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

    const handleAttributeChange = (attributeName, value) => {
        const newAttributes = { ...selectedAttributes, [attributeName]: value };
        setSelectedAttributes(newAttributes);

        // Find matching variant (dùng hàm mới, truyền variants)
        const variant = findMatchingVariant(newAttributes, product?.variants);
        setSelectedVariant(variant);
    };

    const handleAddToCart = () => {
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
        addToCart(itemToAdd);
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
        const productImgs = (product?.images || []).map(normalizeImageUrl).filter(img => !variantImgs.includes(img));
        thumbnails = [...variantImgs, ...productImgs];
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

    if (fetchError) return <div>Không tìm thấy sản phẩm hoặc có lỗi xảy ra.</div>;
    if (!product) return <div>Loading...</div>;

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
                                            alt="Product"
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
                                                alt="Product Thumbnail"
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
                                    <span className="product-category">{product.category?.name || 'Danh mục'}</span>
                                    <div className="product-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-half"></i>
                                        <span className="rating-count">({product.reviews?.length || 0})</span>
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
                                    <p>{product.description}</p>
                                </div>
                                <div className="product-availability mb-4">
                                    <i className={`bi bi-${selectedVariant?.stock > 0 ? 'check' : 'x'}-circle-fill text-${selectedVariant?.stock > 0 ? 'success' : 'danger'}`}></i>
                                    <span>{selectedVariant?.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                                    <span className="stock-count">({selectedVariant?.stock || 0} sản phẩm)</span>
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
                                    <button className="btn btn-outline-secondary wishlist-btn">
                                        <i className="bi bi-heart"></i>
                                    </button>
                                </div>

                                {/* Additional Info */}
                                <div className="additional-info mt-4">
                                    <div className="info-item"><i className="bi bi-truck"></i> <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span></div>
                                    <div className="info-item"><i className="bi bi-arrow-repeat"></i> <span>Chính sách đổi trả trong 30 ngày</span></div>
                                    <div className="info-item"><i className="bi bi-shield-check"></i> <span>Bảo hành 2 năm</span></div>
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
                                        <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews" aria-selected="false">Đánh giá ({product.reviews?.length || 0})</button>
                                    </li>
                                </ul>
                                <div className="tab-content" id="productTabsContent">
                                    {/* Description Tab */}
                                    <div className="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
                                        <div className="product-description">
                                            <h4>Tổng quan sản phẩm</h4>
                                            <p>{product.description}</p>
                                        </div>
                                    </div>
                                    {/* Specifications Tab */}
                                    <div className="tab-pane fade" id="specifications" role="tabpanel" aria-labelledby="specifications-tab">
                                        <div className="product-specifications">
                                            <div className="specs-group">
                                                <h4>Thông số kỹ thuật</h4>
                                                <div className="specs-table">
                                                    {Object.entries(product.specifications || {}).map(([key, value]) => (
                                                        <div key={key} className="specs-row">
                                                            <div className="specs-label">{key}</div>
                                                            <div className="specs-value">{value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Reviews Tab */}
                                    <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                                        <div className="product-reviews">
                                            <div className="reviews-summary">
                                                <div className="overall-rating">
                                                    <div className="rating-number">{product.rating || 0}</div>
                                                    <div className="rating-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`bi bi-star${i < Math.floor(product.rating) ? '-fill' : i < Math.ceil(product.rating) ? '-half' : ''}`}></i>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="reviews-count">{product.reviews?.length || 0} đánh giá</div>
                                            </div>
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