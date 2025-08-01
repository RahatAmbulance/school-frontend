// src/redux/reducer.js
import {LOGOUT_USER, SET_USER, TOGGLE_LOGIN_MODAL} from './actions';

const initialState = {
    isLoginModalOpen: false,
    user: null,
};

const HomeReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_LOGIN_MODAL:
            return {
                ...state,
                isLoginModalOpen: action.payload,
            };
        case SET_USER:
            return {
                ...state,
                user: action.payload,
            };
        case LOGOUT_USER:
            return {
                ...state,
                user: null,
            };
        default:
            return state;
    }
};

export default HomeReducer;
