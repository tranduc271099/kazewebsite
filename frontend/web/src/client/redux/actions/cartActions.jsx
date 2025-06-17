import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_ITEM, CLEAR_CART } from '../types';

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (product, quantity = 1) => ({
    type: ADD_TO_CART,
    payload: {
        product,
        quantity
    }
});

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId) => ({
    type: REMOVE_FROM_CART,
    payload: productId
});

// Cập nhật số lượng sản phẩm
export const updateCartItem = (productId, quantity) => ({
    type: UPDATE_CART_ITEM,
    payload: {
        productId,
        quantity
    }
});

// Xóa toàn bộ giỏ hàng
export const clearCart = () => ({
    type: CLEAR_CART
}); 