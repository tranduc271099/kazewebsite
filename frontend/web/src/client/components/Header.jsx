import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
                        <li><Link to="/category" className={location.pathname === "/category" ? "active" : ""}>Danh mục</Link></li>
                        <li><Link to="/cart" className={location.pathname === "/cart" ? "active" : ""}>Giỏ hàng</Link></li>
                        <li><Link to="/checkout" className={location.pathname === "/checkout" ? "active" : ""}>Thanh toán</Link></li>
                        <li><Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Liên hệ</Link></li>
                    </ul>
                </nav>

                <div className="user-actions">
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