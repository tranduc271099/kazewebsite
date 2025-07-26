import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import '../styles/Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { getCartItemsCount } = useContext(CartContext);
    const cartItemsCount = getCartItemsCount();
    const searchRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setShowSuggestions(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(searchTerm.trim())}`);
                setSuggestions(res.data.slice(0, 6));
            } catch {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setIsSearchOpen(false);
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <header id="header" className="header fixed-top d-flex align-items-center">
            <div className="container-fluid container-xl d-flex align-items-center justify-content-between">
                <Link to="/" className="logo d-flex align-items-center">
                    <span>Kaze</span>
                </Link>

                <nav id="navbar" className="navbar">
                    <ul>
                        <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Trang chủ</Link></li>
                        <li><Link to="/about" className={location.pathname === "/about" ? "active" : ""}>Giới thiệu</Link></li>
                        <li><Link to="/category" className={location.pathname.startsWith("/category") ? "active" : ""}>Sản phẩm</Link></li>
                    </ul>
                </nav>

                <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* Search Icon */}
                    <div className="search-container" ref={searchRef} style={{ position: 'relative' }}>
                        <button
                            className="search-toggle"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                color: '#333',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            <i className="bi bi-search"></i>
                        </button>
                        {isSearchOpen && (
                            <div className="search-dropdown" style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '400px',
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                                zIndex: 1000,
                                padding: '20px',
                                marginTop: '10px'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <h5 style={{ 
                                        color: '#333', 
                                        margin: 0, 
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        TÌM KIẾM
                                    </h5>
                                </div>
                                <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #b3d4fc',
                                            padding: '10px 14px',
                                            fontSize: '15px',
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            marginBottom: '12px'
                                        }}
                                        autoFocus
                                        onFocus={() => searchTerm && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    {showSuggestions && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 54,
                                            left: 0,
                                            right: 0,
                                            background: '#fff',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                            zIndex: 2000,
                                            maxHeight: 260,
                                            overflowY: 'auto',
                                            border: '1px solid #e3eaf5',
                                            padding: '0',
                                        }}>
                                            {suggestions.length === 0 ? (
                                                <div style={{ padding: '16px', color: '#888', textAlign: 'center' }}>Không tìm thấy sản phẩm</div>
                                            ) : suggestions.map(product => (
                                                <div
                                                    key={product._id}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #f2f2f2' }}
                                                    onMouseDown={() => { navigate(`/products/${product._id}`); setShowSuggestions(false); setIsSearchOpen(false); setSearchTerm(''); }}
                                                >
                                                    <img src={product.images?.[0]?.url || product.images?.[0] || '/assets/img/no-image.png'} alt={product.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, background: '#f5f5f5' }} />
                                                    <span style={{ fontSize: 15, color: '#222' }}>{product.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        type="submit"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '24px',
                                            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                            border: 'none',
                                            margin: '0 auto',
                                            fontSize: '22px',
                                            color: '#fff',
                                            boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
                                            transition: 'background 0.2s',
                                            marginTop: '0',
                                            marginBottom: '0',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <i className="bi bi-search"></i>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                    {/* Cart Icon with Badge */}
                    <Link to="/cart" className="cart-icon" style={{ position: 'relative', color: '#333', textDecoration: 'none' }}>
                        <i className="bi bi-cart3" style={{ fontSize: '1.5rem' }}></i>
                        {cartItemsCount > 0 && (
                            <span className="cart-count" style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#dc3545',
                                color: 'white',
                                fontSize: '0.8rem',
                                padding: '2px 6px',
                                borderRadius: '50%',
                                minWidth: '18px',
                                textAlign: 'center'
                            }}>
                                {cartItemsCount}
                            </span>
                        )}
                    </Link>
                    {/* User Icon/Dropdown hoặc Auth Buttons giữ nguyên vị trí */}
                    {user ? (
                        <div className="user-dropdown">
                            <button
                                className="user-button"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <i className="bi bi-person-circle"></i>
                                <span>{user.name}</span>
                            </button>
                            {isUserMenuOpen && (
                                <div className="user-menu">
                                    <Link to="/profile" className="menu-item">
                                        <i className="bi bi-person"></i>
                                        Thông tin cá nhân
                                    </Link>
                                    <button onClick={handleLogout} className="menu-item">
                                        <i className="bi bi-box-arrow-right"></i>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn">Đăng nhập</Link>
                            <Link to="/register" className="register-btn">Đăng ký</Link>
                        </div>
                    )}
                    <i className="bi bi-list mobile-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}></i>
                </div>
            </div>
        </header>
    );
};

export default Header; 