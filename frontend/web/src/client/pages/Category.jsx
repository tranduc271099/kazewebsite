import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import '../../admin/styles/Category.css';
import { CartContext } from '../context/CartContext';

const Category = () => {
    // State cho price range
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500);
    const minLimit = 0;
    const maxLimit = 1000;
    const step = 10;
    // Handler cho slider
    const handleMinRange = (e) => {
        const value = Number(e.target.value);
        if (value >= minLimit && value <= maxPrice - step) {
            setMinPrice(value);
        }
    };
    const handleMaxRange = (e) => {
        const value = Number(e.target.value);
        if (value <= maxLimit && value >= minPrice + step) {
            setMaxPrice(value);
        }
    };
    // Handler cho input
    const handleMinInput = (e) => {
        let value = Number(e.target.value);
        if (value < minLimit) value = minLimit;
        if (value > maxPrice - step) value = maxPrice - step;
        setMinPrice(value);
    };
    const handleMaxInput = (e) => {
        let value = Number(e.target.value);
        if (value > maxLimit) value = maxLimit;
        if (value < minPrice + step) value = minPrice + step;
        setMaxPrice(value);
    };

    // Dữ liệu động
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategorySidebar, setSelectedCategorySidebar] = useState('*');
    const backendUrl = 'http://localhost:5000';

    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, productsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/categories'),
                    axios.get('http://localhost:5000/api/products')
                ]);
                setCategories(categoriesRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                setError('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Lọc sản phẩm theo selectedCategorySidebar
    const filteredProducts = selectedCategorySidebar === '*'
        ? products
        : products.filter(product => product.category?.name?.toLowerCase() === selectedCategorySidebar.toLowerCase());

    console.log('selectedCategory:', selectedCategorySidebar);
    console.log('products:', products.map(p => ({ id: p._id, cat: p.category })));
    console.log('filteredProducts:', filteredProducts);

    // Thêm vào đầu file hoặc trong component
    const productImgStyle = {
        width: '220px',
        height: '220px',
        objectFit: 'cover',
        borderRadius: '10px',
        background: '#f5f5f5',
        display: 'block',
        margin: '0 auto'
    };

    const handleAddToCart = (product) => {
        const itemToAdd = {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            color: product.attributes?.colors?.[0] || '',
            size: product.attributes?.sizes?.[0] || '',
            quantity: 1,
            stock: product.stock
        };
        addToCart(itemToAdd);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <main className="main">
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">Danh mục</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><Link to="/">Home</Link></li>
                            <li className="current">Category</li>
                        </ol>
                    </nav>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-lg-4 sidebar">
                        <div className="widgets-container">
                            {/* Product Categories Widget */}
                            <div className="product-categories-widget widget-item">
                                <h3 className="widget-title">Danh mục</h3>
                                <ul className="category-tree list-unstyled mb-0">
                                    <li className={`category-item${selectedCategorySidebar === '*' ? ' active' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedCategorySidebar('*')}>
                                        <span className="category-link">Tất cả</span>
                                    </li>
                                    {categories.map(category => (
                                        <li key={category._id} className={`category-item${selectedCategorySidebar === category.name.toLowerCase() ? ' active' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedCategorySidebar(category.name.toLowerCase())}>
                                            <span className="category-link">{category.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Pricing Range Widget */}
                            <div className="pricing-range-widget widget-item">
                                <h3 className="widget-title">Price Range</h3>
                                <div className="price-range-container">
                                    <div className="current-range mb-3 d-flex justify-content-between">
                                        <span className="min-price">${minPrice}</span>
                                        <span className="max-price">${maxPrice}</span>
                                    </div>
                                    <div className="range-slider" style={{ position: 'relative', height: 32 }}>
                                        <div
                                            className="slider-track"
                                            style={{
                                                position: 'absolute',
                                                height: 6,
                                                borderRadius: 3,
                                                background: '#e5e7eb',
                                                top: 13,
                                                left: 0,
                                                right: 0,
                                                zIndex: 1,
                                            }}
                                        ></div>
                                        {/* Track màu xanh giữa 2 nút */}
                                        <div
                                            className="slider-progress"
                                            style={{
                                                position: 'absolute',
                                                height: 6,
                                                borderRadius: 3,
                                                background: '#2563eb',
                                                top: 13,
                                                left: `${((Math.min(minPrice, maxPrice) - minLimit) / (maxLimit - minLimit)) * 100}%`,
                                                width: `${(Math.abs(maxPrice - minPrice) / (maxLimit - minLimit)) * 100}%`,
                                                zIndex: 2,
                                            }}
                                        ></div>
                                        <input
                                            type="range"
                                            className="min-range"
                                            min={minLimit}
                                            max={maxPrice - step}
                                            step={step}
                                            value={minPrice}
                                            onChange={handleMinRange}
                                            style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', zIndex: 3, background: 'none' }}
                                        />
                                        <input
                                            type="range"
                                            className="max-range"
                                            min={minPrice + step}
                                            max={maxLimit}
                                            step={step}
                                            value={maxPrice}
                                            onChange={handleMaxRange}
                                            style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', zIndex: 4, background: 'none' }}
                                        />
                                    </div>
                                    <div className="price-inputs mt-3">
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text">$</span>
                                                    <input
                                                        type="number"
                                                        className="form-control min-price-input"
                                                        placeholder="Min"
                                                        min={minLimit}
                                                        max={maxPrice - step}
                                                        value={minPrice}
                                                        step={step}
                                                        onChange={handleMinInput}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text">$</span>
                                                    <input
                                                        type="number"
                                                        className="form-control max-price-input"
                                                        placeholder="Max"
                                                        min={minPrice + step}
                                                        max={maxLimit}
                                                        value={maxPrice}
                                                        step={step}
                                                        onChange={handleMaxInput}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="filter-actions mt-3">
                                        <button type="button" className="btn btn-sm btn-primary w-100">Apply Filter</button>
                                    </div>
                                </div>
                            </div>
                            {/* Color Filter Widget */}
                            <div className="color-filter-widget widget-item">
                                <h3 className="widget-title">Filter by Color</h3>
                                <div className="color-filter-content">
                                    <div className="color-options d-flex flex-wrap">
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="black" id="color-black" />
                                            <label className="form-check-label" htmlFor="color-black">
                                                <span className="color-swatch" style={{ backgroundColor: '#000000' }} title="Black"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="white" id="color-white" />
                                            <label className="form-check-label" htmlFor="color-white">
                                                <span className="color-swatch" style={{ backgroundColor: '#ffffff', border: '1px solid #ccc' }} title="White"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="red" id="color-red" />
                                            <label className="form-check-label" htmlFor="color-red">
                                                <span className="color-swatch" style={{ backgroundColor: '#e74c3c' }} title="Red"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="blue" id="color-blue" />
                                            <label className="form-check-label" htmlFor="color-blue">
                                                <span className="color-swatch" style={{ backgroundColor: '#3498db' }} title="Blue"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="green" id="color-green" />
                                            <label className="form-check-label" htmlFor="color-green">
                                                <span className="color-swatch" style={{ backgroundColor: '#2ecc71' }} title="Green"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="yellow" id="color-yellow" />
                                            <label className="form-check-label" htmlFor="color-yellow">
                                                <span className="color-swatch" style={{ backgroundColor: '#f1c40f' }} title="Yellow"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="orange" id="color-orange" />
                                            <label className="form-check-label" htmlFor="color-orange">
                                                <span className="color-swatch" style={{ backgroundColor: '#e67e22' }} title="Orange"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="purple" id="color-purple" />
                                            <label className="form-check-label" htmlFor="color-purple">
                                                <span className="color-swatch" style={{ backgroundColor: '#9b59b6' }} title="Purple"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="pink" id="color-pink" />
                                            <label className="form-check-label" htmlFor="color-pink">
                                                <span className="color-swatch" style={{ backgroundColor: '#fd79a8' }} title="Pink"></span>
                                            </label>
                                        </div>
                                        <div className="form-check color-option">
                                            <input className="form-check-input" type="checkbox" value="brown" id="color-brown" />
                                            <label className="form-check-label" htmlFor="color-brown">
                                                <span className="color-swatch" style={{ backgroundColor: '#795548' }} title="Brown"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="filter-actions mt-3">
                                        <button type="button" className="btn btn-sm btn-outline-secondary">Clear All</button>
                                        <button type="button" className="btn btn-sm btn-primary">Apply Filter</button>
                                    </div>
                                </div>
                            </div>
                            {/* Brand Filter Widget */}
                            <div className="brand-filter-widget widget-item">
                                <h3 className="widget-title">Filter by Brand</h3>
                                <div className="brand-filter-content">
                                    <div className="brand-search">
                                        <input type="text" className="form-control" placeholder="Search brands..." />
                                        <i className="bi bi-search"></i>
                                    </div>
                                    <div className="brand-list">
                                        {/* ... các brand ... */}
                                        <div className="brand-item">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="brand1" />
                                                <label className="form-check-label" htmlFor="brand1">
                                                    Nike <span className="brand-count">(24)</span>
                                                </label>
                                            </div>
                                        </div>
                                        {/* ... các brand khác ... */}
                                    </div>
                                    <div className="brand-actions">
                                        <button className="btn btn-sm btn-outline-primary">Apply Filter</button>
                                        <button className="btn btn-sm btn-link">Clear All</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Filter Bar */}
                        <section id="category-header" className="category-header section">
                            <div className="container" data-aos="fade-up">
                                {/* Filter and Sort Options */}
                                <div className="filter-container mb-4" data-aos="fade-up" data-aos-delay="100">
                                    <div className="row g-3 align-items-center">
                                        <div className="col-12 col-md-6 col-lg-3">
                                            <div className="filter-item search-form">
                                                <label htmlFor="productSearch" className="form-label">Search Products</label>
                                                <div className="input-group">
                                                    <input type="text" className="form-control" id="productSearch" placeholder="Search for products..." aria-label="Search for products" />
                                                    <button className="btn search-btn" type="button">
                                                        <i className="bi bi-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-2">
                                            <div className="filter-item">
                                                <label htmlFor="priceRange" className="form-label">Price Range</label>
                                                <select className="form-select" id="priceRange">
                                                    <option>All Prices</option>
                                                    <option>Under $25</option>
                                                    <option>$25 to $50</option>
                                                    <option>$50 to $100</option>
                                                    <option>$100 to $200</option>
                                                    <option>$200 &amp; Above</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-2">
                                            <div className="filter-item">
                                                <label htmlFor="sortBy" className="form-label">Sort By</label>
                                                <select className="form-select" id="sortBy">
                                                    <option>Featured</option>
                                                    <option>Price: Low to High</option>
                                                    <option>Price: High to Low</option>
                                                    <option>Customer Rating</option>
                                                    <option>Newest Arrivals</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-3">
                                            <div className="filter-item">
                                                <label className="form-label">View</label>
                                                <div className="d-flex align-items-center">
                                                    <div className="view-options me-3">
                                                        <button type="button" className="btn view-btn active" aria-label="Grid view">
                                                            <i className="bi bi-grid-3x3-gap-fill"></i>
                                                        </button>
                                                        <button type="button" className="btn view-btn" aria-label="List view">
                                                            <i className="bi bi-list-ul"></i>
                                                        </button>
                                                    </div>
                                                    <div className="items-per-page">
                                                        <select className="form-select" aria-label="Items per page">
                                                            <option value="12">12 per page</option>
                                                            <option value="24">24 per page</option>
                                                            <option value="48">48 per page</option>
                                                            <option value="96">96 per page</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Active Filters */}
                                    <div className="row mt-3">
                                        <div className="col-12" data-aos="fade-up" data-aos-delay="200">
                                            <div className="active-filters d-flex align-items-center">
                                                <span className="active-filter-label me-2">Active Filters:</span>
                                                <div className="filter-tags d-flex flex-wrap align-items-center">
                                                    <span className="filter-tag me-2 mb-2">
                                                        Electronics <button className="filter-remove"><i className="bi bi-x"></i></button>
                                                    </span>
                                                    <span className="filter-tag me-2 mb-2">
                                                        $50 to $100 <button className="filter-remove"><i className="bi bi-x"></i></button>
                                                    </span>
                                                    <button className="clear-all-btn btn btn-link ms-2">Clear All</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Product List */}
                        <section id="category-product-list" className="category-product-list section product-list">
                            <div className="container isotope-layout" data-aos="fade-up" data-aos-delay="100" data-default-filter="*" data-layout="masonry" data-sort="original-order">
                                <div className="row product-container isotope-container g-4" data-aos="fade-up" data-aos-delay="200">
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
                                                            <button className="btn-cart" onClick={() => handleAddToCart(product)}>
                                                                <i className="bi bi-cart-plus"></i> Thêm vào giỏ
                                                            </button>
                                                            <div className="product-actions">
                                                                <a href="#" className="action-btn"><i className="bi bi-heart"></i></a>
                                                                <Link to={`/product-details/${product._id}`} className="action-btn">
                                                                    <i className="bi bi-eye"></i>
                                                                </Link>
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
                            </div>
                        </section>
                        {/* Pagination */}
                        <section id="category-pagination" className="category-pagination section">
                            <div className="container">
                                <nav className="d-flex justify-content-center" aria-label="Page navigation">
                                    <ul>
                                        <li>
                                            <a href="#" aria-label="Previous page">
                                                <i className="bi bi-arrow-left"></i>
                                                <span className="d-none d-sm-inline">Previous</span>
                                            </a>
                                        </li>
                                        <li><a href="#" className="active">1</a></li>
                                        <li><a href="#">2</a></li>
                                        <li><a href="#">3</a></li>
                                        <li className="ellipsis">...</li>
                                        <li><a href="#">8</a></li>
                                        <li><a href="#">9</a></li>
                                        <li><a href="#">10</a></li>
                                        <li>
                                            <a href="#" aria-label="Next page">
                                                <span className="d-none d-sm-inline">Next</span>
                                                <i className="bi bi-arrow-right"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Category; 