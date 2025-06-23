import React, { useState } from 'react';
<<<<<<< HEAD
import { useUser } from '../UserContext';

const Navbar = () => {
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const { user } = useUser();
    let avatar = '/assets/img/no-avatar.png';
    if (user?.image) {
        if (user.image.startsWith('http')) avatar = user.image;
        else if (user.image.startsWith('/')) avatar = `http://localhost:5000${user.image}`;
        else avatar = `http://localhost:5000/${user.image}`;
    }
=======

const Navbar = () => {
    const [showUserDropdown, setShowUserDropdown] = useState(false);
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        window.location.pathname = '/login';
    };

    // Lấy tên admin từ localStorage user
    let userName = 'Tên người dùng';
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const userObj = JSON.parse(userStr);
            userName = userObj.name || userObj.email || userName;
        } catch { }
    } else {
        userName = localStorage.getItem('userName') || userName;
    }

    return (
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
            {/* Left navbar links */}
            <ul className="navbar-nav">
                <li className="nav-item">
                    <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars"></i></a>
                </li>
                <li className="nav-item d-none d-sm-inline-block">
                    <a href="index3.html" className="nav-link">Home</a>
                </li>
                <li className="nav-item d-none d-sm-inline-block">
                    <a href="#" className="nav-link">Contact</a>
                </li>
            </ul>
            {/* SEARCH FORM */}
            <form className="form-inline ml-3">
                <div className="input-group input-group-sm">
                    <input className="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search" />
                    <div className="input-group-append">
                        <button className="btn btn-navbar" type="submit">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </form>
            {/* Right navbar links */}
            <ul className="navbar-nav ml-auto">
                {/* Messages Dropdown Menu */}
                <li className="nav-item dropdown">
                    <a className="nav-link" data-toggle="dropdown" href="#">
                        <i className="far fa-comments"></i>
                        <span className="badge badge-danger navbar-badge">3</span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                        <a href="#" className="dropdown-item">
                            {/* Message Start */}
                            <div className="media">
<<<<<<< HEAD
                                <img src={avatar} alt="User Avatar" className="img-size-50 mr-3 img-circle" />
=======
                                <img src="/assets/img/no-avatar.png" alt="User Avatar" className="img-size-50 mr-3 img-circle" />
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab
                                <div className="media-body">
                                    <h3 className="dropdown-item-title">
                                        Brad Diesel
                                        <span className="float-right text-sm text-danger"><i className="fas fa-star"></i></span>
                                    </h3>
                                    <p className="text-sm">Call me whenever you can...</p>
                                    <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                </div>
                            </div>
                            {/* Message End */}
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <div className="media">
<<<<<<< HEAD
                                <img src={avatar} alt="User Avatar" className="img-size-50 img-circle mr-3" />
=======
                                <img src="/assets/img/no-avatar.png" alt="User Avatar" className="img-size-50 img-circle mr-3" />
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab
                                <div className="media-body">
                                    <h3 className="dropdown-item-title">
                                        John Pierce
                                        <span className="float-right text-sm text-muted"><i className="fas fa-star"></i></span>
                                    </h3>
                                    <p className="text-sm">I got your message bro</p>
                                    <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                </div>
                            </div>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <div className="media">
<<<<<<< HEAD
                                <img src={avatar} alt="User Avatar" className="img-size-50 img-circle mr-3" />
=======
                                <img src="/assets/img/no-avatar.png" alt="User Avatar" className="img-size-50 img-circle mr-3" />
>>>>>>> 313c79ce51788a47d4d84ff060914c438e00c8ab
                                <div className="media-body">
                                    <h3 className="dropdown-item-title">
                                        Nora Silvester
                                        <span className="float-right text-sm text-warning"><i className="fas fa-star"></i></span>
                                    </h3>
                                    <p className="text-sm">The subject goes here</p>
                                    <p className="text-sm text-muted"><i className="far fa-clock mr-1"></i> 4 Hours Ago</p>
                                </div>
                            </div>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
                    </div>
                </li>
                {/* Notifications Dropdown Menu */}
                <li className="nav-item dropdown">
                    <a className="nav-link" data-toggle="dropdown" href="#">
                        <i className="far fa-bell"></i>
                        <span className="badge badge-warning navbar-badge">15</span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                        <span className="dropdown-item dropdown-header">15 Notifications</span>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <i className="fas fa-envelope mr-2"></i> 4 new messages
                            <span className="float-right text-muted text-sm">3 mins</span>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <i className="fas fa-users mr-2"></i> 8 friend requests
                            <span className="float-right text-muted text-sm">12 hours</span>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item">
                            <i className="fas fa-file mr-2"></i> 3 new reports
                            <span className="float-right text-muted text-sm">2 days</span>
                        </a>
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
                    </div>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-widget="fullscreen" href="#" role="button">
                        <i className="fas fa-expand-arrows-alt"></i>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button">
                        <i className="fas fa-th-large"></i>
                    </a>
                </li>
                {/* User Dropdown */}
                <li className="nav-item dropdown">
                    <button
                        className="btn nav-link dropdown-toggle"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                        <i className="far fa-user"></i>
                        <span className="ml-2">{userName}</span>
                    </button>
                    {showUserDropdown && (
                        <div className="dropdown-menu dropdown-menu-right show">
                            <button className="dropdown-item" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                            </button>
                        </div>
                    )}

                </li>
            </ul>
        </nav>
    );
};

export default Navbar; 