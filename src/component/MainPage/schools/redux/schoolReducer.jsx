// src/reducers/schoolReducer.js
import {
    ADD_SCHOOL_FAILURE,
    ADD_SCHOOL_REQUEST,
    ADD_SCHOOL_SUCCESS,
    CLEAR_SELECTED_SCHOOL,
    DELETE_SCHOOL_FAILURE,
    DELETE_SCHOOL_REQUEST,
    DELETE_SCHOOL_SUCCESS,
    FETCH_SCHOOLS_FAILURE,
    FETCH_SCHOOLS_REQUEST,
    FETCH_SCHOOLS_SUCCESS,
    RESET_SCHOOL_FORM,
    SET_SELECTED_SCHOOL,
    UPDATE_SCHOOL_FAILURE,
    UPDATE_SCHOOL_FIELD,
    UPDATE_SCHOOL_REQUEST,
    UPDATE_SCHOOL_SUCCESS,
} from './schoolActionTypes';

const initialState = {
    schools: [],
    selectedSchool: null,
    loading: false,
    error: null,
    form: {
        udiseCode: '',
        name: '',
        address: '',
        state: '',
        district: '',
        ruralUrban: '',
        pincode: '',
        city: '',
        residentialSchool: '',
        minoritySchool: '',
        schoolGroup: '',
    },
};

const schoolReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_SCHOOLS_REQUEST:
            return {...state, loading: true};
        case FETCH_SCHOOLS_SUCCESS:
            return {...state, schools: action.payload, loading: false};
        case FETCH_SCHOOLS_FAILURE:
            return {...state, error: action.error, loading: false};
        case ADD_SCHOOL_REQUEST:
        case UPDATE_SCHOOL_REQUEST:
        case DELETE_SCHOOL_REQUEST:
            return {...state, loading: true};
        case ADD_SCHOOL_SUCCESS:
        case UPDATE_SCHOOL_SUCCESS:
            return {...state, loading: false};
        case DELETE_SCHOOL_SUCCESS:
            return {
                ...state,
                schools: state.schools.filter(school => school.id !== action.payload),
                loading: false,
            };
        case ADD_SCHOOL_FAILURE:
        case UPDATE_SCHOOL_FAILURE:
        case DELETE_SCHOOL_FAILURE:
            return {...state, error: action.error, loading: false};
        case SET_SELECTED_SCHOOL:
            return {...state, selectedSchool: action.payload};
        case CLEAR_SELECTED_SCHOOL:
            return {...state, selectedSchool: null};
        case UPDATE_SCHOOL_FIELD:
            return {
                ...state,
                form: {
                    ...state.form,
                    [action.payload.name]: action.payload.value,
                },
            };
        case RESET_SCHOOL_FORM:
            return {...state, form: initialState.form};
        default:
            return state;
    }
};

export default schoolReducer;
