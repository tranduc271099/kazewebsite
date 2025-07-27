import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import '../../admin/styles/Category.css';
import { CartContext } from '../context/CartContext';

const Category = () => {
    // State cho filter bar và pagination
    const { categoryName } = useParams(); // Get category name from URL parameters
    const navigate = useNavigate(); // Initialize useNavigate
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);

    // State cho price range ở sidebar
    const minLimit = 0;
    const maxLimit = 10000000; // 10,000,000đ
    const step = 50000; // 50,000đ
    const [minPrice, setMinPrice] = useState(minLimit);
    const [maxPrice, setMaxPrice] = useState(maxLimit);
    const [appliedPriceRange, setAppliedPriceRange] = useState({ min: minLimit, max: maxLimit });

    // State cho brand filter
    const [allBrands, setAllBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [brandSearchTerm, setBrandSearchTerm] = useState('');

    // Handler cho slider
    const handleMinRange = (e) => {
        const value = Math.min(Number(e.target.value), maxPrice - step);
        setMinPrice(value);
    };
    const handleMaxRange = (e) => {
        const value = Math.max(Number(e.target.value), minPrice + step);
        setMaxPrice(value);
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
    const [selectedCategorySidebar, setSelectedCategorySidebar] = useState(categoryName ? categoryName.toLowerCase() : '*'); // Initialize from URL param
    const backendUrl = 'http://localhost:5000';

    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, productsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/categories'),
                    axios.get('http://localhost:5000/api/products?activeOnly=true')
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
    }, [categoryName]); // Add categoryName to dependency array

    // Lắng nghe sự kiện thay đổi tồn kho
    useEffect(() => {
        const handleStockUpdate = async (event) => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/products/${event.detail.productId}?activeOnly=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const updatedProduct = res.data;

                // Cập nhật danh sách products với thông tin mới
                setProducts(prevProducts =>
                    prevProducts.map(p =>
                        p._id === event.detail.productId ? updatedProduct : p
                    )
                );
            } catch (error) {
                console.error('Lỗi khi cập nhật thông tin sản phẩm:', error);
            }
        };

        window.addEventListener('stockUpdated', handleStockUpdate);
        return () => {
            window.removeEventListener('stockUpdated', handleStockUpdate);
        };
    }, []);

    // Trích xuất danh sách thương hiệu
    useEffect(() => {
        if (products.length > 0) {
            const extractedBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
            setAllBrands(extractedBrands.sort());
        }
    }, [products]);

    // Lọc và sắp xếp sản phẩm
    const [displayedProducts, setDisplayedProducts] = useState([]);

    useEffect(() => {
        let tempProducts = [...products];

        // 1. Lọc theo danh mục sidebar
        if (selectedCategorySidebar !== '*') {
            tempProducts = tempProducts.filter(p => p.category?.name?.toLowerCase() === selectedCategorySidebar.toLowerCase());
        }

        // 2. Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // 3. Lọc theo khoảng giá từ sidebar
        if (appliedPriceRange.min !== minLimit || appliedPriceRange.max !== maxLimit) {
            tempProducts = tempProducts.filter(p => p.price >= appliedPriceRange.min && p.price <= appliedPriceRange.max);
        }

        // 4. Lọc theo thương hiệu
        if (selectedBrands.length > 0) {
            tempProducts = tempProducts.filter(p => p.brand && selectedBrands.includes(p.brand));
        }

        // 5. Sắp xếp
        switch (sortBy) {
            case 'price-asc':
                tempProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                tempProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                tempProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                tempProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'featured':
            default:
                // Giữ nguyên hoặc sắp xếp theo logic "nổi bật" nếu có
                break;
        }

        setDisplayedProducts(tempProducts);
        setCurrentPage(1); // Reset về trang 1 mỗi khi filter thay đổi

    }, [products, selectedCategorySidebar, searchTerm, appliedPriceRange, sortBy, selectedBrands]);

    // 6. Phân trang
    const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
    const paginatedProducts = displayedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .hover-img {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .product-image:hover .hover-img {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

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

    const handleAddToCart = async (product) => {
        const variant = product.variants?.find(
            v => v.attributes.color === (product.attributes?.colors?.[0] || '') && v.attributes.size === (product.attributes?.sizes?.[0] || '')
        );
        const price = variant ? variant.price : product.price;
        const itemToAdd = {
            id: product._id,
            name: product.name,
            price,
            image: product.images?.[0] || '',
            color: product.attributes?.colors?.[0] || '',
            size: product.attributes?.sizes?.[0] || '',
            quantity: 1,
            stock: variant ? variant.stock : product.stock
        };

        try {
            await addToCart(itemToAdd);

            // Fetch lại thông tin sản phẩm từ API để cập nhật số lượng tồn kho
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/products/${product._id}?activeOnly=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const updatedProduct = res.data;

                // Cập nhật danh sách products với thông tin mới
                setProducts(prevProducts =>
                    prevProducts.map(p =>
                        p._id === product._id ? updatedProduct : p
                    )
                );
            } catch (fetchError) {
                console.error('Lỗi khi fetch lại thông tin sản phẩm:', fetchError);
            }
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
        }
    };

    const handleBrandChange = (isChecked, brand) => {
        setSelectedBrands(prev =>
            isChecked ? [...prev, brand] : prev.filter(b => b !== brand)
        );
    };

    const filteredBrands = allBrands.filter(brand =>
        brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <main className="main">
            <div className="page-title light-background">
                <div className="container d-lg-flex justify-content-between align-items-center">
                    <h1 className="mb-2 mb-lg-0">Danh mục</h1>
                    <nav className="breadcrumbs">
                        <ol>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="current">Danh mục</li>
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
                                        onClick={() => {
                                            setSelectedCategorySidebar('*');
                                            navigate('/category'); // Navigate to base category URL
                                        }}>
                                        <span className="category-link">Tất cả</span>
                                    </li>
                                    {categories.map(category => (
                                        <li key={category._id} className={`category-item${selectedCategorySidebar === category.name.toLowerCase() ? ' active' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                setSelectedCategorySidebar(category.name.toLowerCase());
                                                navigate(`/category/${category.name.toLowerCase()}`); // Navigate to category-specific URL
                                            }}>
                                            <span className="category-link">{category.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Pricing Range Widget */}
                            <div className="pricing-range-widget widget-item">
                                <h3 className="widget-title">Khoảng giá</h3>
                                <div className="price-range-container">
                                    <div className="current-range mb-3 d-flex justify-content-between">
                                        <span className="min-price">{minPrice.toLocaleString('vi-VN')}đ</span>
                                        <span className="max-price">{maxPrice.toLocaleString('vi-VN')}đ</span>
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
                                            max={maxLimit}
                                            step={step}
                                            value={minPrice}
                                            onChange={handleMinRange}
                                            style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', zIndex: 3, background: 'none' }}
                                        />
                                        <input
                                            type="range"
                                            className="max-range"
                                            min={minLimit}
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
                                                    <input
                                                        type="number"
                                                        className="form-control min-price-input"
                                                        placeholder="Thấp nhất"
                                                        min={minLimit}
                                                        max={maxPrice - step}
                                                        value={minPrice}
                                                        step={step}
                                                        onChange={handleMinInput}
                                                    />
                                                    <span className="input-group-text">đ</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="input-group input-group-sm">
                                                    <input
                                                        type="number"
                                                        className="form-control max-price-input"
                                                        placeholder="Cao nhất"
                                                        min={minPrice + step}
                                                        max={maxLimit}
                                                        value={maxPrice}
                                                        step={step}
                                                        onChange={handleMaxInput}
                                                    />
                                                    <span className="input-group-text">đ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="filter-actions mt-3">
                                        <button type="button" className="btn btn-sm btn-primary w-100" onClick={() => setAppliedPriceRange({ min: minPrice, max: maxPrice })}>Áp dụng</button>
                                    </div>
                                </div>
                            </div>
                            {/* Brand Filter Widget */}
                            <div className="brand-filter-widget widget-item">
                                <h3 className="widget-title">Lọc theo thương hiệu</h3>
                                <div className="brand-filter-content">
                                    <div className="brand-search">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tìm thương hiệu..."
                                            value={brandSearchTerm}
                                            onChange={(e) => setBrandSearchTerm(e.target.value)}
                                        />
                                        <i className="bi bi-search"></i>
                                    </div>
                                    <div className="brand-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {filteredBrands.map(brand => (
                                            <div key={brand} className="brand-item">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`brand-${brand}`}
                                                        checked={selectedBrands.includes(brand)}
                                                        onChange={(e) => handleBrandChange(e.target.checked, brand)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`brand-${brand}`}>
                                                        {brand}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
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
                                                <label htmlFor="productSearch" className="form-label">Tìm kiếm sản phẩm</label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="productSearch"
                                                        placeholder="Tìm kiếm sản phẩm..."
                                                        aria-label="Tìm kiếm sản phẩm"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                    <button className="btn search-btn" type="button">
                                                        <i className="bi bi-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-2">
                                            <div className="filter-item">
                                                <label htmlFor="sortBy" className="form-label">Sắp xếp theo</label>
                                                <select
                                                    className="form-select"
                                                    id="sortBy"
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                >
                                                    <option value="featured">Nổi bật</option>
                                                    <option value="price-asc">Giá: Thấp đến Cao</option>
                                                    <option value="price-desc">Giá: Cao đến Thấp</option>
                                                    <option value="rating">Đánh giá của khách hàng</option>
                                                    <option value="newest">Hàng mới nhất</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-3">
                                            <div className="filter-item">
                                                <label className="form-label">Sản phẩm mỗi trang</label>
                                                <div className="d-flex align-items-center">
                                                    <div className="items-per-page">
                                                        <select
                                                            className="form-select"
                                                            aria-label="Số sản phẩm mỗi trang"
                                                            value={itemsPerPage}
                                                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                                        >
                                                            <option value="12">12 / trang</option>
                                                            <option value="24">24 / trang</option>
                                                            <option value="48">48 / trang</option>
                                                            <option value="96">96 / trang</option>
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
                                                <span className="active-filter-label me-2">Bộ lọc đang áp dụng:</span>
                                                <div className="filter-tags d-flex flex-wrap align-items-center">
                                                    {selectedCategorySidebar !== '*' && <span className="filter-tag me-2 mb-2"> {selectedCategorySidebar} <button className="filter-remove" onClick={() => setSelectedCategorySidebar('*')}><i className="bi bi-x"></i></button></span>}
                                                    {searchTerm && <span className="filter-tag me-2 mb-2">Tìm kiếm: "{searchTerm}" <button className="filter-remove" onClick={() => setSearchTerm('')}><i className="bi bi-x"></i></button></span>}
                                                    {(appliedPriceRange.min > minLimit || appliedPriceRange.max < maxLimit) && (
                                                        <span className="filter-tag me-2 mb-2">
                                                            Giá: {appliedPriceRange.min.toLocaleString('vi-VN')}đ - {appliedPriceRange.max.toLocaleString('vi-VN')}đ
                                                            <button className="filter-remove" onClick={() => {
                                                                setAppliedPriceRange({ min: minLimit, max: maxLimit });
                                                                setMinPrice(minLimit);
                                                                setMaxPrice(maxLimit);
                                                            }}><i className="bi bi-x"></i></button>
                                                        </span>
                                                    )}
                                                    {selectedBrands.map(brand => (
                                                        <span key={brand} className="filter-tag me-2 mb-2">
                                                            {brand}
                                                            <button className="filter-remove" onClick={() => handleBrandChange(false, brand)}><i className="bi bi-x"></i></button>
                                                        </span>
                                                    ))}
                                                    <button className="clear-all-btn btn btn-link ms-2" onClick={() => {
                                                        setSearchTerm('');
                                                        setAppliedPriceRange({ min: minLimit, max: maxLimit });
                                                        setMinPrice(minLimit);
                                                        setMaxPrice(maxLimit);
                                                        setSelectedCategorySidebar('*');
                                                        setSelectedBrands([]);
                                                        setBrandSearchTerm('');
                                                    }}>Xoá tất cả</button>
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
                                    {paginatedProducts.map(product => {
                                        const image1 = product.images?.[0] ? (product.images[0].startsWith('/uploads/') ? backendUrl + product.images[0] : product.images[0]) : '/assets/img/no-image.png';
                                        const image2 = product.images?.[1] ? (product.images[1].startsWith('/uploads/') ? backendUrl + product.images[1] : product.images[1]) : image1;

                                        return (
                                            <div key={product._id} className="col-md-6 col-lg-3 product-item isotope-item">
                                                <div className="product-card">
                                                    <div className="product-image position-relative overflow-hidden">
                                                        {product.isNew && <span className="badge">Mới</span>}
                                                        {product.isSale && <span className="badge">Giảm giá</span>}
                                                        <img src={image1} alt={product.name} className="img-fluid main-img" />
                                                        <img src={image2} alt={`${product.name} Hover`} className="img-fluid hover-img position-absolute top-0 start-0 w-100 h-100" />
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
                                        <li className={currentPage === 1 ? 'disabled' : ''}>
                                            <a href="#" aria-label="Trang trước" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                                <i className="bi bi-arrow-left"></i>
                                                <span className="d-none d-sm-inline">Trước</span>
                                            </a>
                                        </li>
                                        {[...Array(totalPages).keys()].map(page => (
                                            <li key={page + 1}><a href="#" className={currentPage === page + 1 ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage(page + 1); }}>{page + 1}</a></li>
                                        ))}
                                        <li className={currentPage === totalPages ? 'disabled' : ''}>
                                            <a href="#" aria-label="Trang sau" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
                                                <span className="d-none d-sm-inline">Sau</span>
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