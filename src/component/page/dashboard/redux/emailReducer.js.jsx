import {
    FETCH_EMAIL_ADDRESSES_FAILURE,
    FETCH_EMAIL_ADDRESSES_REQUEST,
    FETCH_EMAIL_ADDRESSES_SUCCESS
} from "./actionTypes";


const initialState = {
    emailAddresses: [],
    loading: false,
    error: null
};

const emailReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_EMAIL_ADDRESSES_REQUEST:
            return {...state, loading: true, error: null};

        case FETCH_EMAIL_ADDRESSES_SUCCESS:
            return {...state, loading: false, emailAddresses: action.payload};

        case FETCH_EMAIL_ADDRESSES_FAILURE:
            return {...state, loading: false, error: action.payload};

        default:
            return state;
    }
};

export default emailReducer;
