const Product = require('../models/Product');

// Check stock availability for items before checkout
exports.checkStockAvailability = async (req, res) => {
    try {
        const { items } = req.body; // items: [{ id, color, size, quantity }]
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
        }

        const stockIssues = [];

        for (const item of items) {
            console.log(`🔍 Checking item:`, item);
            const product = await Product.findById(item.id);
            
            if (!product) {
                console.log(`❌ Product not found: ${item.id}`);
                stockIssues.push({
                    productId: item.id,
                    message: `Sản phẩm không tồn tại`,
                    item: item
                });
                continue;
            }

            console.log(`📦 Product found: ${product.name}, hasVariants: ${product.hasVariants}, variants count: ${product.variants?.length || 0}`);
            console.log(`🔍 Product isActive: ${product.isActive}`);

            if (!product.isActive && product.isActive !== "true") {
                stockIssues.push({
                    productId: item.id,
                    productName: product.name,
                    message: `Sản phẩm đã bị ẩn khỏi cửa hàng`,
                    item: item
                });
                continue;
            }

            // Kiểm tra biến thể (không phụ thuộc vào hasVariants field)
            if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                console.log(`🔍 Checking variants for product ${product.name}`);
                const variant = product.variants.find(v => 
                    v.attributes && 
                    v.attributes.color === item.color && 
                    v.attributes.size === item.size
                );

                console.log(`🎯 Looking for variant: color="${item.color}", size="${item.size}"`);
                console.log(`🎯 Found variant:`, variant);

                if (!variant) {
                    console.log(`❌ Variant not found for ${product.name} (${item.color} - ${item.size})`);
                    stockIssues.push({
                        productId: item.id,
                        productName: product.name,
                        message: `Biến thể sản phẩm (${item.color} - ${item.size}) không tồn tại`,
                        item: item
                    });
                    continue;
                }

                if (variant.stock < item.quantity) {
                    console.log(`❌ Stock issue found: Product ${product.name} (${item.color} - ${item.size}) - Stock: ${variant.stock}, Required: ${item.quantity}`);
                    stockIssues.push({
                        productId: item.id,
                        productName: product.name,
                        message: `Sản phẩm "${product.name}" (${item.color} - ${item.size}) không đủ hàng. Tồn kho: ${variant.stock}, Yêu cầu: ${item.quantity}`,
                        currentStock: variant.stock,
                        requestedQuantity: item.quantity,
                        item: item
                    });
                } else {
                    console.log(`✅ Stock OK: Product ${product.name} (${item.color} - ${item.size}) - Stock: ${variant.stock}, Required: ${item.quantity}`);
                }
            } else {
                // Kiểm tra tồn kho sản phẩm gốc
                if (product.stock < item.quantity) {
                    stockIssues.push({
                        productId: item.id,
                        productName: product.name,
                        message: `Sản phẩm "${product.name}" không đủ hàng. Tồn kho: ${product.stock}, Yêu cầu: ${item.quantity}`,
                        currentStock: product.stock,
                        requestedQuantity: item.quantity,
                        item: item
                    });
                }
            }
        }

        if (stockIssues.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Có sản phẩm không đủ hàng hoặc không khả dụng',
                stockIssues: stockIssues
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tất cả sản phẩm có đủ hàng'
        });

    } catch (error) {
        console.error('Error checking stock availability:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra tồn kho',
            error: error.message
        });
    }
};
