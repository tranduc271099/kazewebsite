import React from 'react';
import { useLocation } from 'react-router-dom';
import useAdminDataSync from '../../hooks/useAdminDataSync';

// Component wrapper để handle real-time sync cho client pages
const ClientRealTimeSync = ({ children }) => {
    const location = useLocation();

    // Chỉ kích hoạt real-time sync cho client pages (không phải admin)
    const isClientPage = !location.pathname.startsWith('/admin') &&
        !location.pathname.startsWith('/dashboard');

    // Sử dụng hook để lắng nghe admin data updates
    // Gọi hook unconditionally nhưng chỉ kích hoạt khi cần
    useAdminDataSync(isClientPage);

    return children;
}; export default ClientRealTimeSync;
