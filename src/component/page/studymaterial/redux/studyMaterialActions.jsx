import {api} from "../../../../common";


export const FETCH_MATERIALS = 'FETCH_MATERIALS';
export const ADD_MATERIAL = 'ADD_MATERIAL';
export const UPDATE_MATERIAL = 'UPDATE_MATERIAL';
export const DELETE_MATERIAL = 'DELETE_MATERIAL';

// Fetch all study materials
export const fetchMaterials = (schoolId) => async (dispatch) => {
    const response = await api.get('/api/study-materials/school', {
        params: {schoolId} // Pass schoolId as a query parameter
    });
    dispatch({type: FETCH_MATERIALS, payload: response.data});
};

// Add a new study material
export const addMaterial = (material) => async (dispatch) => {
    const response = await api.post('/api/study-materials', material);
    dispatch({type: ADD_MATERIAL, payload: response.data});
};

// Update study material
export const updateMaterial = (id, material) => async (dispatch) => {
    const response = await api.put(`/api/study-materials/${id}`, material);
    dispatch({type: UPDATE_MATERIAL, payload: response.data});
};

// Delete study material
export const deleteMaterial = (id) => async (dispatch) => {
    await api.delete(`/api/study-materials/${id}`);
    dispatch({type: DELETE_MATERIAL, payload: id});
};
