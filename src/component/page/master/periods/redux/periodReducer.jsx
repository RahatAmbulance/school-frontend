import {
    ADD_PERIOD,
    DELETE_PERIOD,
    FETCH_PERIODS_FAILURE,
    FETCH_PERIODS_REQUEST,
    FETCH_PERIODS_SUCCESS,
} from './periodActions';

const initialState = {
    periods: [],
    loading: false,
    error: null,
};

const periodReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_PERIODS_REQUEST:
            return {...state, loading: true};
        case FETCH_PERIODS_SUCCESS:
            return {...state, loading: false, periods: action.payload};
        case FETCH_PERIODS_FAILURE:
            return {...state, loading: false, error: action.payload};
        case ADD_PERIOD:
            return {...state, periods: [...state.periods, action.payload]};
        case DELETE_PERIOD:
            return {
                ...state,
                periods: state.periods.filter(period => period.id !== action.payload),
            };
        default:
            return state;
    }
};

export default periodReducer;
