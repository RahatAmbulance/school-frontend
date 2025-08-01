// religionReducer.js
import {
    ADD_RELIGION,
    DELETE_RELIGION,
    FETCH_RELIGIONS_FAILURE,
    FETCH_RELIGIONS_REQUEST,
    FETCH_RELIGIONS_SUCCESS,
    UPDATE_RELIGION,
} from './religionActions';

const initialState = {
    religions: [],
    loading: false,
    error: null,
};

const religionReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_RELIGIONS_REQUEST:
            return {...state, loading: true};
        case FETCH_RELIGIONS_SUCCESS:
            return {...state, loading: false, religions: action.payload};
        case FETCH_RELIGIONS_FAILURE:
            return {...state, loading: false, error: action.payload};
        case ADD_RELIGION:
            return {...state, religions: [...state.religions, action.payload]};
        case UPDATE_RELIGION:
            return {
                ...state,
                religions: state.religions.map((religion) =>
                    religion.id === action.payload.id ? action.payload : religion
                ),
            };
        case DELETE_RELIGION:
            return {
                ...state,
                religions: state.religions.filter((religion) => religion.id !== action.payload),
            };
        default:
            return state;
    }
};

export default religionReducer;
