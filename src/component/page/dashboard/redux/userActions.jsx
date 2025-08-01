export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const fetchUserRequest = () => ({
    type: FETCH_USER_REQUEST,
});

export const fetchUserSuccess = (userData) => ({
    type: FETCH_USER_SUCCESS,
    payload: userData,
});

export const fetchUserFailure = (error) => ({
    type: FETCH_USER_FAILURE,
    payload: error,
});
