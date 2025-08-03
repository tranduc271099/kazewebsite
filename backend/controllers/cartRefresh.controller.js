const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Refresh cart với thông tin tồn kho mới nhất
exports.refreshCartStock = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Lấy giỏ hàng hiện tại
        let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock isActive');
        
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Cập nhật thông tin tồn kho cho từng item
        const updatedItems = [];
        
        for (let item of cart.items) {
            if (!item.productId) {
                continue; // Skip invalid items
            }

            const product = await Product.findById(item.productId._id);
            if (!product) {
                continue; // Skip if product doesn't exist
            }

            // Tìm variant tương ứng để lấy tồn kho mới nhất
            let currentStock = product.stock; // Default to main product stock
            
            if (product.hasVariants && product.variants && product.variants.length > 0) {
                const variant = product.variants.find(v => 
                    v.attributes.color === item.color && 
                    v.attributes.size === item.size
                );
                
                if (variant) {
                    currentStock = variant.stock;
                }
            }

            // Cập nhật thông tin item
            const updatedItem = {
                ...item.toObject(),
                stock: currentStock,
                isActive: product.isActive,
                productId: {
                    ...item.productId.toObject(),
                    stock: currentStock,
                    isActive: product.isActive
                }
            };

            updatedItems.push(updatedItem);
        }

        // Tạo response với thông tin đã cập nhật
        const refreshedCart = {
            ...cart.toObject(),
            items: updatedItems
        };

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật thông tin tồn kho',
            cart: refreshedCart
        });

    } catch (error) {
        console.error('Error refreshing cart stock:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông tin tồn kho',
            error: error.message
        });
    }
};
