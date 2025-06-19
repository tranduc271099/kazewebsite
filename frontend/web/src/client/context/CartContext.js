import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { toast } from 'react-toastify'; // Import toast for notifications

const API_URL = 'http://localhost:5000/api'; // Define backend API URL

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const getToken = () => {
        // Assuming your token is stored in localStorage as 'token' or 'userToken'
        return localStorage.getItem('token') || localStorage.getItem('userToken');
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
                const formattedItems = response.data.items.map(item => {
                    // Find the specific variant to get its stock
                    const variantInProduct = item.productId.variants.find(
                        v => v.attributes.color === item.color && v.attributes.size === item.size
                    );

                    return {
                        id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        image: item.productId.images?.[0] || '',
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        stock: variantInProduct ? variantInProduct.stock : item.productId.stock, // Use variant stock if found
                        availableColors: item.productId.attributes?.colors || [],
                        availableSizes: item.productId.attributes?.sizes || [],
                        variants: item.productId.variants || [],
                    };
                });
                setCartItems(formattedItems);
            } catch (error) {
                console.error('Lỗi khi tải giỏ hàng từ backend:', error);
                toast.error('Không thể tải giỏ hàng. Vui lòng thử lại.');
                setCartItems([]); // Clear cart on error
            }
        };
        fetchCart();
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
            const response = await axios.post(`${API_URL}/cart`, {
                productId: item.id,
                quantity: item.quantity || 1, // Default quantity to 1 if not provided
                color: item.color || '',
                size: item.size || '',
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update cart items from the backend response
            const formattedItems = response.data.items.map(cartItem => {
                // Find the specific variant to get its stock
                const variantInProduct = cartItem.productId.variants.find(
                    v => v.attributes.color === cartItem.color && v.attributes.size === cartItem.size
                );

                return {
                    id: cartItem.productId._id,
                    name: cartItem.productId.name,
                    price: cartItem.productId.price,
                    image: cartItem.productId.images?.[0] || '',
                    color: cartItem.color,
                    size: cartItem.size,
                    quantity: cartItem.quantity,
                    stock: variantInProduct ? variantInProduct.stock : cartItem.productId.stock, // Use variant stock if found
                    availableColors: cartItem.productId.attributes?.colors || [],
                    availableSizes: cartItem.productId.attributes?.sizes || [],
                    variants: cartItem.productId.variants || [],
                };
            });
            setCartItems(formattedItems);
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
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

            const formattedItems = response.data.items.map(cartItem => {
                // Find the specific variant to get its stock
                const variantInProduct = cartItem.productId.variants.find(
                    v => v.attributes.color === cartItem.color && v.attributes.size === cartItem.size
                );

                return {
                    id: cartItem.productId._id,
                    name: cartItem.productId.name,
                    price: cartItem.productId.price,
                    image: cartItem.productId.images?.[0] || '',
                    color: cartItem.color,
                    size: cartItem.size,
                    quantity: cartItem.quantity,
                    stock: variantInProduct ? variantInProduct.stock : cartItem.productId.stock, // Use variant stock if found
                    availableColors: cartItem.productId.attributes?.colors || [],
                    availableSizes: cartItem.productId.attributes?.sizes || [],
                    variants: cartItem.productId.variants || [],
                };
            });
            setCartItems(formattedItems);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
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

            const formattedItems = response.data.items.map(cartItem => {
                // Find the specific variant to get its stock
                const variantInProduct = cartItem.productId.variants.find(
                    v => v.attributes.color === cartItem.color && v.attributes.size === cartItem.size
                );

                return {
                    id: cartItem.productId._id,
                    name: cartItem.productId.name,
                    price: cartItem.productId.price,
                    image: cartItem.productId.images?.[0] || '',
                    color: cartItem.color,
                    size: cartItem.size,
                    quantity: cartItem.quantity,
                    stock: variantInProduct ? variantInProduct.stock : cartItem.productId.stock, // Use variant stock if found
                    availableColors: cartItem.productId.attributes?.colors || [],
                    availableSizes: cartItem.productId.attributes?.sizes || [],
                    variants: cartItem.productId.variants || [],
                };
            });
            setCartItems(formattedItems);
            toast.success('Đã cập nhật số lượng sản phẩm!');
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
            await axios.delete(`${API_URL}/cart/clear`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCartItems([]);
            toast.success('Giỏ hàng đã được làm trống!');
        } catch (error) {
            console.error('Lỗi khi làm trống giỏ hàng:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Không thể làm trống giỏ hàng.');
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
            const formattedItems = response.data.items.map(cartItem => {
                // Find the specific variant to get its stock
                const variantInProduct = cartItem.productId.variants.find(
                    v => v.attributes.color === cartItem.color && v.attributes.size === cartItem.size
                );

                return {
                    id: cartItem.productId._id,
                    name: cartItem.productId.name,
                    price: cartItem.productId.price,
                    image: cartItem.productId.images?.[0] || '',
                    color: cartItem.color,
                    size: cartItem.size,
                    quantity: cartItem.quantity,
                    stock: variantInProduct ? variantInProduct.stock : cartItem.productId.stock, // Use variant stock if found
                    availableColors: cartItem.productId.attributes?.colors || [],
                    availableSizes: cartItem.productId.attributes?.sizes || [],
                    variants: cartItem.productId.variants || [],
                };
            });
            setCartItems(formattedItems);
            toast.success('Đã cập nhật thuộc tính sản phẩm!');
        } catch (error) {
            console.error('Lỗi khi cập nhật thuộc tính sản phẩm:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Không thể cập nhật thuộc tính sản phẩm.');
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartItemsCount,
                updateCartItemAttributes,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
