// schoolActions.js
import {FETCH_SCHOOL_FAILURE, FETCH_SCHOOL_REQUEST, FETCH_SCHOOL_SUCCESS} from './actionTypes';
import {api} from "../../../../common";
import {getEmailAddresses} from "./emailActions";
import {fetchAllData} from "./masterActions";

export const fetchSchoolRequest = () => ({
    type: FETCH_SCHOOL_REQUEST,
});

export const fetchSchoolSuccess = (schoolData) => ({
    type: FETCH_SCHOOL_SUCCESS,
    payload: schoolData,
});

export const fetchSchoolFailure = (error) => ({
    type: FETCH_SCHOOL_FAILURE,
    payload: error,
});

export const fetchSchool = (schoolId) => {
    return async (dispatch) => {
        dispatch(fetchSchoolRequest());
        try {
            // API call to fetch school data by ID
            const response = await api.get(`/api/schools/${schoolId}`);
            const schoolData = response.data;
            dispatch(fetchSchoolSuccess(schoolData));  // Dispatch success action with school data
            if (schoolData) {
                const schoolId = schoolData.id;
                const session = schoolData.session;
                // Ensure getEmailAddresses uses dispatch properly
                await dispatch(getEmailAddresses(schoolId, session));

                await dispatch(fetchAllData(schoolId, session));
            }
        } catch (error) {
            // Handle API errors, log if needed
            console.error('Error fetching school data:', error);
            // Optional: Enhanced error handling (retry mechanism)
            // You could implement retries, timeout logic, or a notification to the user
            dispatch(fetchSchoolFailure(error.message || 'An error occurred while fetching school data'));
        }
    };
};
