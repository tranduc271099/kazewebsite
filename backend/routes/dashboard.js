const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

// Tất cả routes đều yêu cầu authentication và role admin
router.use(auth);

// Middleware kiểm tra role admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới được phép truy cập!' });
    }
    next();
};

// Thống kê tổng hợp dashboard
router.get('/stats', requireAdmin, dashboardController.getDashboardStats);

// Thống kê doanh thu
router.get('/revenue', requireAdmin, dashboardController.getRevenueStats);

// Top user mua hàng nhiều nhất
router.get('/top-users', requireAdmin, dashboardController.getTopUsers);

// Top sản phẩm bán chạy nhất
router.get('/top-products', requireAdmin, dashboardController.getTopProducts);

// Top order mới nhất
router.get('/latest-orders', requireAdmin, dashboardController.getLatestOrders);

module.exports = router; 