// src/actions/masterActions.js
import {api} from "../../../../common";
import {FETCH_ALL_DATA_FAILURE, FETCH_ALL_DATA_REQUEST, FETCH_ALL_DATA_SUCCESS} from "./actionTypes";


export const fetchAllData = (schoolId, session) => async (dispatch) => {
    dispatch({type: FETCH_ALL_DATA_REQUEST});
    try {
        const response = await api.get('/api/master/all-data/school/session', {
            params: {schoolId, session}
        });
        dispatch({type: FETCH_ALL_DATA_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_ALL_DATA_FAILURE, payload: error.message});
    }
};
