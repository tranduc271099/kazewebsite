// Helper function để emit real-time events cho client khi admin thực hiện thay đổi
const notifyClientDataUpdate = (req, eventType, data) => {
    if (req.io) {
        // Emit tới tất cả clients (không chỉ admin)
        req.io.emit('admin_data_update', {
            type: eventType,
            data: data,
            timestamp: new Date(),
            adminUser: req.user?.name || req.user?.username || 'Admin'
        });

        // Log để debug
        console.log(`[REAL-TIME] Emitted ${eventType} event:`, data);
    }
};

// Specific event types
const EVENT_TYPES = {
    // Product events
    PRODUCT_CREATED: 'product_created',
    PRODUCT_UPDATED: 'product_updated',
    PRODUCT_DELETED: 'product_deleted',
    PRODUCT_STOCK_UPDATED: 'product_stock_updated',

    // Category events
    CATEGORY_CREATED: 'category_created',
    CATEGORY_UPDATED: 'category_updated',
    CATEGORY_DELETED: 'category_deleted',

    // User events
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    USER_STATUS_CHANGED: 'user_status_changed',

    // Order events
    ORDER_STATUS_UPDATED: 'order_status_updated',
    ORDER_CANCELLED: 'order_cancelled',

    // Voucher events
    VOUCHER_CREATED: 'voucher_created',
    VOUCHER_UPDATED: 'voucher_updated',
    VOUCHER_DELETED: 'voucher_deleted',
    VOUCHER_STATUS_CHANGED: 'voucher_status_changed',

    // Banner events
    BANNER_CREATED: 'banner_created',
    BANNER_UPDATED: 'banner_updated',
    BANNER_DELETED: 'banner_deleted',

    // General data refresh
    DATA_REFRESH_REQUIRED: 'data_refresh_required'
};

module.exports = {
    notifyClientDataUpdate,
    EVENT_TYPES
};
