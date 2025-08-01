import {api} from "../../../../../common";

export const ADD_FEE = 'ADD_FEE';
export const DELETE_FEE = 'DELETE_FEE';
export const UPDATE_FEE = 'UPDATE_FEE';
export const SET_ERROR = 'SET_ERROR';
export const FETCH_FEES = 'FETCH_FEES'; // Action for fetching fees

// Action for adding fee
export const addFee = (fee) => async (dispatch) => {
    try {
        const response = await api.post('/api/fees/type', fee);
        if (response.status === 200) {
            dispatch({
                type: ADD_FEE,
                payload: response.data
            });
        }
    } catch (error) {
        console.error("Error adding fee:", error);
        dispatch({
            type: SET_ERROR,
            payload: 'Error adding fee'
        });
    }
};

// Action for deleting fee
export const deleteFee = (feeId) => async (dispatch) => {
    try {
        const response = await api.delete(`/api/fees/type/${feeId}`);
        if (response.status === 200) {
            dispatch({
                type: DELETE_FEE,
                payload: feeId
            });
        }
    } catch (error) {
        console.error("Error deleting fee:", error);
        dispatch({
            type: SET_ERROR,
            payload: 'Error deleting fee'
        });
    }
};

// Action for updating fee
export const updateFee = (feeId, fee) => async (dispatch) => {
    try {
        const response = await api.post(`/api/fees/type`, fee);
        if (response.status === 200) {
            dispatch({
                type: UPDATE_FEE,
                payload: {feeId, fee}
            });
        }
    } catch (error) {
        console.error("Error updating fee:", error);
        dispatch({
            type: SET_ERROR,
            payload: 'Error updating fee'
        });
    }
};

// Action for fetching fees by schoolId and session
export const fetchFees = (schoolId, session) => async (dispatch) => {
    try {
        const response = await api.get(`/api/fees/type/school/session?schoolId=${schoolId}&session=${session}`);
        if (response.status === 200) {
            dispatch({
                type: FETCH_FEES,
                payload: response.data
            });
        }
    } catch (error) {
        console.error("Error fetching fees:", error);
        dispatch({
            type: SET_ERROR,
            payload: 'Error fetching fees'
        });
    }
};
