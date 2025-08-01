import {api} from '../../../../../common';

export const FETCH_PERIODS_REQUEST = 'FETCH_PERIODS_REQUEST';
export const FETCH_PERIODS_SUCCESS = 'FETCH_PERIODS_SUCCESS';
export const FETCH_PERIODS_FAILURE = 'FETCH_PERIODS_FAILURE';
export const ADD_PERIOD = 'ADD_PERIOD';
export const DELETE_PERIOD = 'DELETE_PERIOD';

// Action creators
export const fetchPeriodsRequest = () => ({type: FETCH_PERIODS_REQUEST});
export const fetchPeriodsSuccess = (periods) => ({type: FETCH_PERIODS_SUCCESS, payload: periods});
export const fetchPeriodsFailure = (error) => ({type: FETCH_PERIODS_FAILURE, payload: error});

export const addPeriod = (period) => ({type: ADD_PERIOD, payload: period});
export const removePeriod = (periodId) => ({type: DELETE_PERIOD, payload: periodId});

export const fetchPeriods = (schoolId, session) => async (dispatch) => {
    dispatch(fetchPeriodsRequest());
    try {
        const response = await api.get('/api/master/period', {
            params: {schoolId, session}
        });
        dispatch(fetchPeriodsSuccess(response.data));
    } catch (error) {
        dispatch(fetchPeriodsFailure(error.message));
    }
};

export const createPeriod = (periodData) => async (dispatch) => {
    try {
        const response = await api.post('/api/master/periods', periodData);
        dispatch(addPeriod(response.data));
    } catch (error) {
        console.error('Error creating period:', error);
    }
};

export const deletePeriod = (periodId) => async (dispatch) => {
    try {
        await api.delete(`/api/master/periods/${periodId}`);
        dispatch(removePeriod(periodId));
    } catch (error) {
        console.error('Error deleting period:', error);
    }
};
