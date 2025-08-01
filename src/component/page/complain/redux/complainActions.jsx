import axios from 'axios';

const API_URL = '/api/tickets';  // Adjust this URL based on your backend

// Action Types
export const FETCH_COMPLAINTS_REQUEST = 'FETCH_COMPLAINTS_REQUEST';
export const FETCH_COMPLAINTS_SUCCESS = 'FETCH_COMPLAINTS_SUCCESS';
export const FETCH_COMPLAINTS_FAILURE = 'FETCH_COMPLAINTS_FAILURE';

export const CREATE_COMPLAINT_REQUEST = 'CREATE_COMPLAINT_REQUEST';
export const CREATE_COMPLAINT_SUCCESS = 'CREATE_COMPLAINT_SUCCESS';
export const CREATE_COMPLAINT_FAILURE = 'CREATE_COMPLAINT_FAILURE';

export const UPDATE_COMPLAINT_REQUEST = 'UPDATE_COMPLAINT_REQUEST';
export const UPDATE_COMPLAINT_SUCCESS = 'UPDATE_COMPLAINT_SUCCESS';
export const UPDATE_COMPLAINT_FAILURE = 'UPDATE_COMPLAINT_FAILURE';

// Action Creators

// Fetch Complaints by School ID
export const fetchComplaints = (schoolId) => async (dispatch) => {
    dispatch({type: FETCH_COMPLAINTS_REQUEST});

    try {
        const response = await axios.get(`${API_URL}/school/${schoolId}`);
        dispatch({
            type: FETCH_COMPLAINTS_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: FETCH_COMPLAINTS_FAILURE,
            payload: error.message,
        });
    }
};

// Create a Complaint
export const createComplaint = (complaintData) => async (dispatch) => {
    dispatch({type: CREATE_COMPLAINT_REQUEST});

    try {
        const response = await axios.post(`${API_URL}/create`, complaintData);
        dispatch({
            type: CREATE_COMPLAINT_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: CREATE_COMPLAINT_FAILURE,
            payload: error.message,
        });
    }
};

// Update a Complaint
export const updateComplaint = (ticketId, complaintData) => async (dispatch) => {
    dispatch({type: UPDATE_COMPLAINT_REQUEST});

    try {
        const response = await axios.put(`${API_URL}/update/${ticketId}`, complaintData);
        dispatch({
            type: UPDATE_COMPLAINT_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: UPDATE_COMPLAINT_FAILURE,
            payload: error.message,
        });
    }
};
