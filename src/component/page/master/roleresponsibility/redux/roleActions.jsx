// roleActions.js
import {api} from "../../../../../common";

export const FETCH_ROLES_REQUEST = 'FETCH_ROLES_REQUEST';
export const FETCH_ROLES_SUCCESS = 'FETCH_ROLES_SUCCESS';
export const FETCH_ROLES_FAILURE = 'FETCH_ROLES_FAILURE';
export const ADD_ROLE = 'ADD_ROLE';
export const DELETE_ROLE = 'DELETE_ROLE';

// Action creators
export const fetchRolesRequest = () => ({type: FETCH_ROLES_REQUEST});
export const fetchRolesSuccess = (roles) => ({type: FETCH_ROLES_SUCCESS, payload: roles});
export const fetchRolesFailure = (error) => ({type: FETCH_ROLES_FAILURE, payload: error});

export const addRole = (role) => ({type: ADD_ROLE, payload: role});
export const removeRole = (roleId) => ({type: DELETE_ROLE, payload: roleId});

export const fetchRoles = (schoolId, session) => async (dispatch) => {
    dispatch(fetchRolesRequest());
    try {
        const response = await api.get('/api/master/roles', {
            params: {schoolId, session}
        });
        dispatch(fetchRolesSuccess(response.data));
    } catch (error) {
        dispatch(fetchRolesFailure(error.message));
    }
};

export const createRole = (roleData) => async (dispatch) => {
    try {
        const response = await api.post('/api/master/roles', roleData);
        dispatch(addRole(response.data));
    } catch (error) {
        console.error('Error creating role:', error);
    }
};

export const deleteRole = (roleId) => async (dispatch) => {
    try {
        await api.delete(`/api/master/roles/${roleId}`);
        dispatch(removeRole(roleId));
    } catch (error) {
        console.error('Error deleting role:', error);
    }
};
