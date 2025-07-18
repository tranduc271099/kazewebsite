import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';

const ProductListSection = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('*');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const backendUrl = 'http://localhost:5000';
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [categoriesRes, productsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/categories', { headers }),
                    axios.get('http://localhost:5000/api/products', { headers })
                ]);

                setCategories(categoriesRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                setError('Không thể tải dữ liệu');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .custom-modal-backdrop {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: transparent !important;
                z-index: 1000;
                pointer-events: none;
            }
            .custom-modal-dialog {
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1001;
                max-width: 350px;
                width: 90%;
                background: none;
                border-radius: 12px;
                box-shadow: none;
                padding: 0;
                animation: popupIn 0.2s;
            }
            @keyframes popupIn {
                from { opacity: 0; transform: translate(-50%, -60%) scale(0.95);}
                to   { opacity: 1; transform: translate(-50%, -50%) scale(1);}
            }
            .popover-attribute-box {
                opacity: 0;
                transform: translateX(-50%) scale(0.96);
                transition: opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1);
                pointer-events: none;
            }
            .popover-attribute-box.show {
                opacity: 1;
                transform: translateX(-50%) scale(1);
                pointer-events: auto;
            }
            .popover-attribute-box h5 {
                font-size: 1.18rem;
                font-weight: 700;
                margin-bottom: 14px;
                color: #1a237e;
                text-align: center;
            }
            .popover-attribute-box .form-label {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }
            .popover-attribute-box select,
            .popover-attribute-box input[type='number'] {
                border-radius: 8px;
                border: 1px solid #d1d5db;
                padding: 6px 10px;
                margin-bottom: 8px;
                width: 100%;
                font-size: 1rem;
            }
            .popover-attribute-box .btn-primary {
                background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
                border: none;
                font-weight: 600;
                border-radius: 8px;
                padding: 6px 18px;
            }
            .popover-attribute-box .btn-secondary {
                border-radius: 8px;
                padding: 6px 18px;
            }
            .popover-attribute-box button[aria-label='Đóng'] {
                color: #888;
                transition: color 0.2s;
            }
            .popover-attribute-box button[aria-label='Đóng']:hover {
                color: #1976d2;
            }
            .hover-img {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .product-image:hover .hover-img {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                selectedProduct &&
                !event.target.closest('.popover-attribute-box') &&
                !event.target.closest('.btn-cart')
            ) {
                setSelectedProduct(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedProduct]);

    useEffect(() => {
        if (selectedProduct) {
            setPopoverVisible(true);
        } else {
            setPopoverVisible(false);
        }
    }, [selectedProduct]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const openPopover = (product) => {
        setSelectedProduct(product);
        setSelectedSize(product.attributes?.sizes?.[0] || '');
        setSelectedColor(product.attributes?.colors?.[0] || '');
        setSelectedQuantity(1);
    };

    const closePopover = () => {
        setSelectedProduct(null);
    };

    const handleConfirmAddToCart = async () => {
        if (!selectedSize || !selectedColor) {
            toast.warning('Vui lòng chọn size và màu!');
            return;
        }
        const cartItem = {
            id: selectedProduct._id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: selectedProduct.images?.[0] || '',
            color: selectedColor,
            size: selectedSize,
            quantity: selectedQuantity,
            stock: selectedProduct.stock
        };
        try {
            await addToCart(cartItem);
            closePopover();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
    };

    const filteredProducts = selectedCategory === '*'
        ? products
        : products.filter(product =>
            product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <section id="product-list" className="product-list section">
            <div className="container isotope-layout" data-aos="fade-up" data-aos-delay="100">
                <div className="row">
                    <div className="col-12">
                        <div className="product-filters isotope-filters mb-5 d-flex justify-content-center product-category-filters">
                            <ul className="d-flex flex-wrap gap-2 list-unstyled">
                                <li
                                    className={selectedCategory === '*' ? 'filter-active' : ''}
                                    onClick={() => handleCategoryClick('*')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Tất cả
                                </li>
                                {categories.map(category => (
                                    <li
                                        key={category._id}
                                        className={selectedCategory === category.name.toLowerCase() ? 'filter-active' : ''}
                                        onClick={() => handleCategoryClick(category.name.toLowerCase())}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {category.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="row product-container isotope-container" data-aos="fade-up" data-aos-delay="200">
                    {filteredProducts.map(product => {
                        const image1 = product.images?.[0] ? (product.images[0].startsWith('/uploads/') ? backendUrl + product.images[0] : product.images[0]) : '/assets/img/no-image.png';
                        const image2 = product.images?.[1] ? (product.images[1].startsWith('/uploads/') ? backendUrl + product.images[1] : product.images[1]) : image1;

                        return (
                            <div key={product._id} className="col-md-6 col-lg-3 product-item isotope-item" style={{ position: 'relative' }}>
                                <div className="product-card">
                                    <div className="product-image position-relative overflow-hidden">
                                        {product.isNew && <span className="badge">Mới</span>}
                                        {product.isSale && <span className="badge">Giảm giá</span>}
                                        <img src={image1} alt={product.name} className="img-fluid main-img" />
                                        <img src={image2} alt={`${product.name} Hover`} className="img-fluid hover-img position-absolute top-0 start-0 w-100 h-100" />
                                        <div className="product-overlay">
                                            <button className="btn-cart" onClick={() => openPopover(product)}><i className="bi bi-cart-plus"></i> Thêm vào giỏ</button>
                                            <div className="product-actions">
                                                <a href="#" className="action-btn"><i className="bi bi-heart"></i></a>
                                                <Link to={`/product-details/${product._id}`} className="action-btn"><i className="bi bi-eye"></i></Link>
                                                <a href="#" className="action-btn"><i className="bi bi-arrow-left-right"></i></a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="product-info">
                                        <h5 className="product-title">
                                            <Link to={`/product-details/${product._id}`}>{product.name}</Link>
                                        </h5>
                                        <div className="product-price">
                                            <span className="current-price">{product.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                            {product.oldPrice && <span className="old-price">{product.oldPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>}
                                        </div>
                                        <div className="product-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <i
                                                    key={i}
                                                    className={`bi bi-star${i < Math.floor(product.rating || 0)
                                                        ? '-fill'
                                                        : i < Math.ceil(product.rating || 0)
                                                            ? '-half'
                                                            : ''}`}
                                                ></i>
                                            ))}
                                            <span>({product.reviews?.length || 0} đánh giá)</span>
                                        </div>
                                    </div>
                                    {selectedProduct && selectedProduct._id === product._id && (
                                        <div
                                            className={`popover-attribute-box${popoverVisible ? ' show' : ''}`}
                                            style={{
                                                position: 'absolute',
                                                top: 70,
                                                left: '50%',
                                                zIndex: 10,
                                                background: '#fff',
                                                borderRadius: 16,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                                                padding: '22px 20px 16px 20px',
                                                minWidth: 240,
                                                maxWidth: '95vw',
                                                border: '1.5px solid #e3e6ee'
                                            }}
                                        >
                                            <button
                                                style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', zIndex: 2 }}
                                                onClick={closePopover}
                                                aria-label="Đóng"
                                            >&times;</button>
                                            <h5 className="mb-2" style={{ fontWeight: 600 }}>Chọn thuộc tính</h5>
                                            <div className="mb-2">
                                                <label className="form-label" style={{ fontWeight: 500 }}>Kích thước:</label>
                                                <select className="form-select" value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                                                    {selectedProduct.attributes?.sizes?.map(size => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label" style={{ fontWeight: 500 }}>Màu sắc:</label>
                                                <select className="form-select" value={selectedColor} onChange={e => setSelectedColor(e.target.value)}>
                                                    {selectedProduct.attributes?.colors?.map(color => (
                                                        <option key={color} value={color}>{color}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-2">
                                                <label className="form-label" style={{ fontWeight: 500 }}>Số lượng:</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min={1}
                                                    max={selectedProduct.stock}
                                                    value={selectedQuantity}
                                                    onChange={e => setSelectedQuantity(Math.max(1, Math.min(selectedProduct.stock, Number(e.target.value))))}
                                                />
                                                <small className="text-muted">Còn lại: {selectedProduct.stock}</small>
                                            </div>
                                            <div className="d-flex justify-content-end gap-2 mt-2">
                                                <button className="btn btn-secondary btn-sm" onClick={closePopover}>Hủy</button>
                                                <button className="btn btn-primary btn-sm" onClick={handleConfirmAddToCart}>Xác nhận</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-5" data-aos="fade-up">
                    <a href="./Category" className="view-all-btn">Xem tất cả sản phẩm <i className="bi bi-arrow-right"></i></a>
                </div>
            </div>
        </section>
    );
};

export default ProductListSection;
