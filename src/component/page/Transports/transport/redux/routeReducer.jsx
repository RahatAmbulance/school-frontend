import {DELETE_ROUTE_FAILURE, DELETE_ROUTE_REQUEST, DELETE_ROUTE_SUCCESS} from './routeActions';

const initialState = {
    routes: [],
    loading: false,
    error: null
};

const routeReducer = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_ROUTE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case DELETE_ROUTE_SUCCESS:
            return {
                ...state,
                loading: false,
                routes: state.routes.filter(route => route.id !== action.payload),
                error: null
            };
        case DELETE_ROUTE_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};

export default routeReducer; 