import {
    CREATE_PICKUP_AUTH_FAILURE,
    CREATE_PICKUP_AUTH_REQUEST,
    CREATE_PICKUP_AUTH_SUCCESS,
    DELETE_PICKUP_AUTH_FAILURE,
    DELETE_PICKUP_AUTH_REQUEST,
    DELETE_PICKUP_AUTH_SUCCESS,
    FETCH_PICKUP_AUTHS_FAILURE,
    FETCH_PICKUP_AUTHS_REQUEST,
    FETCH_PICKUP_AUTHS_SUCCESS,
    UPDATE_PICKUP_AUTH_FAILURE,
    UPDATE_PICKUP_AUTH_REQUEST,
    UPDATE_PICKUP_AUTH_SUCCESS
} from './PickupAction';

const initialState = {
    pickupAuthorizations: [],
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    fetchLoading: false,
    createError: null,
    updateError: null,
    deleteError: null,
    fetchError: null,
};

const pickupReducer = (state = initialState, action) => {
    switch (action.type) {
        // Create Cases
        case CREATE_PICKUP_AUTH_REQUEST:
            return {
                ...state,
                createLoading: true,
                createError: null
            };
        case CREATE_PICKUP_AUTH_SUCCESS:
            return {
                ...state,
                createLoading: false,
                pickupAuthorizations: [action.payload, ...state.pickupAuthorizations],
                createError: null
            };
        case CREATE_PICKUP_AUTH_FAILURE:
            return {
                ...state,
                createLoading: false,
                createError: action.payload
            };

        // Update Cases
        case UPDATE_PICKUP_AUTH_REQUEST:
            return {
                ...state,
                updateLoading: true,
                updateError: null
            };
        case UPDATE_PICKUP_AUTH_SUCCESS:
            return {
                ...state,
                updateLoading: false,
                pickupAuthorizations: state.pickupAuthorizations.map(auth =>
                    auth.id === action.payload.id ? action.payload : auth
                ),
                updateError: null
            };
        case UPDATE_PICKUP_AUTH_FAILURE:
            return {
                ...state,
                updateLoading: false,
                updateError: action.payload
            };

        // Delete Cases
        case DELETE_PICKUP_AUTH_REQUEST:
            return {
                ...state,
                deleteLoading: true,
                deleteError: null
            };
        case DELETE_PICKUP_AUTH_SUCCESS:
            return {
                ...state,
                deleteLoading: false,
                pickupAuthorizations: state.pickupAuthorizations.filter(
                    auth => auth.id !== action.payload
                ),
                deleteError: null
            };
        case DELETE_PICKUP_AUTH_FAILURE:
            return {
                ...state,
                deleteLoading: false,
                deleteError: action.payload
            };

        // Fetch Cases
        case FETCH_PICKUP_AUTHS_REQUEST:
            return {
                ...state,
                fetchLoading: true,
                fetchError: null
            };
        case FETCH_PICKUP_AUTHS_SUCCESS:
            return {
                ...state,
                fetchLoading: false,
                pickupAuthorizations: action.payload,
                fetchError: null
            };
        case FETCH_PICKUP_AUTHS_FAILURE:
            return {
                ...state,
                fetchLoading: false,
                fetchError: action.payload
            };

        default:
            return state;
    }
};

export default pickupReducer;