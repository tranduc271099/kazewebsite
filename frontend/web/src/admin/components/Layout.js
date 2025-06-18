import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

const Layout = () => {
    return (
        <div className="wrapper">
            <Navbar />
            <Sidebar />

            <div className="content-wrapper">
                <div className="content">
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout; 