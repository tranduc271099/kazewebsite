const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Socket function to notify admin about cart changes - ĐÃ TẮT
const notifyAdminCartChange = (req, action, productName) => {
    // Function đã được tắt - không gửi thông báo admin nữa
    return;
    /*
    if (req.io) {
        req.io.emit('client_cart_update', {
            action: action,
            productName: productName,
            username: req.user.name || req.user.username || 'Khách hàng',
            timestamp: new Date()
        });
    }
    */
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from auth middleware
        let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock isActive');

        if (!cart) {
            // If no cart exists for the user, create an empty one
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        // Debug: Log cart items with isActive
        console.log('DEBUG: Cart items with isActive field:');
        cart.items.forEach(item => {
            if (item.productId) {
                console.log(`  Product: ${item.productId.name}, isActive: ${item.productId.isActive}`);
            }
        });

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
        // Đọc các trường từ request body, kiểm tra và chuẩn hóa
        let { productId, quantity = 1, color = '', size = '' } = req.body;

        console.log('Received add to cart request:', { productId, quantity, color, size });

        // Validate productId
        if (!productId) {
            return res.status(400).json({ message: 'Thiếu thông tin productId' });
        }

        // Ensure productId is a valid ObjectId string
        if (typeof productId === 'string' && !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Định dạng productId không hợp lệ' });
        }

        // Validate quantity
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({ message: 'Số lượng không hợp lệ' });
        }

        // Đảm bảo quantity là số
        quantity = Number(quantity);

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        console.log('Product found:', {
            productId: product._id,
            name: product.name,
            hasVariants: product.variants && product.variants.length > 0
        });

        // Kiểm tra nếu variants tồn tại và là mảng
        if (!Array.isArray(product.variants)) {
            console.error('Product variants is not an array:', product);
            return res.status(500).json({ message: 'Lỗi dữ liệu sản phẩm: variants không phải là mảng' });
        }

        // Chuẩn hóa color và size để đảm bảo so sánh chính xác
        const normalizedColor = (color || '').trim();
        const normalizedSize = (size || '').trim();

        // Log để debug
        console.log('Normalized attributes:', { normalizedColor, normalizedSize });

        // In ra tất cả biến thể của sản phẩm
        console.log('All product variants:', product.variants.map(v => ({
            attributes: v.attributes,
            stock: v.stock,
            price: v.price
        })));

        // Find the specific variant to check its stock - tìm chính xác phù hợp
        const variant = product.variants.find(
            v => v.attributes &&
                (v.attributes.color || '').trim() === normalizedColor &&
                (v.attributes.size || '').trim() === normalizedSize
        );

        if (!variant) {
            // Logging các variants để debug
            console.log('Cannot find variant. Available variants:', product.variants.map(v => ({
                color: v.attributes?.color,
                size: v.attributes?.size
            })));
            console.log('Requested color:', normalizedColor, 'Requested size:', normalizedSize);

            // Trả về lỗi 404 nếu không tìm thấy biến thể
            return res.status(404).json({
                message: 'Biến thể sản phẩm không tồn tại',
                requested: { color: normalizedColor, size: normalizedSize },
                available: product.variants.map(v => ({
                    color: v.attributes?.color,
                    size: v.attributes?.size
                }))
            });
        }

        // Log thông tin về biến thể tìm thấy
        console.log('Found variant:', {
            attributes: variant.attributes,
            stock: variant.stock,
            price: variant.price
        });

        // Find user's cart or create a new one
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Luôn ưu tiên lấy giá của biến thể đã chọn
        // Đảm bảo lấy đúng giá của biến thể được chọn, không fallback về giá chung
        const priceAtTimeOfAddition = variant.price !== undefined && variant.price !== null
            ? Number(variant.price)
            : (product.price !== undefined && product.price !== null ? Number(product.price) : 0);

        // Log giá cụ thể được sử dụng
        console.log('Price used for cart:', {
            variantPrice: variant.price,
            productPrice: product.price,
            finalPrice: priceAtTimeOfAddition
        });

        // Kiểm tra giá sản phẩm và xử lý
        if (isNaN(priceAtTimeOfAddition) || priceAtTimeOfAddition === undefined) {
            console.error('Price is invalid:', {
                variant,
                product,
                priceAtTimeOfAddition
            });
            return res.status(500).json({
                message: 'Lỗi khi xác định giá sản phẩm',
                details: {
                    variantPrice: variant.price,
                    productPrice: product.price
                }
            });
        }

        // Check if item already exists in cart with same color and size
        const existingItemIndex = cart.items.findIndex(
            item =>
                item.productId && // Kiểm tra null/undefined
                item.productId.toString() === product._id.toString() &&
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

            // Thêm logs để kiểm tra
            console.log('DEBUG - Cart add item:');
            console.log('productId:', productId);
            console.log('variant:', variant);
            console.log('variant.price:', variant.price);
            console.log('product.price:', product.price);
            console.log('priceAtTimeOfAddition:', priceAtTimeOfAddition);

            if (isNaN(priceAtTimeOfAddition) || priceAtTimeOfAddition === undefined) {
                console.error('Price is invalid:', {
                    variant,
                    product,
                    priceAtTimeOfAddition
                });
                return res.status(500).json({
                    message: 'Lỗi khi xác định giá sản phẩm',
                    details: {
                        variantPrice: variant.price,
                        productPrice: product.price
                    }
                });
            }

            // Đảm bảo tất cả các giá trị đều hợp lệ trước khi thêm vào giỏ hàng
            console.log('Adding to cart with product ID:', product._id);

            try {
                cart.items.push({
                    productId: product._id, // Sử dụng _id từ sản phẩm đã truy vấn
                    quantity,
                    color: color || '',  // Đảm bảo không bị undefined/null
                    size: size || '',    // Đảm bảo không bị undefined/null
                    priceAtTimeOfAddition // Sử dụng biến đã được định nghĩa ở trên
                });
            } catch (pushError) {
                console.error('Error pushing item to cart:', pushError);
                return res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', error: pushError.message });
            }
        }

        // KHÔNG giảm tồn kho khi thêm vào giỏ hàng - chỉ lưu vào giỏ hàng
        console.log('About to save cart with items:', JSON.stringify(cart.items, null, 2));

        try {
            // Kiểm tra một lần nữa xem productId có giá trị không
            cart.items.forEach((item, index) => {
                if (!item.productId) {
                    console.error(`Item at index ${index} has invalid productId:`, item);
                    // Sửa lỗi nếu có thể
                    item.productId = product._id;
                }
            });

            await cart.save();
        } catch (saveError) {
            console.error('Error saving cart:', saveError);
            return res.status(500).json({
                message: 'Lỗi khi lưu giỏ hàng',
                error: saveError.message
            });
        }

        // Populate product details for the added/updated item before sending response
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock isActive');

        // Notify admin about cart change (không giảm tồn kho nên không cần thông báo stock update)
        // notifyAdminCartChange(req, 'thêm vào giỏ hàng', product.name); // Đã tắt thông báo admin

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);

        // Ghi log chi tiết lỗi để debug
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation error for ${key}:`, error.errors[key]);
            });
        }

        // Cung cấp thông tin chi tiết hơn về lỗi
        let errorMessage = 'Lỗi khi thêm sản phẩm vào giỏ hàng';
        let errorDetail = {};
        let statusCode = 500;

        if (error.name === 'ValidationError') {
            // Mongoose validation error
            statusCode = 400;
            errorMessage = 'Dữ liệu không hợp lệ';
            errorDetail = Object.keys(error.errors).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});

            // Kiểm tra xem có lỗi productId không
            if (error.errors['items.0.productId']) {
                console.error('ProductId validation error detected:', {
                    productId: productId,
                    productObjectId: product?._id
                });
            }
        } else if (error.name === 'CastError') {
            // MongoDB cast error
            statusCode = 400;
            errorMessage = 'Lỗi định dạng dữ liệu';
            errorDetail = {
                field: error.path,
                value: error.value,
                kind: error.kind
            };
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(statusCode).json({
            message: errorMessage,
            details: errorDetail
        });
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
                item.productId &&
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

                // Cập nhật số lượng và đảm bảo giá cũng được cập nhật (nếu giá biến thể đã thay đổi)
                cart.items[itemIndex].quantity = quantity;

                // Đảm bảo giá luôn được cập nhật theo biến thể hiện tại
                const currentPrice = variant.price !== undefined && variant.price !== null
                    ? Number(variant.price)
                    : (product.price !== undefined && product.price !== null ? Number(product.price) : 0);

                // Chỉ cập nhật giá nếu giá mới khác giá cũ
                if (currentPrice !== cart.items[itemIndex].priceAtTimeOfAddition) {
                    console.log(`Updating price for cart item from ${cart.items[itemIndex].priceAtTimeOfAddition} to ${currentPrice}`);
                    cart.items[itemIndex].priceAtTimeOfAddition = currentPrice;
                }
            }

            // KHÔNG điều chỉnh tồn kho khi thay đổi số lượng trong giỏ hàng
            await cart.save();
            const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock isActive');

            // Notify admin about cart change
            const action = quantity <= 0 ? 'xóa khỏi giỏ hàng' : 'cập nhật số lượng';
            // notifyAdminCartChange(req, action, product.name); // Đã tắt thông báo admin

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
            item => item.productId && item.productId.toString() === productId && item.color === color && item.size === size
        );

        if (!itemToRemove) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            item => !(item.productId && item.productId.toString() === productId && item.color === color && item.size === size)
        );

        if (cart.items.length === initialLength) {
            // If no item was removed, it means the item was not found
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        // KHÔNG hoàn trả tồn kho khi xóa khỏi giỏ hàng
        await cart.save();
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock isActive');

        // Notify admin about cart change
        const product = await Product.findById(productId);
        if (product) {
            // notifyAdminCartChange(req, 'xóa khỏi giỏ hàng', product.name); // Đã tắt thông báo admin
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
        // notifyAdminCartChange(req, 'làm trống giỏ hàng', 'tất cả sản phẩm'); // Đã tắt thông báo admin

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
                item.productId &&
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
                item.productId &&
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
            // Đảm bảo giá là giá trị số hợp lệ
            oldItem.priceAtTimeOfAddition = newVariant.price !== undefined && newVariant.price !== null
                ? Number(newVariant.price)
                : (product.price !== undefined && product.price !== null ? Number(product.price) : 0);
            // No quantity change here, as this function is for attribute change.
        } else {
            // Replace the old item with the new variant details, keeping the quantity
            oldItem.color = newColor;
            oldItem.size = newSize;
            // Đảm bảo giá là giá trị số hợp lệ
            oldItem.priceAtTimeOfAddition = newVariant.price !== undefined && newVariant.price !== null
                ? Number(newVariant.price)
                : (product.price !== undefined && product.price !== null ? Number(product.price) : 0);

            console.log(`Updating price for variant change: ${oldItem.priceAtTimeOfAddition}`);

            // Lưu thông tin stock cho frontend tham khảo
            oldItem.stock = newVariant.stock; // Update stock for frontend reference
        }

        await cart.save();

        // Re-populate and send the updated cart
        const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name price images attributes variants stock isActive');
        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Lỗi khi cập nhật thuộc tính giỏ hàng:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thuộc tính sản phẩm trong giỏ hàng' });
    }
}; 