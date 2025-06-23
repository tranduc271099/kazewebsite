import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../UserContext';

const Sidebar = () => {
    const { user } = useUser();
    const [dashboardOpen, setDashboardOpen] = useState(true);
    // Lấy avatar và tên từ context
    let avatar = "/assets/img/person/person-m-1.webp";
    if (user?.image) {
        if (user.image.startsWith("http")) {
            avatar = user.image;
        } else if (user.image.startsWith("/")) {
            avatar = `http://localhost:5000${user.image}`;
        } else {
            avatar = `http://localhost:5000/${user.image}`;
        }
    }
    const userName = user?.name || user?.email || 'Tên người dùng';
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4" style={{ height: '100vh', position: 'fixed', top: 0, left: 0, overflowY: 'auto', width: 250, zIndex: 1030 }}>
            {/* Brand Logo */}
            <NavLink to="/" className="brand-link">
                <span className="brand-text font-weight-light">AdminLTE 3</span>
            </NavLink>
            {/* Sidebar */}
            <div className="sidebar">
                {/* Sidebar user panel (optional) */}
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img src={avatar} className="img-circle elevation-2" alt="User Avatar" style={{ width: 40, height: 40 }} />
                    </div>
                    <div className="info">
                        <a href="#" className="d-block">Xin chào, {userName}</a>
                    </div>
                </div>
                {/* SidebarSearch Form */}
                <div className="form-inline">
                    <div className="input-group" data-widget="sidebar-search">
                        <input className="form-control form-control-sidebar" type="search" placeholder="Search" aria-label="Search" />
                        <div className="input-group-append">
                            <button className="btn btn-sidebar">
                                <i className="fas fa-search fa-fw"></i>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Sidebar Menu */}
                <nav className="mt-2">
                    {/* Menu sẽ được chuyển đầy đủ từ HTML gốc, có thể tách nhỏ hơn nếu cần */}
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        <li className={`nav-item ${dashboardOpen ? 'menu-open' : ''}`}>
                            <a
                                href="#"
                                className={`nav-link ${dashboardOpen ? 'active' : ''}`}
                                onClick={e => {
                                    e.preventDefault();
                                    setDashboardOpen(open => !open);
                                }}
                            >
                                <i className="nav-icon fas fa-tachometer-alt"></i>
                                <p>
                                    Dashboard
                                    <i className={`right fas ${dashboardOpen ? 'fa-angle-left' : 'fa-angle-down'}`}></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview" style={{ display: dashboardOpen ? 'block' : 'none' }}>
                                <li className="nav-item">
                                    <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Dashboard v1</p>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/dashboard/v2" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Dashboard v2</p>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/dashboard/v3" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Dashboard v3</p>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/dashboard/categories" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                        <i className="nav-icon fas fa-list"></i>
                                        <p>Quản lý danh mục</p>
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/dashboard/products" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                        <i className="nav-icon fas fa-box"></i>
                                        <p>Quản lý sản phẩm</p>
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="pages/widgets.html" className="nav-link">
                                <i className="nav-icon fas fa-th"></i>
                                <p>
                                    Widgets
                                    <span className="right badge badge-danger">New</span>
                                </p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-copy"></i>
                                <p>
                                    Layout Options
                                    <i className="fas fa-angle-left right"></i>
                                    <span className="badge badge-info right">6</span>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/layout/top-nav.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Top Navigation</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/top-nav-sidebar.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Top Navigation + Sidebar</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/boxed.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Boxed</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/fixed-sidebar.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Fixed Sidebar</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/fixed-sidebar-custom.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Fixed Sidebar <small>+ Custom Area</small></p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/fixed-topnav.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Fixed Navbar</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/fixed-footer.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Fixed Footer</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/layout/collapsed-sidebar.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Collapsed Sidebar</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-chart-pie"></i>
                                <p>
                                    Charts
                                    <i className="right fas fa-angle-left"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/charts/chartjs.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>ChartJS</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/charts/flot.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Flot</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/charts/inline.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Inline</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/charts/uplot.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>uPlot</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-tree"></i>
                                <p>
                                    UI Elements
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/UI/general.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>General</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/icons.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Icons</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/buttons.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Buttons</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/sliders.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Sliders</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/modals.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Modals & Alerts</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/navbar.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Navbar & Tabs</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/timeline.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Timeline</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/UI/ribbons.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Ribbons</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-edit"></i>
                                <p>
                                    Forms
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/forms/general.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>General Elements</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/forms/advanced.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Advanced Elements</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/forms/editors.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Editors</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/forms/validation.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Validation</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-table"></i>
                                <p>
                                    Tables
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/tables/simple.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Simple Tables</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/tables/data.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>DataTables</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/tables/jsgrid.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>jsGrid</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-header">EXAMPLES</li>
                        <li className="nav-item">
                            <a href="pages/calendar.html" className="nav-link">
                                <i className="nav-icon far fa-calendar-alt"></i>
                                <p>
                                    Calendar
                                    <span className="badge badge-info right">2</span>
                                </p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="pages/gallery.html" className="nav-link">
                                <i className="nav-icon far fa-image"></i>
                                <p>Gallery</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="pages/kanban.html" className="nav-link">
                                <i className="nav-icon fas fa-columns"></i>
                                <p>Kanban Board</p>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon far fa-envelope"></i>
                                <p>
                                    Mailbox
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/mailbox/mailbox.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Inbox</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/mailbox/compose.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Compose</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/mailbox/read-mail.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Read</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-book"></i>
                                <p>
                                    Pages
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/examples/invoice.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Invoice</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/profile.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Profile</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/e-commerce.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>E-commerce</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/projects.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Projects</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/project-add.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Project Add</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/project-edit.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Project Edit</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/project-detail.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Project Detail</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/contacts.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Contacts</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/faq.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>FAQ</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/contact-us.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Contact us</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-search"></i>
                                <p>
                                    Search
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/examples/search.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Search</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-exclamation-circle"></i>
                                <p>
                                    Miscellaneous
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="pages/examples/404.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>404 Error</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/500.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>500 Error</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="pages/examples/blank.html" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Blank Page</p>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-level-up-alt"></i>
                                <p>
                                    Multi Level
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Level 1</p>
                                    </a>
                                    <ul className="nav nav-treeview">
                                        <li className="nav-item">
                                            <a href="#" className="nav-link">
                                                <i className="far fa-circle nav-icon"></i>
                                                <p>Level 2</p>
                                            </a>
                                            <ul className="nav nav-treeview">
                                                <li className="nav-item">
                                                    <a href="#" className="nav-link">
                                                        <i className="far fa-circle nav-icon"></i>
                                                        <p>Level 3</p>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link">
                                <i className="nav-icon fas fa-tags"></i>
                                <p>
                                    Labels
                                    <i className="fas fa-angle-left right"></i>
                                </p>
                            </a>
                            <ul className="nav nav-treeview">
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Label 1</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Label 2</p>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a href="#" className="nav-link">
                                        <i className="far fa-circle nav-icon"></i>
                                        <p>Label 3</p>
                                    </a>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar; 