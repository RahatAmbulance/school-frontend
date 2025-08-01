// src/redux/actions.js
export const TOGGLE_LOGIN_MODAL = 'TOGGLE_LOGIN_MODAL';
export const SET_USER = 'SET_USER';
export const LOGOUT_USER = 'LOGOUT_USER';

// Action to toggle login modal
export const toggleLoginModal = (isOpen) => ({
    type: TOGGLE_LOGIN_MODAL,
    payload: isOpen,
});

// Action to set user
export const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});

// Action to logout user
export const logoutUser = () => ({
    type: LOGOUT_USER,
});
