import {ADD_MATERIAL, DELETE_MATERIAL, FETCH_MATERIALS, UPDATE_MATERIAL} from './studyMaterialActions';

const initialState = {
    materials: []
};

export const studyMaterialReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_MATERIALS:
            return {...state, materials: action.payload};
        case ADD_MATERIAL:
            return {...state, materials: [...state.materials, action.payload]};
        case UPDATE_MATERIAL:
            return {
                ...state,
                materials: state.materials.map((material) =>
                    material.id === action.payload.id ? action.payload : material
                )
            };
        case DELETE_MATERIAL:
            return {...state, materials: state.materials.filter((material) => material.id !== action.payload)};
        default:
            return state;
    }
};
