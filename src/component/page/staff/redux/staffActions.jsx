// Action Types
import {api, generatePassword, selectSchoolDetails} from "../../../../common";

export const CREATE_STAFF_REQUEST = 'CREATE_STAFF_REQUEST';
export const CREATE_STAFF_SUCCESS = 'CREATE_STAFF_SUCCESS';
export const CREATE_STAFF_FAILURE = 'CREATE_STAFF_FAILURE';

export const FETCH_STAFF_REQUEST = 'FETCH_STAFF_REQUEST';
export const FETCH_STAFF_SUCCESS = 'FETCH_STAFF_SUCCESS';
export const FETCH_STAFF_FAILURE = 'FETCH_STAFF_FAILURE';

export const UPDATE_STAFF_REQUEST = 'UPDATE_STAFF_REQUEST';
export const UPDATE_STAFF_SUCCESS = 'UPDATE_STAFF_SUCCESS';
export const UPDATE_STAFF_FAILURE = 'UPDATE_STAFF_FAILURE';

export const DELETE_STAFF_REQUEST = 'DELETE_STAFF_REQUEST';
export const DELETE_STAFF_SUCCESS = 'DELETE_STAFF_SUCCESS';
export const DELETE_STAFF_FAILURE = 'DELETE_STAFF_FAILURE';

export const FETCH_STAFF_BY_ID_REQUEST = 'FETCH_STAFF_BY_ID_REQUEST';
export const FETCH_STAFF_BY_ID_SUCCESS = 'FETCH_STAFF_BY_ID_SUCCESS';
export const FETCH_STAFF_BY_ID_FAILURE = 'FETCH_STAFF_BY_ID_FAILURE';

// Action Creators
const createStaffRequest = () => ({type: CREATE_STAFF_REQUEST});
const createStaffSuccess = (data) => ({type: CREATE_STAFF_SUCCESS, payload: data});
const createStaffFailure = (error) => ({type: CREATE_STAFF_FAILURE, payload: error});

const fetchStaffRequest = () => ({type: FETCH_STAFF_REQUEST});
const fetchStaffSuccess = (data) => ({type: FETCH_STAFF_SUCCESS, payload: data});
const fetchStaffFailure = (error) => ({type: FETCH_STAFF_FAILURE, payload: error});

const updateStaffRequest = () => ({type: UPDATE_STAFF_REQUEST});
const updateStaffSuccess = (data) => ({type: UPDATE_STAFF_SUCCESS, payload: data});
const updateStaffFailure = (error) => ({type: UPDATE_STAFF_FAILURE, payload: error});

const deleteStaffRequest = () => ({type: DELETE_STAFF_REQUEST});
const deleteStaffSuccess = (id) => ({type: DELETE_STAFF_SUCCESS, payload: id});
const deleteStaffFailure = (error) => ({type: DELETE_STAFF_FAILURE, payload: error});

// Async Action Creators
export const createStaff = (staffData) => {
    return async (dispatch, getState) => {
        dispatch(createStaffRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const password = generatePassword()
            staffData['password'] = password;
            staffData['session'] = userData.session;
            staffData['createdUserId'] = userData.createdUserId;
            staffData['schoolId'] = userData.id;
            staffData['type'] = staffData.staffType?.toLowerCase() || 'non-teaching';

            const response = await api.post('/api/staff', staffData);
            dispatch(createStaffSuccess(response.data));
            return {success: true, data: response.data};
        } catch (error) {
            let errorMessage = 'An error occurred while creating staff member.';

            // Check if it's a duplicate email error
            if (error.response?.status === 500 && error.response?.data?.detail?.includes('Duplicate entry') && error.response?.data?.detail?.includes('email')) {
                errorMessage = 'This email address is already registered. Please use a different email.';
            }

            dispatch(createStaffFailure(errorMessage));
            return {success: false, error: errorMessage};
        }
    };
};


export const fetchStaffById = (staffId) => async (dispatch) => {
    dispatch({type: FETCH_STAFF_BY_ID_REQUEST});
    try {
        const response = await api.get(`/api/staff/${staffId}`);
        dispatch({type: FETCH_STAFF_BY_ID_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_STAFF_BY_ID_FAILURE, payload: error.message});
    }
};

// Fetch staff
export const fetchStaff = (schoolId, session) => async (dispatch) => {
    dispatch({type: FETCH_STAFF_REQUEST});
    try {
        const response = await api.get('/api/staff/school/session', {
            params: {schoolId, session}
        });
        dispatch({type: FETCH_STAFF_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_STAFF_FAILURE, payload: error.message});
    }
};

export const updateStaff = (id, staffData) => {
    return async (dispatch, getState) => {
        dispatch(updateStaffRequest());

        try {
            const userData = selectSchoolDetails(getState());

            staffData['session'] = userData.session;
            staffData['createdUserId'] = userData.createdUser;
            staffData['schoolId'] = userData.id;
            staffData['type'] = staffData.staffType?.toLowerCase() || 'non-teaching';

            const response = await api.put(`/api/staff/${id}`, staffData);
            dispatch(updateStaffSuccess(response.data));
        } catch (error) {
            dispatch(updateStaffFailure(error.message));
        }
    };
};

export const deleteStaff = (id) => {
    return async (dispatch) => {
        dispatch(deleteStaffRequest());
        try {
            await api.delete(`/api/staff/${id}`);
            dispatch(deleteStaffSuccess(id));
        } catch (error) {
            dispatch(deleteStaffFailure(error.message));
        }
    };
};
