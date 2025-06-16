import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_ITEM, CLEAR_CART } from '../types';

const initialState = {
    items: [],
    total: 0
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_TO_CART:
            const existingItem = state.items.find(item => item.product._id === action.payload.product._id);

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.product._id === action.payload.product._id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                    total: state.total + (action.payload.product.price * action.payload.quantity)
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, action.payload],
                    total: state.total + (action.payload.product.price * action.payload.quantity)
                };
            }

        case REMOVE_FROM_CART:
            const itemToRemove = state.items.find(item => item.product._id === action.payload);
            return {
                ...state,
                items: state.items.filter(item => item.product._id !== action.payload),
                total: state.total - (itemToRemove.product.price * itemToRemove.quantity)
            };

        case UPDATE_CART_ITEM:
            const updatedItems = state.items.map(item => {
                if (item.product._id === action.payload.productId) {
                    const quantityDiff = action.payload.quantity - item.quantity;
                    return {
                        ...item,
                        quantity: action.payload.quantity
                    };
                }
                return item;
            });

            const newTotal = updatedItems.reduce((total, item) =>
                total + (item.product.price * item.quantity), 0);

            return {
                ...state,
                items: updatedItems,
                total: newTotal
            };

        case CLEAR_CART:
            return initialState;

        default:
            return state;
    }
};

export default cartReducer; 