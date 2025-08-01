// Action Types
import {api, generatePassword, selectSchoolDetails, selectUserActualData,} from "../../../../common";

export const CREATE_DAILYTASK_REQUEST = "CREATE_DAILYTASK_REQUEST";
export const CREATE_DAILYTASK_SUCCESS = "CREATE_DAILYTASK_SUCCESS";
export const CREATE_DAILYTASK_FAILURE = "CREATE_DAILYTASK_FAILURE";

export const FETCH_DAILYTASK_REQUEST = "FETCH_DAILYTASK_REQUEST";
export const FETCH_DAILYTASK_SUCCESS = "FETCH_DAILYTASK_SUCCESS";
export const FETCH_DAILYTASK_FAILURE = "FETCH_DAILYTASK_FAILURE";

export const UPDATE_DAILYTASK_REQUEST = "UPDATE_DAILYTASK_REQUEST";
export const UPDATE_DAILYTASK_SUCCESS = "UPDATE_DAILYTASK_SUCCESS";
export const UPDATE_DAILYTASK_FAILURE = "UPDATE_DAILYTASK_FAILURE";

export const DELETE_DAILYTASK_REQUEST = "DELETE_DAILYTASK_REQUEST";
export const DELETE_DAILYTASK_SUCCESS = "DELETE_DAILYTASK_SUCCESS";
export const DELETE_DAILYTASK_FAILURE = "DELETE_DAILYTASK_FAILURE";

// Action Creators
const createDailyTaskRequest = () => ({
    type: CREATE_DAILYTASK_REQUEST,
});
const createDailyTaskSuccess = (data) => ({
    type: CREATE_DAILYTASK_SUCCESS,
    payload: data,
});
const createDailyTaskFailure = (error) => ({
    type: CREATE_DAILYTASK_FAILURE,
    payload: error,
});
const fetchDailyTaskRequest = () => ({
    type: FETCH_DAILYTASK_REQUEST,
});
const fetchDailyTaskSuccess = (data) => ({
    type: FETCH_DAILYTASK_SUCCESS,
    payload: data,
});
const fetchDailyTaskFailure = (error) => ({
    type: FETCH_DAILYTASK_FAILURE,
    payload: error,
});

const updateDailyTaskRequest = () => ({type: UPDATE_DAILYTASK_REQUEST});
const updateDailyTaskSuccess = (data) => ({
    type: UPDATE_DAILYTASK_SUCCESS,
    payload: data,
});
const updateDailyTaskFailure = (error) => ({
    type: UPDATE_DAILYTASK_FAILURE,
    payload: error,
});

const deleteDailyTaskRequest = () => ({type: DELETE_DAILYTASK_REQUEST});
const deleteDailyTaskSuccess = (id) => ({
    type: DELETE_DAILYTASK_SUCCESS,
    payload: id,
});
const deleteDailyTaskFailure = (error) => ({
    type: DELETE_DAILYTASK_FAILURE,
    payload: error,
});

// Async Action Creators
export const createDailyTask = (dailyTaskData) => {
    return async (dispatch, getState) => {
        dispatch(createDailyTaskRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            const password = generatePassword();
            //dailyTaskData["password"] = password;
            dailyTaskData["session"] = userData.session;
            dailyTaskData["createdUserId"] = userData.createdUserId;
            dailyTaskData["schoolId"] = userData.id;
            dailyTaskData["staffId"] = actualUsrData.tableId;
            dailyTaskData["staffName"] = actualUsrData.tableName;
            const response = await api.post(
                "/api/dailyTask/createDailyTask",
                dailyTaskData
            );
            dispatch(createDailyTaskSuccess(response.data));
        } catch (error) {
            dispatch(createDailyTaskFailure(error.message));
        }
    };
};
export const fetchDailyTask = (schoolId, session) => {
    return async (dispatch) => {
        dispatch(fetchDailyTaskRequest());
        try {
            const response = await api.get("/api/dailyTask/schoolId/session", {
                params: {schoolId, session},
            });
            dispatch(fetchDailyTaskSuccess(response.data));
        } catch (error) {
            dispatch(fetchDailyTaskFailure(error.message));
        }
    };
};

export const updateDailyTask = (id, dailyTaskData) => {
    return async (dispatch, getState) => {
        dispatch(updateDailyTaskRequest());

        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            dailyTaskData["session"] = userData.session;
            dailyTaskData["createdUserId"] = userData.createdUser;
            dailyTaskData["schoolId"] = userData.id;
            dailyTaskData["staffId"] = actualUsrData.tableId;
            dailyTaskData["staffName"] = actualUsrData.tableName;
            const response = await api.put(
                `/api/dailyTask/updateDailyTask/${id}`,
                dailyTaskData
            );
            dispatch(updateDailyTaskSuccess(response.data));
        } catch (error) {
            dispatch(updateDailyTaskFailure(error.message));
        }
    };
};

export const deleteDailyTask = (id) => {
    return async (dispatch) => {
        dispatch(deleteDailyTaskRequest());
        try {
            await api.delete(`/api/dailyTask/deleteDailyTask/${id}`);
            dispatch(deleteDailyTaskSuccess(id));
        } catch (error) {
            dispatch(deleteDailyTaskFailure(error.message));
        }
    };
};
