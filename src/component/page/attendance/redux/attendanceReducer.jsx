// src/redux/reducers/attendanceReducer.js
import {
    ADD_ATTENDANCE_FAILURE,
    ADD_ATTENDANCE_REQUEST,
    ADD_ATTENDANCE_SUCCESS,
    DELETE_ATTENDANCE_FAILURE,
    DELETE_ATTENDANCE_REQUEST,
    DELETE_ATTENDANCE_SUCCESS,
    FETCH_ATTENDANCE_FAILURE,
    FETCH_ATTENDANCE_REQUEST,
    FETCH_ATTENDANCE_SUCCESS,
    UPDATE_ATTENDANCE_FAILURE,
    UPDATE_ATTENDANCE_REQUEST,
    UPDATE_ATTENDANCE_SUCCESS
} from './attendanceActionTypes';

const initialState = {
    loading: false,
    attendanceList: [],
    error: null
};

const attendanceReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ATTENDANCE_REQUEST:
        case ADD_ATTENDANCE_REQUEST:
        case UPDATE_ATTENDANCE_REQUEST:
        case DELETE_ATTENDANCE_REQUEST:
            return {...state, loading: true};
        case FETCH_ATTENDANCE_SUCCESS:
            return {...state, loading: false, attendanceList: action.payload};
        case ADD_ATTENDANCE_SUCCESS:
            return {...state, loading: false, attendanceList: [...state.attendanceList, action.payload]};
        case UPDATE_ATTENDANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                attendanceList: state.attendanceList.map(item => item.id === action.payload.id ? action.payload : item)
            };
        case DELETE_ATTENDANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                attendanceList: state.attendanceList.filter(item => item.id !== action.payload)
            };
        case FETCH_ATTENDANCE_FAILURE:
        case ADD_ATTENDANCE_FAILURE:
        case UPDATE_ATTENDANCE_FAILURE:
        case DELETE_ATTENDANCE_FAILURE:
            return {...state, loading: false, error: action.payload};
        default:
            return state;
    }
};

export default attendanceReducer;
