// schoolReducer.js
import {FETCH_SCHOOL_FAILURE, FETCH_SCHOOL_REQUEST, FETCH_SCHOOL_SUCCESS,} from './actionTypes';

const initialState = {
    loading: false,
    schoolData: null,
    error: null,
};

const schoolInfoReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_SCHOOL_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_SCHOOL_SUCCESS:
            return {
                ...state,
                loading: false,
                schoolData: action.payload,
            };
        case FETCH_SCHOOL_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default schoolInfoReducer;
