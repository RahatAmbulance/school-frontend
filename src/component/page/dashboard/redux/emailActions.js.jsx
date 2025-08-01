import {api} from "../../../../common";
import {
    FETCH_EMAIL_ADDRESSES_FAILURE,
    FETCH_EMAIL_ADDRESSES_REQUEST,
    FETCH_EMAIL_ADDRESSES_SUCCESS
} from "./actionTypes";

const API_URL = '/api/mail/school/session';
export const getEmailAddresses = (schoolId, session) => async (dispatch) => {
    try {
        dispatch({type: FETCH_EMAIL_ADDRESSES_REQUEST});
        const response = await api.get(API_URL, {
            params: {schoolId, session}
        });
        dispatch({
            type: FETCH_EMAIL_ADDRESSES_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: FETCH_EMAIL_ADDRESSES_FAILURE,
            payload: error.message
        });
    }
};
