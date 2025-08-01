// roleReducer.js
import {ADD_ROLE, DELETE_ROLE, FETCH_ROLES_FAILURE, FETCH_ROLES_REQUEST, FETCH_ROLES_SUCCESS,} from './roleActions';

const initialState = {
    roles: [],
    loading: false,
    error: null,
};

const roleReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ROLES_REQUEST:
            return {...state, loading: true};
        case FETCH_ROLES_SUCCESS:
            return {...state, loading: false, roles: action.payload};
        case FETCH_ROLES_FAILURE:
            return {...state, loading: false, error: action.payload};
        case ADD_ROLE:
            return {...state, roles: [...state.roles, action.payload]};
        case DELETE_ROLE:
            return {
                ...state,
                roles: state.roles.filter(role => role.id !== action.payload),
            };
        default:
            return state;
    }
};

export default roleReducer;
