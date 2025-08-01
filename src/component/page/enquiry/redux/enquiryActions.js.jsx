import {api} from "../../../../common";

export const FETCH_ENQUIRIES_SUCCESS = 'FETCH_ENQUIRIES_SUCCESS';
export const ADD_ENQUIRY_SUCCESS = 'ADD_ENQUIRY_SUCCESS';
export const UPDATE_ENQUIRY_SUCCESS = 'UPDATE_ENQUIRY_SUCCESS';
export const DELETE_ENQUIRY_SUCCESS = 'DELETE_ENQUIRY_SUCCESS';
export const FETCH_ENQUIRIES_FAILURE = 'FETCH_ENQUIRIES_FAILURE';

const API_ENDPOINT = 'api/enquiries';

// Fetch all enquiries
export const fetchEnquiries = (schoolId, session) => async dispatch => {
    try {
        const response = await api.get(`${API_ENDPOINT}/school/session`, {
            params: {schoolId, session}
        });
        dispatch({type: FETCH_ENQUIRIES_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_ENQUIRIES_FAILURE, payload: error.message});
    }
};

// Add a new enquiry
export const addEnquiry = (enquiry) => async dispatch => {
    try {
        const response = await api.post(`${API_ENDPOINT}`, {
            ...enquiry
        });
        dispatch({type: ADD_ENQUIRY_SUCCESS, payload: response.data});
    } catch (error) {
        console.error('Error adding enquiry:', error);
    }
};

// Update an existing enquiry
export const updateEnquiry = (enquiry) => async dispatch => {
    try {
        const response = await api.put(`${API_ENDPOINT}/${enquiry.id}`, enquiry);
        dispatch({type: UPDATE_ENQUIRY_SUCCESS, payload: response.data});
    } catch (error) {
        console.error('Error updating enquiry:', error);
    }
};

// Delete an enquiry
export const deleteEnquiry = (id) => async dispatch => {
    try {
        await api.delete(`${API_ENDPOINT}/${id}`);
        dispatch({type: DELETE_ENQUIRY_SUCCESS, payload: id});
    } catch (error) {
        console.error('Error deleting enquiry:', error);
    }
};
