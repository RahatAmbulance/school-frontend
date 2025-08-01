// src/store/actions/vehicleActions.js
import {api} from '../../../../../common';

export const FETCH_VEHICLES_REQUEST = 'FETCH_VEHICLES_REQUEST';
export const FETCH_VEHICLES_SUCCESS = 'FETCH_VEHICLES_SUCCESS';
export const FETCH_VEHICLES_FAILURE = 'FETCH_VEHICLES_FAILURE';

export const ADD_VEHICLE_REQUEST = 'ADD_VEHICLE_REQUEST';
export const ADD_VEHICLE_SUCCESS = 'ADD_VEHICLE_SUCCESS';
export const ADD_VEHICLE_FAILURE = 'ADD_VEHICLE_FAILURE';

export const EDIT_VEHICLE_REQUEST = 'EDIT_VEHICLE_REQUEST';
export const EDIT_VEHICLE_SUCCESS = 'EDIT_VEHICLE_SUCCESS';
export const EDIT_VEHICLE_FAILURE = 'EDIT_VEHICLE_FAILURE';

export const DELETE_VEHICLE_REQUEST = 'DELETE_VEHICLE_REQUEST';
export const DELETE_VEHICLE_SUCCESS = 'DELETE_VEHICLE_SUCCESS';
export const DELETE_VEHICLE_FAILURE = 'DELETE_VEHICLE_FAILURE';

export const FETCH_VEHICLE_BY_ID_REQUEST = 'FETCH_VEHICLE_BY_ID_REQUEST';
export const FETCH_VEHICLE_BY_ID_SUCCESS = 'FETCH_VEHICLE_BY_ID_SUCCESS';
export const FETCH_VEHICLE_BY_ID_FAILURE = 'FETCH_VEHICLE_BY_ID_FAILURE';

/*export const fetchVehicleById = (vehicleId) => async (dispatch) => {
    dispatch({type: FETCH_VEHICLE_BY_ID_REQUEST});
    try {
        const response = await api.get(`/api/vehicles/${vehicleId}`);
        dispatch({type: FETCH_VEHICLE_BY_ID_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_VEHICLE_BY_ID_FAILURE, payload: error.message});
    }
};*/
// Fetch Vehicles
export const fetchVehicles = (schoolId, session) => async (dispatch) => {
    dispatch({type: FETCH_VEHICLES_REQUEST});
    try {
        console.log(`Fetching vehicles with schoolId: ${schoolId}, session: ${session}`);
        const response = await api.get('/api/vehicles/school/session', {
            params: {schoolId, session}
        });
        console.log('Vehicles API response:', response.data);
        dispatch({type: FETCH_VEHICLES_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_VEHICLES_FAILURE, error: error.message});
    }
};

// Add Vehicle
export const addVehicle = (vehicle) => async (dispatch) => {
    dispatch({type: ADD_VEHICLE_REQUEST});
    try {
        const response = await api.post('/api/vehicles', vehicle);
        dispatch({type: ADD_VEHICLE_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: ADD_VEHICLE_FAILURE, error: error.message});
    }
};

// Edit Vehicle
export const editVehicle = (vehicle) => async (dispatch) => {
    dispatch({type: EDIT_VEHICLE_REQUEST});
    try {
        const response = await api.put(`/api/vehicles/${vehicle.id}`, vehicle);
        dispatch({type: EDIT_VEHICLE_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: EDIT_VEHICLE_FAILURE, error: error.message});
    }
};

// Delete Vehicle
export const deleteVehicle = (id) => async (dispatch) => {
    dispatch({type: DELETE_VEHICLE_REQUEST});
    try {
        await api.delete(`/api/vehicles/${id}`);
        dispatch({type: DELETE_VEHICLE_SUCCESS, payload: id});
    } catch (error) {
        dispatch({type: DELETE_VEHICLE_FAILURE, error: error.message});
    }
};
