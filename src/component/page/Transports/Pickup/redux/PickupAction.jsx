import {api, selectSchoolDetails} from "../../../../../common"; // Update path as needed

// Action Types
export const CREATE_PICKUP_AUTH_REQUEST = 'CREATE_PICKUP_AUTH_REQUEST';
export const CREATE_PICKUP_AUTH_SUCCESS = 'CREATE_PICKUP_AUTH_SUCCESS';
export const CREATE_PICKUP_AUTH_FAILURE = 'CREATE_PICKUP_AUTH_FAILURE';

export const UPDATE_PICKUP_AUTH_REQUEST = 'UPDATE_PICKUP_AUTH_REQUEST';
export const UPDATE_PICKUP_AUTH_SUCCESS = 'UPDATE_PICKUP_AUTH_SUCCESS';
export const UPDATE_PICKUP_AUTH_FAILURE = 'UPDATE_PICKUP_AUTH_FAILURE';

export const DELETE_PICKUP_AUTH_REQUEST = 'DELETE_PICKUP_AUTH_REQUEST';
export const DELETE_PICKUP_AUTH_SUCCESS = 'DELETE_PICKUP_AUTH_SUCCESS';
export const DELETE_PICKUP_AUTH_FAILURE = 'DELETE_PICKUP_AUTH_FAILURE';

export const FETCH_PICKUP_AUTHS_REQUEST = 'FETCH_PICKUP_AUTHS_REQUEST';
export const FETCH_PICKUP_AUTHS_SUCCESS = 'FETCH_PICKUP_AUTHS_SUCCESS';
export const FETCH_PICKUP_AUTHS_FAILURE = 'FETCH_PICKUP_AUTHS_FAILURE';

// Action Creators
const createPickupAuthRequest = () => ({type: CREATE_PICKUP_AUTH_REQUEST});
const createPickupAuthSuccess = (data) => ({
    type: CREATE_PICKUP_AUTH_SUCCESS,
    payload: data
});
const createPickupAuthFailure = (error) => ({
    type: CREATE_PICKUP_AUTH_FAILURE,
    payload: error
});

const updatePickupAuthRequest = () => ({type: UPDATE_PICKUP_AUTH_REQUEST});
const updatePickupAuthSuccess = (data) => ({
    type: UPDATE_PICKUP_AUTH_SUCCESS,
    payload: data
});
const updatePickupAuthFailure = (error) => ({
    type: UPDATE_PICKUP_AUTH_FAILURE,
    payload: error
});

const deletePickupAuthRequest = () => ({type: DELETE_PICKUP_AUTH_REQUEST});
const deletePickupAuthSuccess = (id) => ({
    type: DELETE_PICKUP_AUTH_SUCCESS,
    payload: id
});
const deletePickupAuthFailure = (error) => ({
    type: DELETE_PICKUP_AUTH_FAILURE,
    payload: error
});

const fetchPickupAuthsRequest = () => ({type: FETCH_PICKUP_AUTHS_REQUEST});
const fetchPickupAuthsSuccess = (data) => ({
    type: FETCH_PICKUP_AUTHS_SUCCESS,
    payload: data
});
const fetchPickupAuthsFailure = (error) => ({
    type: FETCH_PICKUP_AUTHS_FAILURE,
    payload: error
});

// Async Action Creators
export const createPickupAuthorization = (pickupData) => {
    return async (dispatch, getState) => {
        dispatch(createPickupAuthRequest());
        try {
            const userData = selectSchoolDetails(getState());
            pickupData = {
                ...pickupData,
                session: userData.session,
                schoolId: userData.id,
            }
            const response = await api.post('/api/pickup-authorizations', pickupData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            dispatch(createPickupAuthSuccess(response.data));
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                error.message ||
                'Failed to create pickup authorization';
            dispatch(createPickupAuthFailure(errorMessage));
            throw error;
        }
    };
};

export const updatePickupAuthorization = (id, updatedData) => {
    return async (dispatch) => {
        dispatch(updatePickupAuthRequest());
        try {
            const response = await api.put(`/api/pickup-authorizations/${id}`, updatedData);
            dispatch(updatePickupAuthSuccess(response.data));
            return response.data;
        } catch (error) {
            dispatch(updatePickupAuthFailure(error.message));
            throw error;
        }
    };
};

export const deletePickupAuthorization = (id) => {
    return async (dispatch) => {
        dispatch(deletePickupAuthRequest());
        try {
            await api.delete(`/api/pickup-authorizations/${id}`);
            dispatch(deletePickupAuthSuccess(id));
            return id;
        } catch (error) {
            dispatch(deletePickupAuthFailure(error.message));
            throw error;
        }
    };
};

export const fetchPickupAuthorizations = () => {
    return async (dispatch) => {
        dispatch(fetchPickupAuthsRequest());
        try {
            const response = await api.get('/api/pickup-authorizations');
            dispatch(fetchPickupAuthsSuccess(response.data));
            return response.data;
        } catch (error) {
            dispatch(fetchPickupAuthsFailure(error.message));
            throw error;
        }
    };
};

// Optional: Add data formatting helper
export const formatPickupPayload = (data) => ({
    studentId: data.studentId,
    studentName: data.studentName,
    rollNumber: data.rollNumber,
    className: data.className,
    section: data.section,
    classTeacher: data.classTeacher,
    parentId: data.parentId,
    fatherName: data.fatherName,
    motherName: data.motherName,
    guardianName: data.guardianName,
    parentContactNumber: data.parentContactNumber,
    authorizedPersonName: data.authorizedPersonName,
    relationship: data.relationship,
    contactNumber: data.contactNumber,
    idProofType: data.idProofType,
    idProofNumber: data.idProofNumber,
    isOneTime: Boolean(data.isOneTime),
    validFrom: new Date(data.validFrom).toISOString(),
    validUntil: new Date(data.validUntil).toISOString(),
    active: Boolean(data.active)
});