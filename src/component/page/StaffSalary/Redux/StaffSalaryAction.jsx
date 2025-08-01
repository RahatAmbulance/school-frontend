import {api, selectSchoolDetails, selectUserActualData,} from "../../../../common";

// Action Types
export const CREATE_STAFF_SALARY_REQUEST = 'CREATE_STAFF_SALARY_REQUEST';
export const CREATE_STAFF_SALARY_SUCCESS = 'CREATE_STAFF_SALARY_SUCCESS';
export const CREATE_STAFF_SALARY_FAILURE = 'CREATE_STAFF_SALARY_FAILURE';

export const FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_REQUEST = 'FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_REQUEST';
export const FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_SUCCESS = 'FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_SUCCESS';
export const FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_FAILURE = 'FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_FAILURE';

export const DELETE_STAFF_SALARY_REQUEST = 'DELETE_STAFF_SALARY_REQUEST';
export const DELETE_STAFF_SALARY_SUCCESS = 'DELETE_STAFF_SALARY_SUCCESS';
export const DELETE_STAFF_SALARY_FAILURE = 'DELETE_STAFF_SALARY_FAILURE';

export const UPDATE_STAFF_SALARY_REQUEST = 'UPDATE_STAFF_SALARY_REQUEST';
export const UPDATE_STAFF_SALARY_SUCCESS = 'UPDATE_STAFF_SALARY_SUCCESS';
export const UPDATE_STAFF_SALARY_FAILURE = 'UPDATE_STAFF_SALARY_FAILURE';

// Action Creators
const createStaffSalaryRequest = () => ({type: CREATE_STAFF_SALARY_REQUEST});
const createStaffSalarySuccess = (data) => ({type: CREATE_STAFF_SALARY_SUCCESS, payload: data});
const createStaffSalaryFailure = (error) => ({type: CREATE_STAFF_SALARY_FAILURE, payload: error});


const fetchStaffSalaryBySchoolSessionRequest = () => ({type: FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_REQUEST});
const fetchStaffSalaryBySchoolSessionSuccess = (data) => ({
    type: FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_SUCCESS,
    payload: data
});
const fetchStaffSalaryBySchoolSessionFailure = (error) => ({
    type: FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_FAILURE,
    payload: error
});

const deleteStaffSalaryRequest = () => ({type: DELETE_STAFF_SALARY_REQUEST});
const deleteStaffSalarySuccess = (id) => ({type: DELETE_STAFF_SALARY_SUCCESS, payload: id});
const deleteStaffSalaryFailure = (error) => ({type: DELETE_STAFF_SALARY_FAILURE, payload: error});

const updateStaffSalaryRequest = () => ({type: UPDATE_STAFF_SALARY_REQUEST});
const updateStaffSalarySuccess = (data) => ({type: UPDATE_STAFF_SALARY_SUCCESS, payload: data});
const updateStaffSalaryFailure = (error) => ({type: UPDATE_STAFF_SALARY_FAILURE, payload: error});

// Async Action Creators

export const createStaffSalary = (salaryData) => {
    return async (dispatch, getState) => {
        dispatch(createStaffSalaryRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            salaryData["session"] = userData.session;
            salaryData["schoolId"] = userData.id;
            salaryData["staffId"] = actualUsrData.tableId;
            salaryData["staffName"] = actualUsrData.tableName;

            const response = await api.post("/api/staff-salary/create", salaryData);
            dispatch(createStaffSalarySuccess(response.data));
        } catch (error) {
            dispatch(createStaffSalaryFailure(error.message));
        }
    };
};


export const fetchStaffSalaryBySchoolSession = (schoolId, session) => {
    return async (dispatch) => {
        dispatch(fetchStaffSalaryBySchoolSessionRequest());
        try {
            const response = await api.get("/api/staff-salary/school/session", {
                params: {schoolId, session},
            });
            dispatch(fetchStaffSalaryBySchoolSessionSuccess(response.data));
        } catch (error) {
            dispatch(fetchStaffSalaryBySchoolSessionFailure(error.message));
        }
    };
};


export const updateStaffSalary = (id, salaryData) => {
    return async (dispatch, getState) => {
        dispatch(updateStaffSalaryRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            salaryData["schoolId"] = userData.id;
            salaryData["staffId"] = actualUsrData.tableId;
            salaryData["staffName"] = actualUsrData.tableName;
            salaryData["session"] = userData.session;

            const response = await api.put(
                `/api/staff-salary/update/${id}`,
                salaryData
            );
            dispatch(updateStaffSalarySuccess(response.data));
        } catch (error) {
            dispatch(updateStaffSalaryFailure(error.message));
        }
    };
};


export const deleteStaffSalaryById = (id) => {
    return async (dispatch) => {
        dispatch(deleteStaffSalaryRequest());
        try {
            await api.delete(`/api/staff-salary/${id}`);
            dispatch(deleteStaffSalarySuccess(id));
        } catch (error) {
            dispatch(deleteStaffSalaryFailure(error.message));
        }
    };
};




