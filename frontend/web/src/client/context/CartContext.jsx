import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { toast } from 'react-toastify'; // Import toast for notifications

const API_URL = 'http://localhost:5000/api'; // Define backend API URL

export const CartContext = createContext();

// Event system để thông báo khi tồn kho thay đổi
const stockUpdateEvent = new CustomEvent('stockUpdated');

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartNotifications, setCartNotifications] = useState([]);

    const getToken = () => {
        // Assuming your token is stored in localStorage as 'token' or 'userToken'
        return localStorage.getItem('token') || localStorage.getItem('userToken');
    };

    // Force refresh cart from server
    const refreshCart = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await axios.get(`${API_URL}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const formattedItems = response.data.items
                .filter(item => item.productId)
                .map(item => {
                    const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                        ? item.productId.variants.find(
                            v => v.attributes.color === item.color && v.attributes.size === item.size
                        )
                        : null;

                    console.log('DEBUG: Processing cart item', item.productId?.name, {
                        color: item.color,
                        size: item.size,
                        variantFound: !!variantInProduct,
                        variantPrice: variantInProduct?.price,
                        productPrice: item.productId?.price,
                        finalPrice: variantInProduct ? variantInProduct.price : item.productId?.price
                    });

                    return {
                        id: item.productId?._id,
                        name: item.productId?.name,
                        price: variantInProduct ? variantInProduct.price : item.productId?.price,
                        image: item.productId?.images?.[0] || '',
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        stock: variantInProduct ? variantInProduct.stock : item.productId?.stock,
                        availableColors: item.productId?.attributes?.colors || [],
                        availableSizes: item.productId?.attributes?.sizes || [],
                        variants: item.productId?.variants || [],
                        isActive: item.productId?.isActive,
                    };
                });
            console.log('DEBUG: Force refresh cart items:', formattedItems.map(item => ({
                name: item.name,
                isActive: item.isActive,
                stock: item.stock
            })));
            setCartItems(formattedItems);
            checkCartNotifications(formattedItems);
            toast.success('Đã làm mới giỏ hàng!');
        } catch (error) {
            console.error('Error refreshing cart:', error);
            toast.error('Không thể làm mới giỏ hàng.');
        }
    };

    // Refresh stock only (silent, no toast)
    const refreshStockOnly = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await axios.post(`${API_URL}/cart/refresh-stock`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const formattedItems = response.data.cart.items
                    .filter(item => item.productId)
                    .map(item => {
                        const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                            ? item.productId.variants.find(
                                v => v.attributes.color === item.color && v.attributes.size === item.size
                            )
                            : null;

                        return {
                            id: item.productId?._id,
                            name: item.productId?.name,
                            price: variantInProduct ? variantInProduct.price : item.productId?.price,
                            image: item.productId?.images?.[0] || '',
                            color: item.color,
                            size: item.size,
                            quantity: item.quantity,
                            stock: item.stock, // Use updated stock from response
                            availableColors: item.productId?.attributes?.colors || [],
                            availableSizes: item.productId?.attributes?.sizes || [],
                            variants: item.productId?.variants || [],
                            isActive: item.isActive, // Use updated isActive from response  
                        };
                    });
                
                console.log('🔄 Stock refreshed silently:', formattedItems.map(item => ({
                    name: item.name,
                    isActive: item.isActive,
                    stock: item.stock
                })));
                
                setCartItems(formattedItems);
                checkCartNotifications(formattedItems);
            }
        } catch (error) {
            console.error('Error refreshing stock:', error);
        }
    };

    // Hàm thông báo khi tồn kho thay đổi
    const notifyStockUpdate = (productId) => {
        const event = new CustomEvent('stockUpdated', {
            detail: { productId }
        });
        window.dispatchEvent(event);
    };

    // Hàm kiểm tra và tạo thông báo cho sản phẩm có vấn đề
    const checkCartNotifications = (items) => {
        const notifications = [];

        items.forEach(item => {
            // Kiểm tra sản phẩm bị ẩn
            if (item.isActive === false) {
                notifications.push({
                    type: 'product_hidden',
                    productId: item.id,
                    productName: item.name,
                    message: `⚠️ Sản phẩm "${item.name}" hiện đã bị ẩn và không thể mua. Vui lòng xóa khỏi giỏ hàng.`
                });
            }
            // Kiểm tra sản phẩm hết hàng
            else if (item.stock <= 0) {
                notifications.push({
                    type: 'out_of_stock',
                    productId: item.id,
                    productName: item.name,
                    message: `📦 Sản phẩm "${item.name}" hiện đã hết hàng.`
                });
            }
            // Kiểm tra số lượng trong giỏ vượt quá tồn kho
            else if (item.quantity > item.stock) {
                notifications.push({
                    type: 'exceed_stock',
                    productId: item.id,
                    productName: item.name,
                    message: `📊 Sản phẩm "${item.name}" chỉ còn ${item.stock} sản phẩm trong kho (bạn đang chọn ${item.quantity}).`
                });
            }
        });

        setCartNotifications(notifications);

        // Toast notification cho sản phẩm bị ẩn
        const hiddenProducts = notifications.filter(n => n.type === 'product_hidden');
        if (hiddenProducts.length > 0) {
            toast.warning(`Có ${hiddenProducts.length} sản phẩm trong giỏ hàng đã bị ẩn!`, {
                position: "top-right",
                autoClose: 5000,
            });
        }

        return notifications;
    };

    // Load cart items from backend on initial render
    useEffect(() => {
        const fetchCart = async () => {
            const token = getToken();
            if (!token) {
                setCartItems([]); // Clear cart if no token (not logged in)
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/cart`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Map backend cart items to the format expected by frontend (e.g., add image, size, color directly)
                // Assuming product details are populated by backend as `items.productId`
                const formattedItems = response.data.items
                    .filter(item => item.productId) // Bỏ item không có productId
                    .map(item => {
                        // Find the specific variant to get its stock
                        const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                            ? item.productId.variants.find(
                                v => v.attributes.color === item.color && v.attributes.size === item.size
                            )
                            : null;

                        return {
                            id: item.productId?._id,
                            name: item.productId?.name,
                            price: variantInProduct ? variantInProduct.price : item.productId?.price,
                            image: item.productId?.images?.[0] || '',
                            color: item.color,
                            size: item.size,
                            quantity: item.quantity,
                            stock: variantInProduct ? variantInProduct.stock : item.productId?.stock, // Use variant stock if found
                            availableColors: item.productId?.attributes?.colors || [],
                            availableSizes: item.productId?.attributes?.sizes || [],
                            variants: item.productId?.variants || [],
                            isActive: item.productId?.isActive, // Add isActive status
                        };
                    });
                console.log('DEBUG: Cart items with isActive:', formattedItems.map(item => ({
                    name: item.name,
                    isActive: item.isActive,
                    stock: item.stock,
                    price: item.price,
                    color: item.color,
                    size: item.size
                })));
                setCartItems(formattedItems);
                checkCartNotifications(formattedItems);
            } catch (error) {
                console.error('Lỗi khi tải giỏ hàng từ backend:', error);
                // Chỉ hiện toast nếu đã đăng nhập
                if (token) toast.error('Không thể tải giỏ hàng. Vui lòng thử lại.');
                setCartItems([]); // Clear cart on error
            }
        };
        const token = getToken();
        if (token) fetchCart();
        // eslint-disable-next-line
    }, []);

    // Remove the localStorage save effect as cart is now backend-managed
    // useEffect(() => {
    //     localStorage.setItem('cart', JSON.stringify(cartItems));
    // }, [cartItems]);

    const addToCart = async (item) => {
        const token = getToken();
        if (!token) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
            return;
        }

        try {
            // Chuẩn hóa giá trị
            const normalizedColor = (item.color || '').trim();
            const normalizedSize = (item.size || '').trim();
            const quantity = parseInt(item.quantity || 1);

            // Log để debug
            console.log('Adding to cart:', {
                id: item.id,
                quantity: quantity,
                color: normalizedColor,
                size: normalizedSize
            });

            const response = await axios.post(`${API_URL}/cart`, {
                productId: item.id,
                quantity: quantity, // Đảm bảo là số
                color: normalizedColor, // Đảm bảo không có khoảng trắng thừa
                size: normalizedSize, // Đảm bảo không có khoảng trắng thừa
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update cart items from the backend response
            const formattedItems = response.data.items
                .filter(item => item.productId) // Bỏ item không có productId
                .map(item => {
                    try {
                        // Find the specific variant to get its stock
                        const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                            ? item.productId.variants.find(
                                v => v.attributes && v.attributes.color === item.color && v.attributes.size === item.size
                            )
                            : null;

                        return {
                            id: item.productId._id,
                            name: item.productId.name || 'Sản phẩm',
                            // Ưu tiên sử dụng giá đã lưu trong giỏ hàng (priceAtTimeOfAddition)
                            price: item.priceAtTimeOfAddition !== undefined ? item.priceAtTimeOfAddition :
                                (variantInProduct ? variantInProduct.price : (item.productId.price || 0)),
                            image: (item.productId.images && item.productId.images.length > 0) ? item.productId.images[0] : '',
                            color: item.color || '',
                            size: item.size || '',
                            quantity: item.quantity || 1,
                            stock: variantInProduct ? variantInProduct.stock : (item.productId.stock || 0), // Use variant stock if found
                            availableColors: (item.productId.attributes && item.productId.attributes.colors) ? item.productId.attributes.colors : [],
                            availableSizes: (item.productId.attributes && item.productId.attributes.sizes) ? item.productId.attributes.sizes : [],
                            variants: Array.isArray(item.productId.variants) ? item.productId.variants : [],
                            isActive: item.productId.isActive !== undefined ? item.productId.isActive : true, // Add isActive status with default
                        };
                    } catch (err) {
                        console.error('Lỗi khi xử lý sản phẩm:', err, item);
                        // Return a default object for items that couldn't be processed
                        return {
                            id: item.productId ? item.productId._id : 'unknown',
                            name: item.productId ? item.productId.name : 'Sản phẩm không xác định',
                            price: 0,
                            image: '',
                            color: item.color || '',
                            size: item.size || '',
                            quantity: item.quantity || 1,
                            stock: 0,
                            availableColors: [],
                            availableSizes: [],
                            variants: [],
                            isActive: false
                        };
                    }
                });
            setCartItems(formattedItems);
            checkCartNotifications(formattedItems);
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');

            // Thông báo khi tồn kho thay đổi
            notifyStockUpdate(item.id);
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
        }
    };

    const removeFromCart = async (itemId, color, size) => {
        const token = getToken();
        if (!token) {
            toast.error('Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng.');
            return;
        }
        try {
            const response = await axios.delete(`${API_URL}/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { productId: itemId, color, size } // DELETE with body
            });

            const formattedItems = response.data.items
                .filter(item => item.productId) // Bỏ item không có productId
                .map(item => {
                    // Find the specific variant to get its stock
                    const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                        ? item.productId.variants.find(
                            v => v.attributes.color === item.color && v.attributes.size === item.size
                        )
                        : null;

                    return {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: variantInProduct ? variantInProduct.price : item.productId.price,
                        image: item.productId.images?.[0] || '',
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        stock: variantInProduct ? variantInProduct.stock : item.productId.stock, // Use variant stock if found
                        availableColors: item.productId.attributes?.colors || [],
                        availableSizes: item.productId.attributes?.sizes || [],
                        variants: item.productId.variants || [],
                        isActive: item.productId?.isActive, // Add isActive status
                    };
                });
            setCartItems(formattedItems);
            checkCartNotifications(formattedItems);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');

            // Thông báo khi tồn kho thay đổi
            notifyStockUpdate(itemId);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng.');
        }
    };

    const updateQuantity = async (itemId, color, size, quantity) => {
        const token = getToken();
        if (!token) {
            toast.error('Vui lòng đăng nhập để cập nhật số lượng.');
            return;
        }
        try {
            const response = await axios.put(`${API_URL}/cart`, {
                productId: itemId,
                color,
                size,
                quantity,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const formattedItems = response.data.items
                .filter(item => item.productId) // Bỏ item không có productId
                .map(item => {
                    // Find the specific variant to get its stock
                    const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                        ? item.productId.variants.find(
                            v => v.attributes.color === item.color && v.attributes.size === item.size
                        )
                        : null;

                    return {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: variantInProduct ? variantInProduct.price : item.productId.price,
                        image: item.productId.images?.[0] || '',
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        stock: variantInProduct ? variantInProduct.stock : item.productId.stock, // Use variant stock if found
                        availableColors: item.productId.attributes?.colors || [],
                        availableSizes: item.productId.attributes?.sizes || [],
                        variants: item.productId.variants || [],
                        isActive: item.productId?.isActive, // Add isActive status
                    };
                });
            setCartItems(formattedItems);
            checkCartNotifications(formattedItems);
            toast.success('Đã cập nhật số lượng sản phẩm!');

            // Thông báo khi tồn kho thay đổi
            notifyStockUpdate(itemId);
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Không thể cập nhật số lượng.');
        }
    };

    const clearCart = async () => {
        const token = getToken();
        if (!token) {
            toast.error('Vui lòng đăng nhập để làm trống giỏ hàng.');
            return;
        }
        try {
            // Lưu danh sách product IDs trước khi clear để thông báo
            const productIds = cartItems.map(item => item.id);

            await axios.delete(`${API_URL}/cart/clear`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCartItems([]);
            setCartNotifications([]);
            toast.success('Giỏ hàng đã được làm trống!');

            // Thông báo khi tồn kho thay đổi cho tất cả sản phẩm
            productIds.forEach(productId => {
                notifyStockUpdate(productId);
            });
        } catch (error) {
            // Nếu lỗi là "giỏ hàng không tồn tại", không hiện toast lỗi
            if (error.response?.data?.message !== 'Giỏ hàng không tồn tại') {
                console.error('Lỗi khi làm trống giỏ hàng:', error.response?.data?.message || error.message);
                toast.error(error.response?.data?.message || 'Không thể làm trống giỏ hàng.');
            } else {
                setCartItems([]); // Vẫn clear cart ở frontend
            }
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const updateCartItemAttributes = async (productId, oldColor, oldSize, newColor, newSize) => {
        const token = getToken();
        if (!token) {
            toast.error('Vui lòng đăng nhập để cập nhật thuộc tính sản phẩm.');
            return;
        }
        try {
            const response = await axios.put(`${API_URL}/cart/attributes`, {
                productId,
                oldColor,
                oldSize,
                newColor,
                newSize,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const formattedItems = response.data.items
                .filter(item => item.productId) // Bỏ item không có productId
                .map(item => {
                    // Find the specific variant to get its stock
                    const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                        ? item.productId.variants.find(
                            v => v.attributes.color === item.color && v.attributes.size === item.size
                        )
                        : null;

                    return {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: variantInProduct ? variantInProduct.price : item.productId.price,
                        image: item.productId.images?.[0] || '',
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        stock: variantInProduct ? variantInProduct.stock : item.productId.stock, // Use variant stock if found
                        availableColors: item.productId.attributes?.colors || [],
                        availableSizes: item.productId.attributes?.sizes || [],
                        variants: item.productId.variants || [],
                        isActive: item.productId?.isActive, // Add isActive status
                    };
                });
            setCartItems(formattedItems);
            checkCartNotifications(formattedItems);
            toast.success('Đã cập nhật thuộc tính sản phẩm!');

            // Thông báo khi tồn kho thay đổi
            notifyStockUpdate(productId);
        } catch (error) {
            console.error('Lỗi khi cập nhật thuộc tính sản phẩm:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Không thể cập nhật thuộc tính sản phẩm.');
        }
    };

    const removeItemsFromCart = async (items) => {
        const token = getToken();
        if (!token) return;
        for (const item of items) {
            try {
                await axios.delete(`${API_URL}/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { productId: item.id, color: item.color, size: item.size }
                });
            } catch (error) {
                // Có thể log lỗi nếu cần
            }
        }
        // Sau khi xóa, fetch lại giỏ hàng
        try {
            const response = await axios.get(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const formattedItems = response.data.items
                .filter(item => item.productId)
                .map(item => {
                    const variantInProduct = item.productId && Array.isArray(item.productId.variants)
                        ? item.productId.variants.find(
                            v => v.attributes.color === item.color && v.attributes.size === item.size
                        )
                        : null;
                    return {
                        id: item.productId?._id,
                        name: item.productId?.name,
                        price: variantInProduct ? variantInProduct.price : item.productId?.price,
                        image: item.productId?.images?.[0] || '',
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        stock: variantInProduct ? variantInProduct.stock : item.productId?.stock,
                        availableColors: item.productId?.attributes?.colors || [],
                        availableSizes: item.productId?.attributes?.sizes || [],
                        variants: item.productId?.variants || [],
                    };
                });
            setCartItems(formattedItems);

            // Thông báo khi tồn kho thay đổi cho tất cả sản phẩm đã xóa
            items.forEach(item => {
                notifyStockUpdate(item.id);
            });
        } catch (error) {
            setCartItems([]);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartNotifications,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartItemsCount,
                updateCartItemAttributes,
                removeItemsFromCart,
                notifyStockUpdate, // Add notifyStockUpdate to context
                checkCartNotifications, // Add checkCartNotifications to context
                refreshCart, // Add refreshCart to context
                refreshStockOnly, // Add silent stock refresh to context
            }}
        >
            {children}
        </CartContext.Provider>
    );
}; 