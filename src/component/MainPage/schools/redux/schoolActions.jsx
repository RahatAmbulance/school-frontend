// src/actions/schoolActions.js
import {api} from "../../../../common";
import {
    ADD_SCHOOL_FAILURE,
    ADD_SCHOOL_REQUEST,
    ADD_SCHOOL_SUCCESS,
    CLEAR_SELECTED_SCHOOL,
    DELETE_SCHOOL_FAILURE,
    DELETE_SCHOOL_REQUEST,
    DELETE_SCHOOL_SUCCESS,
    FETCH_SCHOOLS_FAILURE,
    FETCH_SCHOOLS_REQUEST,
    FETCH_SCHOOLS_SUCCESS,
    RESET_SCHOOL_FORM,
    SET_SELECTED_SCHOOL,
    UPDATE_SCHOOL_FAILURE,
    UPDATE_SCHOOL_FIELD,
    UPDATE_SCHOOL_REQUEST,
    UPDATE_SCHOOL_SUCCESS,
} from './schoolActionTypes';
import {getEmailAddresses} from "../../../page/dashboard/redux/emailActions.js";
import {fetchAllData} from "../../../page/dashboard/redux/masterActions";

const API_URL = '/api/schools';


export const fetchSchoolById = (id) => async (dispatch) => {
    dispatch({type: FETCH_SCHOOLS_REQUEST});
    try {
        const url = id ? `${API_URL}/${id}` : API_URL; // Append the ID to the URL if it's provided
        const response = await api.get(url);
        dispatch({type: FETCH_SCHOOLS_SUCCESS, payload: response.data});
        const schoolData = response.data;
        if (schoolData) {
            const schoolId = schoolData.id;
            const session = schoolData.session;
            // Ensure getEmailAddresses uses dispatch properly
            await dispatch(getEmailAddresses(schoolId, session));
            await dispatch(fetchAllData(schoolId, session));
        }
    } catch (error) {
        dispatch({type: FETCH_SCHOOLS_FAILURE, error});
    }
};

export const fetchSchools = () => async (dispatch) => {
    dispatch({type: FETCH_SCHOOLS_REQUEST});
    try {
        const response = await api.get(API_URL);
        dispatch({type: FETCH_SCHOOLS_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_SCHOOLS_FAILURE, error});
    }
};

export const addSchool = (school) => async (dispatch) => {
    dispatch({type: ADD_SCHOOL_REQUEST});
    try {
        const response = await api.post(API_URL, school);
        dispatch({type: ADD_SCHOOL_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: ADD_SCHOOL_FAILURE, error});
    }
};

export const updateSchool = (school) => async (dispatch) => {
    dispatch({type: UPDATE_SCHOOL_REQUEST});
    try {
        const response = await api.put(`${API_URL}/${school.id}`, school);
        dispatch({type: UPDATE_SCHOOL_SUCCESS, payload: response.data});
        dispatch(fetchSchools());
    } catch (error) {
        dispatch({type: UPDATE_SCHOOL_FAILURE, error});
    }
};

export const deleteSchool = (id) => async (dispatch) => {
    dispatch({type: DELETE_SCHOOL_REQUEST});
    try {
        await api.delete(`${API_URL}/${id}`);
        dispatch({type: DELETE_SCHOOL_SUCCESS, payload: id});
        dispatch(fetchSchools());
    } catch (error) {
        dispatch({type: DELETE_SCHOOL_FAILURE, error});
    }
};

export const setSelectedSchool = (school) => ({
    type: SET_SELECTED_SCHOOL,
    payload: school,
});

export const clearSelectedSchool = () => ({
    type: CLEAR_SELECTED_SCHOOL,
});

export const updateSchoolField = (name, value) => ({
    type: UPDATE_SCHOOL_FIELD,
    payload: {name, value},
});

export const resetSchoolForm = () => ({
    type: RESET_SCHOOL_FORM,
});
