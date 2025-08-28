import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch {
        user = null;
    }

    // Nếu không có token, chuyển hướng về login
    if (!token) return <Navigate to="/login" replace />;

    // Nếu user bị khóa, xóa token và user, chuyển về login
    if (user && user.isLocked) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace state={{ locked: true }} />;
    }

    // Nếu hợp lệ, cho phép truy cập
    return <Outlet />;
};

export default ProtectedRoute;