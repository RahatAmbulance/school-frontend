import {api} from "../../../../../common";

export const FETCH_RELIGIONS_REQUEST = 'FETCH_RELIGIONS_REQUEST';
export const FETCH_RELIGIONS_SUCCESS = 'FETCH_RELIGIONS_SUCCESS';
export const FETCH_RELIGIONS_FAILURE = 'FETCH_RELIGIONS_FAILURE';
export const ADD_RELIGION = 'ADD_RELIGION';
export const UPDATE_RELIGION = 'UPDATE_RELIGION';
export const DELETE_RELIGION = 'DELETE_RELIGION';

export const fetchReligions = () => async (dispatch) => {
    dispatch({type: FETCH_RELIGIONS_REQUEST});
    try {
        const response = await api.get('/api/master/religions');
        dispatch({type: FETCH_RELIGIONS_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_RELIGIONS_FAILURE, payload: error.message});
    }
};

export const addReligion = (religion) => ({
    type: ADD_RELIGION,
    payload: religion,
});

export const updateReligion = (religion) => ({
    type: UPDATE_RELIGION,
    payload: religion,
});

export const deleteReligion = (id) => ({
    type: DELETE_RELIGION,
    payload: id,
});
