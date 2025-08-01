import {
    CREATE_NOTIFICATION_FAILURE,
    CREATE_NOTIFICATION_REQUEST,
    CREATE_NOTIFICATION_SUCCESS,
    FETCH_NOTIFICATIONS_FAILURE,
    FETCH_NOTIFICATIONS_REQUEST,
    FETCH_NOTIFICATIONS_SUCCESS
} from './notificationActions';

const initialState = {
    loading: false,
    notifications: [],
    error: null
};

const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_NOTIFICATION_REQUEST:
        case FETCH_NOTIFICATIONS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case CREATE_NOTIFICATION_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: [...state.notifications, action.payload],
                error: null
            };

        case FETCH_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: action.payload,
                error: null
            };

        case CREATE_NOTIFICATION_FAILURE:
        case FETCH_NOTIFICATIONS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        default:
            return state;
    }
};

export default notificationReducer; 