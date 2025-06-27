import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const ProductListSection = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('*');
    const backendUrl = 'http://localhost:5000';

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

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleAddToCart = (product) => {
        const cartItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            color: product.attributes?.colors?.[0] || '',
            size: product.attributes?.sizes?.[0] || '',
            quantity: 1,
            stock: product.stock
        };
        try {
            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItemIndex = currentCart.findIndex(
                item => item.id === cartItem.id &&
                    item.color === cartItem.color &&
                    item.size === cartItem.size
            );
            if (existingItemIndex > -1) {
                const newQuantity = currentCart[existingItemIndex].quantity + 1;
                if (newQuantity > cartItem.stock) {
                    toast.warning('Số lượng vượt quá tồn kho!');
                    return;
                }
                currentCart[existingItemIndex].quantity = newQuantity;
            } else {
                currentCart.push(cartItem);
            }
            localStorage.setItem('cart', JSON.stringify(currentCart));
            toast.success('Đã thêm vào giỏ hàng!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
    };

    const filteredProducts = selectedCategory === '*'
        ? products
        : products.filter(product =>
            product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );

    if (loading) return <div>Loading...</div>;
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
                            <div key={product._id} className="col-md-6 col-lg-3 product-item isotope-item">
                                <div className="product-card">
                                    <div className="product-image position-relative overflow-hidden">
                                        {product.isNew && <span className="badge">New</span>}
                                        {product.isSale && <span className="badge">Sale</span>}
                                        <img src={image1} alt={product.name} className="img-fluid main-img" />
                                        <img src={image2} alt={`${product.name} Hover`} className="img-fluid hover-img position-absolute top-0 start-0 w-100 h-100 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                        <div className="product-overlay">
                                            <button className="btn-cart" onClick={() => handleAddToCart(product)}><i className="bi bi-cart-plus"></i> Thêm vào giỏ</button>
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
