// src/redux/actions/attendanceActions.js
import {
    ADD_ATTENDANCE_FAILURE,
    ADD_ATTENDANCE_REQUEST,
    ADD_ATTENDANCE_SUCCESS,
    DELETE_ATTENDANCE_FAILURE,
    DELETE_ATTENDANCE_REQUEST,
    DELETE_ATTENDANCE_SUCCESS,
    FETCH_ATTENDANCE_FAILURE,
    FETCH_ATTENDANCE_REQUEST,
    FETCH_ATTENDANCE_SUCCESS,
    UPDATE_ATTENDANCE_FAILURE,
    UPDATE_ATTENDANCE_REQUEST
} from './attendanceActionTypes';
import {api} from "../../../../common";

export const fetchAttendance = (schoolId, session) => async (dispatch) => {
    dispatch({type: FETCH_ATTENDANCE_REQUEST});
    try {
        const response = await api.get('/api/attendance/school/session', {
            params: {schoolId, session}
        });
        dispatch({type: FETCH_ATTENDANCE_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_ATTENDANCE_FAILURE, payload: error.message});
    }
};
export const AttendanceBySchoolIdAndsession = ({schoolId, session}) => async (dispatch) => {
    dispatch({type: FETCH_ATTENDANCE_REQUEST});
    try {
        const response = await api.get('/school/session', {
            params: {
                schoolId,
                session
            }
        });
        dispatch({type: FETCH_ATTENDANCE_SUCCESS, payload: response.data});
    } catch (error) {
        dispatch({type: FETCH_ATTENDANCE_FAILURE, payload: error.message});
    }
};
export const addAttendance = (attendanceData) => async (dispatch) => {
    dispatch({type: ADD_ATTENDANCE_REQUEST});
    try {
        const response = await api.post('/api/attendance', attendanceData);
        response.data.forEach(record => {

            dispatch({type: ADD_ATTENDANCE_SUCCESS, payload: record});
        });
    } catch (error) {
        dispatch({type: ADD_ATTENDANCE_FAILURE, payload: error.message});
    }
};

export const updateAttendance = (id, attendanceData) => async (dispatch) => {
    dispatch({type: UPDATE_ATTENDANCE_REQUEST});
    try {
        const response = await api.put(`/api/attendance/${id}`, attendanceData);
        response.data.forEach(record => {
            dispatch({type: ADD_ATTENDANCE_SUCCESS, payload: record});
        });
    } catch (error) {
        dispatch({type: UPDATE_ATTENDANCE_FAILURE, payload: error.message});
    }
};

export const deleteAttendance = (id) => async (dispatch) => {
    dispatch({type: DELETE_ATTENDANCE_REQUEST});
    try {
        await api.delete(`/api/attendance/${id}`);
        dispatch({type: DELETE_ATTENDANCE_SUCCESS, payload: id});
    } catch (error) {
        dispatch({type: DELETE_ATTENDANCE_FAILURE, payload: error.message});
    }
};
