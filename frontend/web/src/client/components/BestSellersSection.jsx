import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';

const BestSellersSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products?limit=4&sort=latest');
                setProducts(response.data.slice(0, 4));
                setLoading(false);
            } catch (err) {
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchProducts();
    }, []);

    // Lắng nghe sự kiện thay đổi tồn kho
    useEffect(() => {
        const handleStockUpdate = async (event) => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/products/${event.detail.productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const updatedProduct = res.data;
                
                // Cập nhật danh sách products với thông tin mới
                setProducts(prevProducts => 
                    prevProducts.map(p => 
                        p._id === event.detail.productId ? updatedProduct : p
                    )
                );
                
                // Cập nhật selectedProduct nếu đang được chọn
                if (selectedProduct && selectedProduct._id === event.detail.productId) {
                    setSelectedProduct(updatedProduct);
                }
            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin sản phẩm:', error);
            }
        };

        window.addEventListener('stockUpdated', handleStockUpdate);
        return () => {
            window.removeEventListener('stockUpdated', handleStockUpdate);
        };
    }, [selectedProduct]);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .popover-backdrop {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.4);
                z-index: 1040;
            }
            .popover-attribute-box {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                z-index: 1050;
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 5px 25px rgba(0,0,0,0.15);
                width: 90%;
                max-width: 380px;
                opacity: 0;
                transition: opacity 0.2s, transform 0.2s;
                pointer-events: none;
            }
            .popover-attribute-box.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
                pointer-events: auto;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const openPopover = (product) => {
        setSelectedProduct(product);
        const firstVariant = product.variants?.[0]?.attributes;
        setSelectedSize(firstVariant?.size || '');
        setSelectedColor(firstVariant?.color || '');
        setSelectedQuantity(1);
    };

    const closePopover = () => {
        setSelectedProduct(null);
    };

    const handleConfirmAddToCart = async () => {
        if (!selectedProduct) return;

        if (!selectedSize || !selectedColor) {
            toast.warning('Vui lòng chọn đầy đủ size và màu!');
            return;
        }

        const variant = selectedProduct.variants?.find(
            v => v.attributes.color === selectedColor && v.attributes.size === selectedSize
        );
        const price = variant ? variant.price : selectedProduct.price;
        const cartItem = {
            id: selectedProduct._id,
            name: selectedProduct.name,
            price,
            image: selectedProduct.images?.[0] || '',
            color: selectedColor,
            size: selectedSize,
            quantity: selectedQuantity,
            stock: variant ? variant.stock : selectedProduct.stock,
            slug: selectedProduct.slug
        };

        try {
            await addToCart(cartItem);
            
            // Fetch lại thông tin sản phẩm từ API để cập nhật số lượng tồn kho
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/products/${selectedProduct._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const updatedProduct = res.data;
                
                // Cập nhật selectedProduct với thông tin mới
                setSelectedProduct(updatedProduct);
                
                // Cập nhật danh sách products với thông tin mới
                setProducts(prevProducts => 
                    prevProducts.map(p => 
                        p._id === selectedProduct._id ? updatedProduct : p
                    )
                );
            } catch (fetchError) {
                console.error('Lỗi khi fetch lại thông tin sản phẩm:', fetchError);
            }
            
            closePopover();
        } catch (error) {
            toast.error(error.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number') return price;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <section id="best-sellers" className="best-sellers section">
                <div className="container section-title" data-aos="fade-up" style={{ padding: '28px 40px 28px' }}>
                    <h2>Sản phẩm bán chạy</h2>
                </div>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p>Đang tải sản phẩm...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="best-sellers" className="best-sellers section">
                <div className="container section-title" data-aos="fade-up" style={{ padding: '28px 40px 28px' }}>
                    <h2>Sản phẩm bán chạy</h2>
                </div>
                <div className="container" style={{ textAlign: 'center', color: 'red' }}>
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    const availableSizes = selectedProduct?.variants
        .filter(v => v.attributes.color === selectedColor)
        .map(v => v.attributes.size) || [];

    const availableColors = selectedProduct?.variants
        .filter(v => v.attributes.size === selectedSize)
        .map(v => v.attributes.color) || [];

    return (
        <section id="best-sellers" className="best-sellers section">
            <div className="container section-title" data-aos="fade-up" style={{ padding: '28px 40px 28px' }}>
                <h2>Sản phẩm bán chạy</h2>
            </div>
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="row gy-4">
                    {products.map((product, index) => (
                        <div key={product._id} className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={100 + (index * 50)}>
                            <div className="product-card">
                                <div className="product-image">
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : '/assets/img/product/default.webp'}
                                        className="img-fluid default-image"
                                        alt={product.name}
                                        loading="lazy"
                                    />
                                    <img
                                        src={product.images && product.images.length > 1 ? product.images[1] : (product.images && product.images.length > 0 ? product.images[0] : '/assets/img/product/default.webp')}
                                        className="img-fluid hover-image"
                                        alt={`${product.name} hover`}
                                        loading="lazy"
                                    />
                                    <div className="product-tags">
                                        <span className="badge bg-accent">Mới</span>
                                    </div>
                                    <div className="product-actions">
                                        <button className="btn-wishlist" type="button" aria-label="Thêm vào danh sách yêu thích">
                                            <i className="bi bi-heart"></i>
                                        </button>
                                        <Link to={`/product-details/${product._id}`} className="btn-quickview" aria-label="Xem nhanh">
                                            <i className="bi bi-eye"></i>
                                        </Link>
                                    </div>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-title"><Link to={`/product/${product.slug}`}>{product.name}</Link></h3>
                                    <div className="product-price">
                                        <span className="current-price">{formatPrice(product.price)}</span>
                                    </div>
                                    <div className="product-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-fill"></i>
                                        <i className="bi bi-star-half"></i>
                                        <span className="rating-count">(0 đánh giá)</span>
                                    </div>
                                    <button className="btn btn-add-to-cart" onClick={() => openPopover(product)} disabled={!product.variants || product.variants.length === 0}>
                                        <i className="bi bi-bag-plus me-2"></i>
                                        {(!product.variants || product.variants.length === 0) ? 'Hết hàng' : 'Thêm vào giỏ'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProduct && <div className="popover-backdrop" onClick={closePopover}></div>}

            <div className={`popover-attribute-box ${selectedProduct ? 'show' : ''}`}>
                {selectedProduct && (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Chọn thuộc tính</h5>
                            <button type="button" className="btn-close" aria-label="Đóng" onClick={closePopover}></button>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="color-select" className="form-label">Màu sắc</label>
                            <select id="color-select" className="form-select" value={selectedColor} onChange={e => setSelectedColor(e.target.value)}>
                                <option value="" disabled>Chọn màu</option>
                                {[...new Set(selectedProduct.variants.map(v => v.attributes.color))].map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="size-select" className="form-label">Kích thước</label>
                            <select id="size-select" className="form-select" value={selectedSize} onChange={e => setSelectedSize(e.target.value)} disabled={!selectedColor}>
                                <option value="" disabled>Chọn size</option>
                                {[...new Set(availableSizes)].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="quantity-input" className="form-label">Số lượng</label>
                            <input type="number" id="quantity-input" className="form-control" value={selectedQuantity} onChange={e => setSelectedQuantity(Math.max(1, parseInt(e.target.value, 10)))} min="1" />
                        </div>
                        <div className="d-flex justify-content-end">
                            <button type="button" className="btn btn-primary" onClick={handleConfirmAddToCart}>Xác nhận</button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default BestSellersSection; 