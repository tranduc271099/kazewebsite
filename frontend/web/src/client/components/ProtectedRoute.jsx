import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // Nếu có token, cho phép truy cập component con
    // Nếu không, chuyển hướng về trang đăng nhập
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 