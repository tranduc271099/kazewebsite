const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Socket function to notify admin about cart changes
const notifyAdminCartChange = (req, action, productName) => {
    if (req.io) {
        req.io.emit('client_cart_update', {
            action: action,
            productName: productName,
            username: req.user.name || req.user.username || 'Khách hàng',
            timestamp: new Date()
        });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from auth middleware
        let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock');

        if (!cart) {
            // If no cart exists for the user, create an empty one
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
    }
};

// Add item to cart or update quantity if exists
exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity, color, size } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Find the specific variant to check its stock
        const variant = product.variants.find(
            v => v.attributes.color === color && v.attributes.size === size
        );

        if (!variant) {
            return res.status(404).json({ message: 'Biến thể sản phẩm không tồn tại' });
        }

        // Find user's cart or create a new one
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const priceAtTimeOfAddition = variant.price || product.price; // Capture variant price

        // Check if item already exists in cart with same color and size
        const existingItemIndex = cart.items.findIndex(
            item =>
                item.productId.toString() === productId &&
                item.color === color &&
                item.size === size
        );

        if (existingItemIndex > -1) {
            // Update quantity of existing item
            const existingItem = cart.items[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;

            // Kiểm tra: tồn kho hiện tại >= số lượng mới (không cộng thêm số lượng đã có trong giỏ)
            if (newQuantity > variant.stock) {
                return res.status(400).json({ message: `Số lượng vượt quá tồn kho! Tồn kho hiện tại: ${variant.stock}, Yêu cầu: ${newQuantity}` });
            }
            existingItem.quantity = newQuantity;
        } else {
            // Add new item to cart
            if (quantity > variant.stock) { // Check against variant stock
                return res.status(400).json({ message: `Số lượng vượt quá tồn kho của biến thể! Tồn kho hiện tại: ${variant.stock}` });
            }
            cart.items.push({ productId, quantity, color, size, priceAtTimeOfAddition: variant.price || product.price });
        }

        // KHÔNG giảm tồn kho khi thêm vào giỏ hàng - chỉ lưu vào giỏ hàng
        await cart.save();
        
        // Populate product details for the added/updated item before sending response
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock');

        // Notify admin about cart change (không giảm tồn kho nên không cần thông báo stock update)
        notifyAdminCartChange(req, 'thêm vào giỏ hàng', product.name);

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng' });
    }
};

// Update item quantity in cart
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, color, size, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Find the specific variant to check its stock
        const variant = product.variants.find(
            v => v.attributes.color === color && v.attributes.size === size
        );

        if (!variant) {
            return res.status(404).json({ message: 'Biến thể sản phẩm không tồn tại' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        const itemIndex = cart.items.findIndex(
            item =>
                item.productId.toString() === productId &&
                item.color === color &&
                item.size === size
        );

        if (itemIndex > -1) {
            const currentQuantity = cart.items[itemIndex].quantity;

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                // Cập nhật số lượng - chỉ kiểm tra tồn kho có đủ không
                if (quantity > variant.stock) {
                    return res.status(400).json({ message: `Số lượng vượt quá tồn kho! Tồn kho hiện tại: ${variant.stock}, Yêu cầu: ${quantity}` });
                }
                cart.items[itemIndex].quantity = quantity;
            }

            // KHÔNG điều chỉnh tồn kho khi thay đổi số lượng trong giỏ hàng
            await cart.save();
            const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock');
            
            // Notify admin about cart change
            const action = quantity <= 0 ? 'xóa khỏi giỏ hàng' : 'cập nhật số lượng';
            notifyAdminCartChange(req, action, product.name);
            
            res.status(200).json(updatedCart);
        } else {
            res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật số lượng sản phẩm trong giỏ hàng' });
    }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, color, size } = req.body; // Expecting productId, color, size to identify unique item

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Tìm item cần xóa để lấy số lượng
        const itemToRemove = cart.items.find(
            item => item.productId.toString() === productId && item.color === color && item.size === size
        );

        if (!itemToRemove) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            item => !(item.productId.toString() === productId && item.color === color && item.size === size)
        );

        if (cart.items.length === initialLength) {
            // If no item was removed, it means the item was not found
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        // KHÔNG hoàn trả tồn kho khi xóa khỏi giỏ hàng
        await cart.save();
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock');
        
        // Notify admin about cart change
        const product = await Product.findById(productId);
        if (product) {
            notifyAdminCartChange(req, 'xóa khỏi giỏ hàng', product.name);
        }
        
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng' });
    }
};

// Clear user's cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // KHÔNG hoàn trả tồn kho khi làm trống giỏ hàng
        cart.items = [];
        await cart.save();
        
        // Notify admin about cart change
        notifyAdminCartChange(req, 'làm trống giỏ hàng', 'tất cả sản phẩm');
        
        res.status(200).json({ message: 'Giỏ hàng đã được làm trống' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi làm trống giỏ hàng' });
    }
};

// Update item attributes (color, size) in cart
exports.updateCartItemAttributes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, oldColor, oldSize, newColor, newSize } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Find the product to get its variants and attributes
        const product = await Product.findById(productId).select('name price images attributes variants stock');
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        // Find the old item in the cart
        const oldItemIndex = cart.items.findIndex(
            item =>
                item.productId.toString() === productId &&
                item.color === oldColor &&
                item.size === oldSize
        );

        if (oldItemIndex === -1) {
            return res.status(404).json({ message: 'Sản phẩm cũ không tìm thấy trong giỏ hàng' });
        }

        const oldItem = cart.items[oldItemIndex];
        const quantityToMove = oldItem.quantity;

        // Find the new variant based on newColor and newSize
        const newVariant = product.variants.find(v =>
            v.attributes.color === newColor &&
            v.attributes.size === newSize
        );

        if (!newVariant) {
            return res.status(400).json({ message: 'Biến thể sản phẩm mới không hợp lệ.' });
        }

        if (newVariant.stock < quantityToMove) {
            return res.status(400).json({ message: `Số lượng yêu cầu cho biến thể mới (${quantityToMove}) vượt quá tồn kho (${newVariant.stock})` });
        }

        // Check if an item with the new attributes already exists in the cart
        const existingNewItemIndex = cart.items.findIndex(
            item =>
                item.productId.toString() === productId &&
                item.color === newColor &&
                item.size === newSize
        );

        if (existingNewItemIndex > -1 && existingNewItemIndex !== oldItemIndex) {
            // If the new variant already exists and is a different item, merge quantities
            const existingNewItem = cart.items[existingNewItemIndex];
            const combinedQuantity = existingNewItem.quantity + quantityToMove;

            if (combinedQuantity > newVariant.stock) {
                return res.status(400).json({ message: `Tổng số lượng cho biến thể mới (${combinedQuantity}) vượt quá tồn kho (${newVariant.stock})` });
            }

            existingNewItem.quantity = combinedQuantity;
            cart.items.splice(oldItemIndex, 1); // Remove the old item
        } else if (existingNewItemIndex === oldItemIndex) {
            // If the new attributes are the same as the old item (no change in attributes but maybe price/stock update)
            oldItem.color = newColor;
            oldItem.size = newSize;
            oldItem.priceAtTimeOfAddition = newVariant.price; // Update price to new variant's price
            // No quantity change here, as this function is for attribute change.
        } else {
            // Replace the old item with the new variant details, keeping the quantity
            oldItem.color = newColor;
            oldItem.size = newSize;
            oldItem.priceAtTimeOfAddition = newVariant.price;
            oldItem.stock = newVariant.stock; // Update stock for frontend reference
        }

        await cart.save();

        // Re-populate and send the updated cart
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock');
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Lỗi khi cập nhật thuộc tính giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thuộc tính sản phẩm trong giỏ hàng' });
    }
}; 