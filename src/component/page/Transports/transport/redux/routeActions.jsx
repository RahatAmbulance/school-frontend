import {api} from '../../../../../common';

// Action Types
export const DELETE_ROUTE_REQUEST = 'DELETE_ROUTE_REQUEST';
export const DELETE_ROUTE_SUCCESS = 'DELETE_ROUTE_SUCCESS';
export const DELETE_ROUTE_FAILURE = 'DELETE_ROUTE_FAILURE';

// Action Creators
const deleteRouteRequest = () => ({type: DELETE_ROUTE_REQUEST});
const deleteRouteSuccess = (routeId) => ({
    type: DELETE_ROUTE_SUCCESS,
    payload: routeId
});
const deleteRouteFailure = (error) => ({
    type: DELETE_ROUTE_FAILURE,
    payload: error
});

// Delete Route Action
export const deleteRoute = (routeId, vehicleId, schoolId, session) => async (dispatch) => {
    dispatch(deleteRouteRequest());
    try {
        // Delete route and associated records
        await api.delete(`/api/routes/${routeId}`, {
            params: {
                vehicleId,
                schoolId,
                session
            }
        });

        // Delete route assignments
        await api.delete(`/api/route-assignments/${routeId}`, {
            params: {
                schoolId,
                session
            }
        });

        dispatch(deleteRouteSuccess(routeId));
        return routeId;
    } catch (error) {
        dispatch(deleteRouteFailure(error.message));
        throw error;
    }
}; 