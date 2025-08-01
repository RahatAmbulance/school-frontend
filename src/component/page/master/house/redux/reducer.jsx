// src/features/house/reducer.js
import {
    ADD_HOUSE_SUCCESS,
    DELETE_HOUSE_SUCCESS,
    FETCH_HOUSES_FAILURE,
    FETCH_HOUSES_REQUEST,
    FETCH_HOUSES_SUCCESS,
    UPDATE_HOUSE_SUCCESS
} from './actionTypes';

const initialState = {
    houses: [],
    status: 'idle',
    error: null,
};

const houseReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_HOUSES_REQUEST:
            return {
                ...state,
                status: 'loading',
            };
        case FETCH_HOUSES_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                houses: action.payload,
            };
        case FETCH_HOUSES_FAILURE:
            return {
                ...state,
                status: 'failed',
                error: action.payload,
            };
        case ADD_HOUSE_SUCCESS:
            return {
                ...state,
                houses: [...state.houses, action.payload],
            };
        case UPDATE_HOUSE_SUCCESS:
            return {
                ...state,
                houses: state.houses.map(house =>
                    house.id === action.payload.id ? action.payload : house
                ),
            };
        case DELETE_HOUSE_SUCCESS:
            return {
                ...state,
                houses: state.houses.filter(house => house.id !== action.payload),
            };
        default:
            return state;
    }
};

export default houseReducer;
