import {api} from '../../../../../common';

// Action Types
export const SAVE_ROUTE_ASSIGNMENTS_REQUEST = 'SAVE_ROUTE_ASSIGNMENTS_REQUEST';
export const SAVE_ROUTE_ASSIGNMENTS_SUCCESS = 'SAVE_ROUTE_ASSIGNMENTS_SUCCESS';
export const SAVE_ROUTE_ASSIGNMENTS_FAILURE = 'SAVE_ROUTE_ASSIGNMENTS_FAILURE';

export const FETCH_ROUTE_ASSIGNMENTS_REQUEST = 'FETCH_ROUTE_ASSIGNMENTS_REQUEST';
export const FETCH_ROUTE_ASSIGNMENTS_SUCCESS = 'FETCH_ROUTE_ASSIGNMENTS_SUCCESS';
export const FETCH_ROUTE_ASSIGNMENTS_FAILURE = 'FETCH_ROUTE_ASSIGNMENTS_FAILURE';

export const DELETE_ROUTE_ASSIGNMENT_REQUEST = 'DELETE_ROUTE_ASSIGNMENT_REQUEST';
export const DELETE_ROUTE_ASSIGNMENT_SUCCESS = 'DELETE_ROUTE_ASSIGNMENT_SUCCESS';
export const DELETE_ROUTE_ASSIGNMENT_FAILURE = 'DELETE_ROUTE_ASSIGNMENT_FAILURE';

export const REMOVE_FROM_ROUTE_REQUEST = 'REMOVE_FROM_ROUTE_REQUEST';
export const REMOVE_FROM_ROUTE_SUCCESS = 'REMOVE_FROM_ROUTE_SUCCESS';
export const REMOVE_FROM_ROUTE_FAILURE = 'REMOVE_FROM_ROUTE_FAILURE';

// Action Creators
export const saveRouteAssignments = (assignmentData) => async (dispatch) => {
    dispatch({type: SAVE_ROUTE_ASSIGNMENTS_REQUEST});
    try {
        // First fetch existing assignments
        const existingResponse = await api.get('/api/route-assignments', {
            params: {
                routeId: assignmentData.routeId,
                schoolId: assignmentData.schoolId,
                session: assignmentData.session
            }
        });

        // Merge existing assignments with new ones, removing duplicates by ID
        const existingStudents = existingResponse.data?.assignedStudents || [];
        const existingStaff = existingResponse.data?.assignedStaff || [];

        // Create sets of existing IDs
        const existingStudentIds = new Set(existingStudents.map(s => s.id));
        const existingStaffIds = new Set(existingStaff.map(s => s.id));

        // Filter out duplicates from new assignments
        const newStudents = assignmentData.assignedStudents.filter(s => !existingStudentIds.has(s.id));
        const newStaff = assignmentData.assignedStaff.filter(s => !existingStaffIds.has(s.id));

        // Combine existing and new assignments
        const mergedData = {
            ...assignmentData,
            assignedStudents: [...existingStudents, ...newStudents],
            assignedStaff: [...existingStaff, ...newStaff]
        };

        // Save the merged assignments
        const response = await api.post('/api/route-assignments', mergedData);
        dispatch({
            type: SAVE_ROUTE_ASSIGNMENTS_SUCCESS,
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: SAVE_ROUTE_ASSIGNMENTS_FAILURE,
            payload: error.message
        });
        throw error;
    }
};

export const fetchRouteAssignments = (routeId, schoolId, session) => async (dispatch) => {
    dispatch({type: FETCH_ROUTE_ASSIGNMENTS_REQUEST});
    try {
        const response = await api.get('/api/route-assignments', {
            params: {routeId, schoolId, session}
        });
        dispatch({
            type: FETCH_ROUTE_ASSIGNMENTS_SUCCESS,
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: FETCH_ROUTE_ASSIGNMENTS_FAILURE,
            payload: error.message
        });
        throw error;
    }
};

export const removeFromRoute = (routeId, type, memberId, schoolId, session) => async (dispatch) => {
    dispatch({type: REMOVE_FROM_ROUTE_REQUEST});
    try {
        await api.delete(`/api/route-assignments/${routeId}/${type}/${memberId}?schoolId=${schoolId}&session=${session}`);

        // After successful deletion, fetch updated assignments
        const response = await api.get('/api/route-assignments', {
            params: {routeId, schoolId, session}
        });

        dispatch({
            type: REMOVE_FROM_ROUTE_SUCCESS,
            payload: response.data
        });
        return response.data;
    } catch (error) {
        dispatch({
            type: REMOVE_FROM_ROUTE_FAILURE,
            payload: error.message
        });
        throw error;
    }
};

export const deleteRouteAssignment = (routeId, type, memberId, schoolId, session) => async (dispatch) => {
    dispatch({type: DELETE_ROUTE_ASSIGNMENT_REQUEST});
    try {
        await api.delete(`/api/route-assignments/${routeId}/${type}/${memberId}?schoolId=${schoolId}&session=${session}`);
        dispatch({
            type: DELETE_ROUTE_ASSIGNMENT_SUCCESS,
            payload: {routeId, type, memberId}
        });
    } catch (error) {
        dispatch({
            type: DELETE_ROUTE_ASSIGNMENT_FAILURE,
            payload: error.message
        });
        throw error;
    }
}; 