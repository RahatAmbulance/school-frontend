import {
    CREATE_STAFF_FAILURE,
    CREATE_STAFF_REQUEST,
    CREATE_STAFF_SUCCESS,
    DELETE_STAFF_FAILURE,
    DELETE_STAFF_REQUEST,
    DELETE_STAFF_SUCCESS,
    FETCH_STAFF_FAILURE,
    FETCH_STAFF_REQUEST,
    FETCH_STAFF_SUCCESS,
    UPDATE_STAFF_FAILURE,
    UPDATE_STAFF_REQUEST,
    UPDATE_STAFF_SUCCESS,
} from './staffActions';

const initialState = {
    staffList: [],
    loading: false,
    error: '',
};


const staffReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_STAFF_REQUEST:
        case FETCH_STAFF_REQUEST:
        case UPDATE_STAFF_REQUEST:
        case DELETE_STAFF_REQUEST:
            return {...state, loading: true};
        case CREATE_STAFF_SUCCESS:
            return {...state, loading: false, staffList: [...state.staffList, action.payload], error: ''};
        case FETCH_STAFF_SUCCESS:
            return {...state, loading: false, staffList: action.payload, error: ''};
        case UPDATE_STAFF_SUCCESS:
            return {
                ...state,
                loading: false,
                staffList: state.staffList.map((staff) => staff.id === action.payload.id ? action.payload : staff),
                error: '',
            };
        case DELETE_STAFF_SUCCESS:
            return {
                ...state,
                loading: false,
                staffList: state.staffList.filter((staff) => staff.id !== action.payload),
                error: '',
            };
        case CREATE_STAFF_FAILURE:
        case FETCH_STAFF_FAILURE:
        case UPDATE_STAFF_FAILURE:
        case DELETE_STAFF_FAILURE:
            return {...state, loading: false, error: action.payload};
        default:
            return state;
    }
};

export default staffReducer;
