// src/store/reducers/vehicleReducer.js
import {
    ADD_VEHICLE_FAILURE,
    ADD_VEHICLE_REQUEST,
    ADD_VEHICLE_SUCCESS,
    DELETE_VEHICLE_FAILURE,
    DELETE_VEHICLE_REQUEST,
    DELETE_VEHICLE_SUCCESS,
    EDIT_VEHICLE_FAILURE,
    EDIT_VEHICLE_REQUEST,
    EDIT_VEHICLE_SUCCESS,
    FETCH_VEHICLES_FAILURE,
    FETCH_VEHICLES_REQUEST,
    FETCH_VEHICLES_SUCCESS,
} from './vehicleActions';

const initialState = {
    vehicles: [],
    loading: false,
    error: null,
};

const vehicleReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_VEHICLES_REQUEST:
        case ADD_VEHICLE_REQUEST:
        case EDIT_VEHICLE_REQUEST:
        case DELETE_VEHICLE_REQUEST:
            return {...state, loading: true, error: null};
        case FETCH_VEHICLES_SUCCESS:
            return {...state, loading: false, vehicles: action.payload};
        case ADD_VEHICLE_SUCCESS:
            return {...state, loading: false, vehicles: [...state.vehicles, action.payload]};
        case EDIT_VEHICLE_SUCCESS:
            return {
                ...state,
                loading: false,
                vehicles: state.vehicles.map(vehicle =>
                    vehicle.id === action.payload.id ? action.payload : vehicle
                ),
            };
        case DELETE_VEHICLE_SUCCESS:
            return {
                ...state,
                loading: false,
                vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload),
            };
        case FETCH_VEHICLES_FAILURE:
        case ADD_VEHICLE_FAILURE:
        case EDIT_VEHICLE_FAILURE:
        case DELETE_VEHICLE_FAILURE:
            return {...state, loading: false, error: action.error};
        default:
            return state;
    }
};

export default vehicleReducer;
