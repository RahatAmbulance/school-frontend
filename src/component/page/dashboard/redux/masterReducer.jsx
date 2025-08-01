// src/reducers/masterReducer.js

import {FETCH_ALL_DATA_FAILURE, FETCH_ALL_DATA_REQUEST, FETCH_ALL_DATA_SUCCESS} from "./actionTypes";

const initialState = {
    loading: false,
    data: {},
    error: null,
};

const masterReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ALL_DATA_REQUEST:
            return {...state, loading: true, error: null};
        case FETCH_ALL_DATA_SUCCESS:
            return {...state, loading: false, data: action.payload};
        case FETCH_ALL_DATA_FAILURE:
            return {...state, loading: false, error: action.payload};
        default:
            return state;
    }
};

export default masterReducer;
