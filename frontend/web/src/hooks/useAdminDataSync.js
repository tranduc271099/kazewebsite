import { useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

// Hook to handle real-time data updates from admin actions
const useAdminDataSync = (isEnabled = true) => {
    useEffect(() => {
        // Chỉ kích hoạt khi isEnabled = true
        if (!isEnabled) {
            return;
        }

        const socket = io('http://localhost:5000');

        // Listen for any admin data updates
        socket.on('admin_data_update', (data) => {
            console.log('[REAL-TIME] Admin data update received:', data);

            // Show appropriate notification based on event type
            const showNotification = (message, type = 'info') => {
                toast(message, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    type: type
                });
            };

            // Handle different event types
            switch (data.type) {
                case 'product_created':
                    showNotification(`🆕 Sản phẩm mới: ${data.data.productName}`, 'success');
                    break;

                case 'product_updated':
                    showNotification(`✏️ Cập nhật sản phẩm: ${data.data.productName}`, 'info');
                    break;

                case 'product_deleted':
                    showNotification(`🗑️ Đã xóa sản phẩm: ${data.data.productName}`, 'warning');
                    break;

                case 'category_created':
                    showNotification(`📁 Danh mục mới: ${data.data.categoryName}`, 'success');
                    break;

                case 'category_updated':
                    showNotification(`📝 Cập nhật danh mục: ${data.data.categoryName}`, 'info');
                    break;

                case 'category_deleted':
                    showNotification(`🗂️ Đã xóa danh mục: ${data.data.categoryName}`, 'warning');
                    break;

                case 'order_status_updated':
                    showNotification(`📦 Đơn hàng #${data.data.orderId}: ${data.data.oldStatus} → ${data.data.newStatus}`, 'info');
                    break;

                case 'voucher_created':
                    showNotification(`🎫 Voucher mới: ${data.data.voucherCode}`, 'success');
                    break;

                case 'voucher_updated':
                    showNotification(`🎟️ Cập nhật voucher: ${data.data.voucherCode}`, 'info');
                    break;

                case 'voucher_deleted':
                    showNotification(`🚫 Đã xóa voucher: ${data.data.voucherCode}`, 'warning');
                    break;

                case 'banner_created':
                    showNotification(`🖼️ Banner mới: ${data.data.bannerTitle}`, 'success');
                    break;

                case 'banner_updated':
                    showNotification(`🎨 Cập nhật banner: ${data.data.bannerTitle}`, 'info');
                    break;

                case 'banner_deleted':
                    showNotification(`�️ Đã xóa banner: ${data.data.bannerTitle}`, 'warning');
                    break;

                case 'user_created':
                    showNotification(`👤 Người dùng mới: ${data.data.userName}`, 'success');
                    break;

                case 'user_updated':
                    showNotification(`👥 Cập nhật người dùng: ${data.data.userName}`, 'info');
                    break;

                case 'user_deleted':
                    showNotification(`👋 Đã xóa người dùng: ${data.data.userName}`, 'warning');
                    break;

                case 'data_refresh_required':
                    showNotification(`🔄 Dữ liệu đã được cập nhật, đang làm mới...`, 'info');
                    break;

                default:
                    showNotification(`🔔 Có cập nhật từ admin: ${data.adminUser}`, 'info');
                    break;
            }

            // Auto-reload page after a short delay to allow user to read the notification
            setTimeout(() => {
                console.log('[REAL-TIME] Auto-refreshing page due to admin data update');
                window.location.reload();
            }, 2000); // 2 second delay
        });

        // Cleanup on unmount
        return () => {
            socket.off('admin_data_update');
            socket.disconnect();
        };
    }, [isEnabled]); // Add isEnabled to dependency array
};

export default useAdminDataSync;
