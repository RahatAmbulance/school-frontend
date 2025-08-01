import {api} from '../../../../../common';

export const FETCH_GRADES_REQUEST = 'FETCH_GRADES_REQUEST';
export const FETCH_GRADES_SUCCESS = 'FETCH_GRADES_SUCCESS';
export const FETCH_GRADES_FAILURE = 'FETCH_GRADES_FAILURE';
export const ADD_GRADE = 'ADD_GRADE';
export const DELETE_GRADE = 'DELETE_GRADE';

// Action creators
export const fetchGradesRequest = () => ({type: FETCH_GRADES_REQUEST});
export const fetchGradesSuccess = (grades) => ({type: FETCH_GRADES_SUCCESS, payload: grades});
export const fetchGradesFailure = (error) => ({type: FETCH_GRADES_FAILURE, payload: error});

export const addGrade = (grade) => ({type: ADD_GRADE, payload: grade});
export const removeGrade = (gradeId) => ({type: DELETE_GRADE, payload: gradeId});

export const fetchGrades = (schoolId, session) => async (dispatch) => {
    dispatch(fetchGradesRequest());
    try {
        const response = await api.get('/api/master/grade', {
            params: {schoolId, session}
        });
        dispatch(fetchGradesSuccess(response.data));
    } catch (error) {
        dispatch(fetchGradesFailure(error.message));
    }
};

export const createGrade = (gradeData) => async (dispatch) => {
    try {
        const response = await api.post('/api/master/grades', gradeData);
        console.log('API Response:', response.data); // Log the response
        dispatch(addGrade(response.data)); // Ensure response.data is the correct format
    } catch (error) {
        console.error('Error creating grade:', error);
    }
};

export const deleteGrade = (gradeId) => async (dispatch) => {
    try {
        await api.delete(`/api/master/grades/${gradeId}`);
        dispatch(removeGrade(gradeId));
    } catch (error) {
        console.error('Error deleting grade:', error);
    }
};



