const Bill = require('../models/Bill/BillUser');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Thống kê tổng doanh thu và lãi
exports.getRevenueStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Bao gồm toàn bộ ngày kết thúc

            dateFilter = {
                ngay_tao: {
                    $gte: start,
                    $lte: end
                }
            };
        }

        const revenueStatusFilter = { trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } };

        // Tính tổng doanh thu và lãi thực tế (dựa trên giá nhập)
        const revenueAndProfit = await Bill.aggregate([
            { $match: { ...dateFilter, ...revenueStatusFilter } },
            { $unwind: '$danh_sach_san_pham' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'danh_sach_san_pham.san_pham_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    revenue: { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] },
                    actualCostPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$productInfo', null] },
                                    { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] }
                                ]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        matchingVariant: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: { $ifNull: ['$productInfo.variants', []] },
                                                        cond: {
                                                            $and: [
                                                                { $eq: ['$$this.attributes.color', '$danh_sach_san_pham.color'] },
                                                                { $eq: ['$$this.attributes.size', '$danh_sach_san_pham.size'] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ['$$matchingVariant', null] },
                                            then: { $ifNull: ['$$matchingVariant.costPrice', '$productInfo.costPrice'] },
                                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    actualProfit: {
                        $cond: {
                            if: { $gt: ['$actualCostPrice', 0] },
                            then: {
                                $multiply: [
                                    { $subtract: ['$danh_sach_san_pham.gia', '$actualCostPrice'] },
                                    '$danh_sach_san_pham.so_luong'
                                ]
                            },
                            else: 0 // Không tính lãi nếu không có giá nhập
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$revenue' },
                    totalProfit: { $sum: '$actualProfit' },
                    itemsWithCostPrice: {
                        $sum: {
                            $cond: [{ $gt: ['$actualCostPrice', 0] }, 1, 0]
                        }
                    },
                    totalItems: { $sum: 1 }
                }
            }
        ]);

        const totalRevenueAmount = revenueAndProfit[0]?.totalRevenue || 0;
        const totalProfitAmount = revenueAndProfit[0]?.totalProfit || 0;
        const actualProfitMargin = totalRevenueAmount > 0 ? (totalProfitAmount / totalRevenueAmount) : 0;

        // Doanh thu và lãi theo ngày (tính theo giá nhập thực tế)
        const revenueByDay = await Bill.aggregate([
            { $match: { ...dateFilter, ...revenueStatusFilter } },
            { $unwind: '$danh_sach_san_pham' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'danh_sach_san_pham.san_pham_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    revenue: { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] },
                    actualCostPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$productInfo', null] },
                                    { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] }
                                ]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        matchingVariant: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: { $ifNull: ['$productInfo.variants', []] },
                                                        cond: {
                                                            $and: [
                                                                { $eq: ['$$this.attributes.color', '$danh_sach_san_pham.color'] },
                                                                { $eq: ['$$this.attributes.size', '$danh_sach_san_pham.size'] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ['$$matchingVariant', null] },
                                            then: { $ifNull: ['$$matchingVariant.costPrice', '$productInfo.costPrice'] },
                                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    actualProfit: {
                        $cond: {
                            if: { $gt: ['$actualCostPrice', 0] },
                            then: {
                                $multiply: [
                                    { $subtract: ['$danh_sach_san_pham.gia', '$actualCostPrice'] },
                                    '$danh_sach_san_pham.so_luong'
                                ]
                            },
                            else: 0 // Không tính lãi nếu không có giá nhập
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$ngay_tao" } },
                    revenue: { $sum: '$revenue' },
                    profit: { $sum: '$actualProfit' },
                    orderCount: { $addToSet: '$_id' }
                }
            },
            { $sort: { _id: 1 } },
            {
                $addFields: {
                    orderCount: { $size: '$orderCount' }
                }
            }
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
            totalRevenue: totalRevenueAmount,
            totalProfit: totalProfitAmount,
            profitMargin: actualProfitMargin,
            revenueByDay,
            orderStatusStats,
            profitCalculationInfo: {
                itemsWithCostPrice: revenueAndProfit[0]?.itemsWithCostPrice || 0,
                totalItems: revenueAndProfit[0]?.totalItems || 0,
                usingActualCostPrice: true
            }
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
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Bao gồm toàn bộ ngày kết thúc

            dateFilter = {
                ngay_tao: {
                    $gte: start,
                    $lte: end
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
            { $limit: 3 }, // Luôn lấy top 3 người dùng
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: '$_id',
                    userName: { $ifNull: ['$userInfo.name', 'Ẩn danh'] },
                    userEmail: { $ifNull: ['$userInfo.email', 'Không có email'] },
                    userPhone: { $ifNull: ['$userInfo.phone', 'Không có SĐT'] },
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
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Bao gồm toàn bộ ngày kết thúc

            dateFilter = {
                ngay_tao: {
                    $gte: start,
                    $lte: end
                }
            };
        }

        const topProducts = await Bill.aggregate([
            { $match: { ...dateFilter, trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
            { $unwind: '$danh_sach_san_pham' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'danh_sach_san_pham.san_pham_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    revenue: { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] },
                    actualCostPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$productInfo', null] },
                                    { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] }
                                ]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        matchingVariant: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: { $ifNull: ['$productInfo.variants', []] },
                                                        cond: {
                                                            $and: [
                                                                { $eq: ['$$this.attributes.color', '$danh_sach_san_pham.color'] },
                                                                { $eq: ['$$this.attributes.size', '$danh_sach_san_pham.size'] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ['$$matchingVariant', null] },
                                            then: { $ifNull: ['$$matchingVariant.costPrice', '$productInfo.costPrice'] },
                                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    actualProfit: {
                        $cond: {
                            if: { $gt: ['$actualCostPrice', 0] },
                            then: {
                                $multiply: [
                                    { $subtract: ['$danh_sach_san_pham.gia', '$actualCostPrice'] },
                                    '$danh_sach_san_pham.so_luong'
                                ]
                            },
                            else: 0 // Không tính lãi nếu không có giá nhập
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$danh_sach_san_pham.san_pham_id',
                    productName: { $first: '$danh_sach_san_pham.ten_san_pham' },
                    totalQuantity: { $sum: '$danh_sach_san_pham.so_luong' },
                    totalRevenue: { $sum: '$revenue' },
                    totalProfit: { $sum: '$actualProfit' },
                    orderCount: { $sum: 1 },
                    productInfo: { $first: '$productInfo' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }, // Luôn lấy top 3 sản phẩm
            {
                $project: {
                    productId: '$_id',
                    productName: 1,
                    totalQuantity: 1,
                    totalRevenue: 1,
                    estimatedProfit: '$totalProfit', // Sử dụng lãi thực tế đã tính
                    orderCount: 1,
                    productImage: { $arrayElemAt: ['$productInfo.images', 0] },
                    stock: {
                        $cond: {
                            if: { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] },
                            then: { $sum: '$productInfo.variants.stock' },
                            else: '$productInfo.stock'
                        }
                    },
                    attributes: '$productInfo.attributes',
                    variants: '$productInfo.variants'
                }
            }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error('Lỗi thống kê top products:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy đơn hàng mới nhất
exports.getLatestOrders = async (req, res) => {
    try {
        const { startDate, endDate, limit = 5 } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Bao gồm toàn bộ ngày kết thúc

            dateFilter = {
                ngay_tao: {
                    $gte: start,
                    $lte: end
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
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Bao gồm toàn bộ ngày kết thúc

            dateFilter = {
                ngay_tao: {
                    $gte: start,
                    $lte: end
                }
            };
        }

        // Đếm tổng số tài khoản
        const totalUsers = await User.countDocuments();

        // Thống kê tổng quan với lãi thực tế
        const overviewStats = await Bill.aggregate([
            { $match: dateFilter },
            { $unwind: '$danh_sach_san_pham' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'danh_sach_san_pham.san_pham_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    revenue: {
                        $cond: [
                            { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                            { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] },
                            0
                        ]
                    },
                    actualCostPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$productInfo', null] },
                                    { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] }
                                ]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        matchingVariant: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: { $ifNull: ['$productInfo.variants', []] },
                                                        cond: {
                                                            $and: [
                                                                { $eq: ['$$this.attributes.color', '$danh_sach_san_pham.color'] },
                                                                { $eq: ['$$this.attributes.size', '$danh_sach_san_pham.size'] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ['$$matchingVariant', null] },
                                            then: { $ifNull: ['$$matchingVariant.costPrice', '$productInfo.costPrice'] },
                                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    actualProfit: {
                        $cond: [
                            { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                            {
                                $cond: {
                                    if: { $gt: ['$actualCostPrice', 0] },
                                    then: {
                                        $multiply: [
                                            { $subtract: ['$danh_sach_san_pham.gia', '$actualCostPrice'] },
                                            '$danh_sach_san_pham.so_luong'
                                        ]
                                    },
                                    else: 0 // Không tính lãi nếu không có giá nhập
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $addToSet: '$_id' },
                    totalRevenue: { $sum: '$revenue' },
                    totalProfit: { $sum: '$actualProfit' },
                    completedOrders: {
                        $addToSet: {
                            $cond: [
                                { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                                '$_id',
                                null
                            ]
                        }
                    },
                    completedRevenue: { $sum: '$revenue' },
                    completedProfit: { $sum: '$actualProfit' }
                }
            },
            {
                $addFields: {
                    totalOrders: { $size: '$totalOrders' },
                    completedOrders: {
                        $size: {
                            $filter: {
                                input: '$completedOrders',
                                cond: { $ne: ['$$this', null] }
                            }
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
            { $unwind: '$danh_sach_san_pham' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'danh_sach_san_pham.san_pham_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    revenue: {
                        $cond: [
                            { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                            { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] },
                            0
                        ]
                    },
                    actualCostPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$productInfo', null] },
                                    { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] }
                                ]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        matchingVariant: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: { $ifNull: ['$productInfo.variants', []] },
                                                        cond: {
                                                            $and: [
                                                                { $eq: ['$$this.attributes.color', '$danh_sach_san_pham.color'] },
                                                                { $eq: ['$$this.attributes.size', '$danh_sach_san_pham.size'] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ['$$matchingVariant', null] },
                                            then: { $ifNull: ['$$matchingVariant.costPrice', '$productInfo.costPrice'] },
                                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    actualProfit: {
                        $cond: [
                            { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                            {
                                $cond: {
                                    if: { $gt: ['$actualCostPrice', 0] },
                                    then: {
                                        $multiply: [
                                            { $subtract: ['$danh_sach_san_pham.gia', '$actualCostPrice'] },
                                            '$danh_sach_san_pham.so_luong'
                                        ]
                                    },
                                    else: 0 // Không tính lãi nếu không có giá nhập
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$ngay_tao" } },
                    orders: { $addToSet: '$_id' },
                    revenue: { $sum: '$revenue' },
                    profit: { $sum: '$actualProfit' },
                    completedOrders: {
                        $addToSet: {
                            $cond: [
                                { $in: ['$trang_thai', ['đã giao hàng', 'đã nhận hàng', 'hoàn thành']] },
                                '$_id',
                                null
                            ]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } },
            {
                $addFields: {
                    orders: { $size: '$orders' },
                    completedOrders: {
                        $size: {
                            $filter: {
                                input: '$completedOrders',
                                cond: { $ne: ['$$this', null] }
                            }
                        }
                    }
                }
            }
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
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userName: { $ifNull: ['$userInfo.name', 'Ẩn danh'] },
                    userPhone: { $ifNull: ['$userInfo.phone', 'Không có SĐT'] },
                    totalSpent: 1,
                    orderCount: 1
                }
            }
        ]);

        // Top 3 sản phẩm bán chạy nhất với lãi thực tế
        const topProducts = await Bill.aggregate([
            { $match: { ...dateFilter, trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
            { $unwind: '$danh_sach_san_pham' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'danh_sach_san_pham.san_pham_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    revenue: { $multiply: ['$danh_sach_san_pham.gia', '$danh_sach_san_pham.so_luong'] },
                    actualCostPrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ['$productInfo', null] },
                                    { $gt: [{ $size: { $ifNull: ['$productInfo.variants', []] } }, 0] }
                                ]
                            },
                            then: {
                                $let: {
                                    vars: {
                                        matchingVariant: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: { $ifNull: ['$productInfo.variants', []] },
                                                        cond: {
                                                            $and: [
                                                                { $eq: ['$$this.attributes.color', '$danh_sach_san_pham.color'] },
                                                                { $eq: ['$$this.attributes.size', '$danh_sach_san_pham.size'] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: {
                                        $cond: {
                                            if: { $ne: ['$$matchingVariant', null] },
                                            then: { $ifNull: ['$$matchingVariant.costPrice', '$productInfo.costPrice'] },
                                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                                        }
                                    }
                                }
                            },
                            else: { $ifNull: ['$productInfo.costPrice', 0] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    actualProfit: {
                        $cond: {
                            if: { $gt: ['$actualCostPrice', 0] },
                            then: {
                                $multiply: [
                                    { $subtract: ['$danh_sach_san_pham.gia', '$actualCostPrice'] },
                                    '$danh_sach_san_pham.so_luong'
                                ]
                            },
                            else: 0 // Không tính lãi nếu không có giá nhập
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$danh_sach_san_pham.san_pham_id',
                    productName: { $first: '$danh_sach_san_pham.ten_san_pham' },
                    totalQuantity: { $sum: '$danh_sach_san_pham.so_luong' },
                    totalRevenue: { $sum: '$revenue' },
                    estimatedProfit: { $sum: '$actualProfit' } // Sử dụng lãi thực tế
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 3 }
        ]);

        // Debug: đếm tổng số đơn hàng
        const totalBills = await Bill.countDocuments(dateFilter);
        console.log('Total bills in database:', totalBills);

        // Top 5 order mới nhất - phiên bản đơn giản để test
        let latestOrders = [];
        try {
            latestOrders = await Bill.aggregate([
                { $match: dateFilter },
                { $sort: { ngay_tao: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'nguoi_dung_id',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        orderId: '$_id',
                        userName: { $ifNull: ['$userInfo.name', 'Ẩn danh'] },
                        userPhone: { $ifNull: ['$userInfo.phone', '---'] },
                        totalAmount: '$tong_tien',
                        status: '$trang_thai',
                        createdAt: '$ngay_tao',
                        paymentMethod: '$phuong_thuc_thanh_toan',
                        shippingFee: '$phi_van_chuyen',
                        dia_chi_giao_hang: '$dia_chi_giao_hang',
                        ghi_chu: '$ghi_chu',
                        danh_sach_san_pham: '$danh_sach_san_pham',
                        ly_do_huy: '$ly_do_huy'
                    }
                }
            ]);
        } catch (error) {
            console.error('Error in latestOrders aggregation:', error);
            // Fallback: lấy đơn giản không có lookup
            latestOrders = await Bill.find(dateFilter)
                .sort({ ngay_tao: -1 })
                .limit(5)
                .lean()
                .then(bills => bills.map(bill => ({
                    orderId: bill._id,
                    userName: 'Ẩn danh',
                    userPhone: '---',
                    totalAmount: bill.tong_tien,
                    status: bill.trang_thai,
                    createdAt: bill.ngay_tao,
                    paymentMethod: bill.phuong_thuc_thanh_toan,
                    shippingFee: bill.phi_van_chuyen,
                    dia_chi_giao_hang: bill.dia_chi_giao_hang,
                    ghi_chu: bill.ghi_chu,
                    danh_sach_san_pham: bill.danh_sach_san_pham,
                    ly_do_huy: bill.ly_do_huy
                })));
        }

        console.log('Latest orders found:', latestOrders.length);
        console.log('Latest orders data:', latestOrders);

        res.json({
            overview: overviewStats[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                totalProfit: 0,
                completedOrders: 0,
                completedRevenue: 0,
                completedProfit: 0
            },
            totalUsers, // Thêm totalUsers vào response
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