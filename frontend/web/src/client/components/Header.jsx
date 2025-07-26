import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { getCartItemsCount } = useContext(CartContext);
    const cartItemsCount = getCartItemsCount();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

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
                        <li><Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Liên hệ</Link></li>
                    </ul>
                </nav>

                <div className="user-actions">
                    {/* Cart Icon with Badge */}
                    <Link to="/cart" className="cart-icon" style={{ position: 'relative', marginRight: '20px', color: '#333', textDecoration: 'none' }}>
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