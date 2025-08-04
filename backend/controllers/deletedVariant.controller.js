const DeletedVariant = require('../models/DeletedVariant');

// Get deleted variants for a product
const getDeletedVariantsForProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const deletedVariants = await DeletedVariant.find({
            originalProductId: productId
        }).sort({ deletedAt: -1 });

        res.json({
            success: true,
            count: deletedVariants.length,
            deletedVariants: deletedVariants
        });
    } catch (error) {
        console.error('Error fetching deleted variants:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải thông tin biến thể đã xóa'
        });
    }
};

// Get all deleted variants (for admin)
const getAllDeletedVariants = async (req, res) => {
    try {
        const deletedVariants = await DeletedVariant.find()
            .populate('originalProductId', 'name')
            .sort({ deletedAt: -1 });

        res.json({
            success: true,
            count: deletedVariants.length,
            deletedVariants: deletedVariants
        });
    } catch (error) {
        console.error('Error fetching all deleted variants:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải danh sách biến thể đã xóa'
        });
    }
};

// Get deleted variant info for order display
const getDeletedVariantInfo = async (req, res) => {
    try {
        const { productId, color, size } = req.params;

        const deletedVariant = await DeletedVariant.findOne({
            originalProductId: productId,
            'variantData.attributes.color': color,
            'variantData.attributes.size': size
        });

        if (!deletedVariant) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin biến thể đã xóa'
            });
        }

        res.json({
            success: true,
            variantInfo: {
                color: deletedVariant.variantData.attributes.color,
                size: deletedVariant.variantData.attributes.size,
                price: deletedVariant.variantData.price,
                deletedAt: deletedVariant.deletedAt,
                hadOrders: deletedVariant.hadOrders,
                orderCount: deletedVariant.orderCount
            }
        });
    } catch (error) {
        console.error('Error fetching deleted variant info:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải thông tin biến thể đã xóa'
        });
    }
};

module.exports = {
    getDeletedVariantsForProduct,
    getAllDeletedVariants,
    getDeletedVariantInfo
};
