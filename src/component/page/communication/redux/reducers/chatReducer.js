import {FETCH_ALL_DETAILS_FAILURE, FETCH_ALL_DETAILS_REQUEST, FETCH_ALL_DETAILS_SUCCESS} from '../actions/chatActions';

const initialState = {
    loading: false,
    allDetails: null,
    error: null
};

const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ALL_DETAILS_REQUEST:
            return {...state, loading: true, error: null};
        case FETCH_ALL_DETAILS_SUCCESS:
            return {...state, loading: false, allDetails: action.payload};
        case FETCH_ALL_DETAILS_FAILURE:
            return {...state, loading: false, error: action.payload};
        default:
            return state;
    }
};

export default chatReducer;