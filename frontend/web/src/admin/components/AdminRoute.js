import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../client/context/UserContext';

const AdminRoute = () => {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default AdminRoute; 