import {api} from "../../../../../common";

export const FETCH_ALL_DETAILS_REQUEST = 'FETCH_ATTENDANCE_REQUEST';
export const FETCH_ALL_DETAILS_SUCCESS = 'FETCH_ATTENDANCE_SUCCESS';
export const FETCH_ALL_DETAILS_FAILURE = 'FETCH_ATTENDANCE_FAILURE';

export const fetchAllDetails = (schoolId, session) => async (dispatch) => {
    dispatch({type: FETCH_ALL_DETAILS_REQUEST});
    try {
        const response = await api.get('api/schools/all/school/session', {
            params: {schoolId, session}
        });
        dispatch({type: FETCH_ALL_DETAILS_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_ALL_DETAILS_FAILURE, payload: error.message});
    }
};