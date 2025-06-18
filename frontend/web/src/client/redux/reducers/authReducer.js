import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT, REGISTER_SUCCESS, REGISTER_FAIL } from '../types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    user: null,
    error: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                user: action.payload.user,
                error: null
            };
        case LOGIN_FAIL:
        case REGISTER_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                user: null,
                error: action.payload
            };
        case LOGOUT:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                user: null,
                error: null
            };
        default:
            return state;
    }
};

export default authReducer; 