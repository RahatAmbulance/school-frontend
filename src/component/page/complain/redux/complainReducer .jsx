import {
    CREATE_COMPLAINT_FAILURE,
    CREATE_COMPLAINT_REQUEST,
    CREATE_COMPLAINT_SUCCESS,
    FETCH_COMPLAINTS_FAILURE,
    FETCH_COMPLAINTS_REQUEST,
    FETCH_COMPLAINTS_SUCCESS,
    UPDATE_COMPLAINT_FAILURE,
    UPDATE_COMPLAINT_REQUEST,
    UPDATE_COMPLAINT_SUCCESS,
} from './complainActions';

const initialState = {
    complaints: [],  // Initializing as an empty array
    status: 'idle',  // idle | loading | succeeded | failed
    error: null,
};


const complainReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_COMPLAINTS_REQUEST:
            return {...state, status: 'loading'};
        case FETCH_COMPLAINTS_SUCCESS:
            return {...state, status: 'succeeded', complaints: action.payload};
        case FETCH_COMPLAINTS_FAILURE:
            return {...state, status: 'failed', error: action.payload};

        case CREATE_COMPLAINT_REQUEST:
            return {...state, status: 'loading'};
        case CREATE_COMPLAINT_SUCCESS:
            return {...state, status: 'succeeded', complaints: [...state.complaints, action.payload]};
        case CREATE_COMPLAINT_FAILURE:
            return {...state, status: 'failed', error: action.payload};

        case UPDATE_COMPLAINT_REQUEST:
            return {...state, status: 'loading'};
        case UPDATE_COMPLAINT_SUCCESS:
            return {
                ...state,
                status: 'succeeded',
                complaints: state.complaints.map((ticket) =>
                    ticket.id === action.payload.id ? action.payload : ticket
                ),
            };
        case UPDATE_COMPLAINT_FAILURE:
            return {...state, status: 'failed', error: action.payload};

        default:
            return state;
    }
};

export default complainReducer;
