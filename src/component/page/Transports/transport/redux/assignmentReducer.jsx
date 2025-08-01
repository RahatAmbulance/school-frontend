import {
    DELETE_ROUTE_ASSIGNMENT_FAILURE,
    DELETE_ROUTE_ASSIGNMENT_REQUEST,
    DELETE_ROUTE_ASSIGNMENT_SUCCESS,
    FETCH_ROUTE_ASSIGNMENTS_FAILURE,
    FETCH_ROUTE_ASSIGNMENTS_REQUEST,
    FETCH_ROUTE_ASSIGNMENTS_SUCCESS,
    REMOVE_FROM_ROUTE_FAILURE,
    REMOVE_FROM_ROUTE_REQUEST,
    REMOVE_FROM_ROUTE_SUCCESS,
    SAVE_ROUTE_ASSIGNMENTS_FAILURE,
    SAVE_ROUTE_ASSIGNMENTS_REQUEST,
    SAVE_ROUTE_ASSIGNMENTS_SUCCESS
} from './assignmentActions';

const initialState = {
    assignments: {},
    loading: false,
    error: null
};

const assignmentReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVE_ROUTE_ASSIGNMENTS_REQUEST:
        case FETCH_ROUTE_ASSIGNMENTS_REQUEST:
        case DELETE_ROUTE_ASSIGNMENT_REQUEST:
        case REMOVE_FROM_ROUTE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case SAVE_ROUTE_ASSIGNMENTS_SUCCESS:
            return {
                ...state,
                loading: false,
                assignments: {
                    ...state.assignments,
                    [action.payload.routeId]: {
                        ...state.assignments[action.payload.routeId],
                        ...action.payload,
                        assignedStudents: action.payload.assignedStudents || [],
                        assignedStaff: action.payload.assignedStaff || []
                    }
                }
            };

        case FETCH_ROUTE_ASSIGNMENTS_SUCCESS:
            // Handle both array and single object responses
            const newAssignments = Array.isArray(action.payload)
                ? action.payload.reduce((acc, assignment) => ({
                    ...acc,
                    [assignment.routeId]: {
                        ...state.assignments[assignment.routeId],
                        ...assignment,
                        assignedStudents: assignment.assignedStudents || [],
                        assignedStaff: assignment.assignedStaff || []
                    }
                }), {})
                : {
                    [action.payload.routeId]: {
                        ...state.assignments[action.payload.routeId],
                        ...action.payload,
                        assignedStudents: action.payload.assignedStudents || [],
                        assignedStaff: action.payload.assignedStaff || []
                    }
                };

            return {
                ...state,
                loading: false,
                assignments: {
                    ...state.assignments,
                    ...newAssignments
                }
            };

        case REMOVE_FROM_ROUTE_SUCCESS:
            return {
                ...state,
                loading: false,
                assignments: {
                    ...state.assignments,
                    [action.payload.routeId]: {
                        ...state.assignments[action.payload.routeId],
                        ...action.payload,
                        assignedStudents: action.payload.assignedStudents || [],
                        assignedStaff: action.payload.assignedStaff || []
                    }
                }
            };

        case DELETE_ROUTE_ASSIGNMENT_SUCCESS:
            const {routeId} = action.payload;
            const {[routeId]: _, ...remainingAssignments} = state.assignments;
            return {
                ...state,
                loading: false,
                assignments: remainingAssignments
            };

        case SAVE_ROUTE_ASSIGNMENTS_FAILURE:
        case FETCH_ROUTE_ASSIGNMENTS_FAILURE:
        case DELETE_ROUTE_ASSIGNMENT_FAILURE:
        case REMOVE_FROM_ROUTE_FAILURE:
            // Don't show error in UI, just log it to console
            console.error('Assignment operation failed:', action.payload);
            return {
                ...state,
                loading: false,
                error: null // Keep error null to prevent UI display
            };

        default:
            return state;
    }
};

export default assignmentReducer; 