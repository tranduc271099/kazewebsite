const Bill = require('../models/Bill/BillUser');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Lấy top sản phẩm bán chạy nhất cho khách hàng
exports.getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 4 } = req.query; // Mặc định lấy top 4 sản phẩm

        const topProducts = await Bill.aggregate([
            { $match: { trang_thai: { $in: ['đã giao hàng', 'đã nhận hàng', 'hoàn thành'] } } },
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
            // Chỉ lấy những sản phẩm còn hoạt động (isActive = true)
            { $match: { 'productInfo.isActive': true } },
            {
                $group: {
                    _id: '$danh_sach_san_pham.san_pham_id',
                    productName: { $first: '$danh_sach_san_pham.ten_san_pham' },
                    totalQuantity: { $sum: '$danh_sach_san_pham.so_luong' },
                    productInfo: { $first: '$productInfo' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: '$productInfo.name',
                    price: '$productInfo.price',
                    images: '$productInfo.images',
                    attributes: '$productInfo.attributes',
                    variants: '$productInfo.variants',
                    rating: '$productInfo.rating',
                    ratingCount: '$productInfo.ratingCount',
                    soldQuantity: '$totalQuantity' // Số lượng đã bán
                }
            }
        ]);

        res.json(topProducts);
    } catch (error) {
        console.error('Lỗi khi lấy top sản phẩm bán chạy:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
