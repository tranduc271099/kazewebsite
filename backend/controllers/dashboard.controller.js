const Bill = require('../models/Bill/BillUser');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Thống kê tổng doanh thu
exports.getRevenueStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                ngay_tao: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const revenueStatusFilter = { trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } };

        // Tổng doanh thu
        const totalRevenue = await Bill.aggregate([
            { $match: { ...dateFilter, ...revenueStatusFilter } },
            { $group: { _id: null, total: { $sum: '$tong_tien' } } }
        ]);

        // Doanh thu theo ngày
        const revenueByDay = await Bill.aggregate([
            { $match: { ...dateFilter, ...revenueStatusFilter } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$ngay_tao" } },
                    revenue: { $sum: '$tong_tien' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Số đơn hàng theo trạng thái
        const orderStatusStats = await Bill.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$trang_thai',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$tong_tien' }
                }
            }
        ]);

        res.json({
            totalRevenue: totalRevenue[0]?.total || 0,
            revenueByDay,
            orderStatusStats
        });
    } catch (error) {
        console.error('Lỗi thống kê doanh thu:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Top user mua hàng nhiều nhất
exports.getTopUsers = async (req, res) => {
    try {
        const { startDate, endDate, limit = 5 } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                ngay_tao: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const topUsers = await Bill.aggregate([
            { $match: { ...dateFilter, trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
            {
                $group: {
                    _id: '$nguoi_dung_id',
                    totalSpent: { $sum: '$tong_tien' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$tong_tien' }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    userId: '$_id',
                    userName: '$userInfo.name',
                    userEmail: '$userInfo.email',
                    totalSpent: 1,
                    orderCount: 1,
                    averageOrderValue: 1
                }
            }
        ]);

        res.json(topUsers);
    } catch (error) {
        console.error('Lỗi thống kê top users:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Top sản phẩm bán chạy nhất
exports.getTopProducts = async (req, res) => {
    try {
        const { startDate, endDate, limit = 5 } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                ngay_tao: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const topProducts = await Bill.aggregate([
            { $match: { ...dateFilter, trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
            { $unwind: '$danh_sach_san_pham' },
            {
                $group: {
                    _id: '$danh_sach_san_pham.san_pham_id',
                    productName: { $first: '$danh_sach_san_pham.ten_san_pham' },
                    totalQuantity: { $sum: '$danh_sach_san_pham.so_luong' },
                    totalRevenue: { $sum: { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] } },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    productId: '$_id',
                    productName: 1,
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: 1,
                    productImage: { $arrayElemAt: ['$productInfo.images', 0] }
                }
            }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error('Lỗi thống kê top products:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Top order mới nhất
exports.getLatestOrders = async (req, res) => {
    try {
        const { startDate, endDate, limit = 5 } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                ngay_tao: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const latestOrders = await Bill.aggregate([
            { $match: dateFilter },
            { $sort: { ngay_tao: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'nguoi_dung_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    orderId: '$_id',
                    userName: '$userInfo.name',
                    userEmail: '$userInfo.email',
                    totalAmount: '$tong_tien',
                    status: '$trang_thai',
                    paymentMethod: '$phuong_thuc_thanh_toan',
                    paymentStatus: '$thanh_toan',
                    createdAt: '$ngay_tao',
                    productCount: { $size: '$danh_sach_san_pham' }
                }
            }
        ]);

        res.json(latestOrders);
    } catch (error) {
        console.error('Lỗi thống kê latest orders:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Thống kê tổng hợp cho dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                ngay_tao: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Thống kê tổng quan
        const overviewStats = await Bill.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                                '$tong_tien',
                                0
                            ]
                        }
                    },
                    completedOrders: {
                        $sum: {
                            $cond: [
                                { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                                1,
                                0
                            ]
                        }
                    },
                    completedRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                                '$tong_tien',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Thống kê theo ngày (7 ngày gần nhất nếu không có filter)
        let dailyStatsFilter = dateFilter;
        if (!startDate && !endDate) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dailyStatsFilter = { ngay_tao: { $gte: sevenDaysAgo } };
        }

        const dailyStats = await Bill.aggregate([
            { $match: dailyStatsFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$ngay_tao" } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$tong_tien' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top 3 user mua hàng nhiều nhất
        const topUsers = await Bill.aggregate([
            { $match: { ...dateFilter, trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
            {
                $group: {
                    _id: '$nguoi_dung_id',
                    totalSpent: { $sum: '$tong_tien' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    userName: '$userInfo.name',
                    totalSpent: 1,
                    orderCount: 1
                }
            }
        ]);

        // Top 3 sản phẩm bán chạy nhất
        const topProducts = await Bill.aggregate([
            { $match: { ...dateFilter, trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
            { $unwind: '$danh_sach_san_pham' },
            {
                $group: {
                    _id: '$danh_sach_san_pham.san_pham_id',
                    productName: { $first: '$danh_sach_san_pham.ten_san_pham' },
                    totalQuantity: { $sum: '$danh_sach_san_pham.so_luong' },
                    totalRevenue: { $sum: { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }
        ]);

        // Top 3 order mới nhất
        const latestOrders = await Bill.aggregate([
            { $match: dateFilter },
            { $sort: { ngay_tao: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'nguoi_dung_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    userName: '$userInfo.name',
                    totalAmount: '$tong_tien',
                    status: '$trang_thai',
                    createdAt: '$ngay_tao'
                }
            }
        ]);

        res.json({
            overview: overviewStats[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                completedOrders: 0,
                completedRevenue: 0
            },
            dailyStats,
            topUsers,
            topProducts,
            latestOrders
        });
    } catch (error) {
        console.error('Lỗi thống kê dashboard:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}; 