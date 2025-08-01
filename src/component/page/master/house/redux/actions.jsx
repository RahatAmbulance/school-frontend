// src/features/house/actions.js
import {api} from '../../../../../common';
import {
    ADD_HOUSE_SUCCESS,
    DELETE_HOUSE_SUCCESS,
    FETCH_HOUSES_FAILURE,
    FETCH_HOUSES_REQUEST,
    FETCH_HOUSES_SUCCESS,
    UPDATE_HOUSE_SUCCESS
} from './actionTypes';

// Action creators
export const fetchHousesRequest = () => ({
    type: FETCH_HOUSES_REQUEST,
});

export const fetchHousesSuccess = (houses) => ({
    type: FETCH_HOUSES_SUCCESS,
    payload: houses,
});

export const fetchHousesFailure = (error) => ({
    type: FETCH_HOUSES_FAILURE,
    payload: error,
});

export const addHouseSuccess = (house) => ({
    type: ADD_HOUSE_SUCCESS,
    payload: house,
});

export const updateHouseSuccess = (house) => ({
    type: UPDATE_HOUSE_SUCCESS,
    payload: house,
});

export const deleteHouseSuccess = (id) => ({
    type: DELETE_HOUSE_SUCCESS,
    payload: id,
});

// Thunks for async operations
export const fetchHouses = (schoolId, session) => async (dispatch) => {
    dispatch(fetchHousesRequest());
    try {
        const response = await api.get('/api/master/houses', {
            params: {schoolId, session}
        });
        dispatch(fetchHousesSuccess(response.data));
    } catch (error) {
        dispatch(fetchHousesFailure(error.message));
    }
};

export const addHouse = (house) => async (dispatch) => {
    try {
        const response = await api.post('/api/master/houses', house);
        dispatch(addHouseSuccess(response.data));
    } catch (error) {
        console.error("Error adding house:", error);
    }
};

export const updateHouse = (house) => async (dispatch) => {
    try {
        const response = await api.put(`/api/master/houses/${house.id}`, house);
        dispatch(updateHouseSuccess(response.data));
    } catch (error) {
        console.error("Error updating house:", error);
    }
};

export const deleteHouse = (id) => async (dispatch) => {
    try {
        await api.delete(`/api/master/houses/${id}`);
        dispatch(deleteHouseSuccess(id));
    } catch (error) {
        console.error("Error deleting house:", error);
    }
};
