import {
    CREATE_STAFF_SALARY_FAILURE,
    CREATE_STAFF_SALARY_REQUEST,
    CREATE_STAFF_SALARY_SUCCESS,
    DELETE_STAFF_SALARY_FAILURE,
    DELETE_STAFF_SALARY_REQUEST,
    DELETE_STAFF_SALARY_SUCCESS,
    FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_FAILURE,
    FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_REQUEST,
    FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_SUCCESS,
    UPDATE_STAFF_SALARY_FAILURE,
    UPDATE_STAFF_SALARY_REQUEST,
    UPDATE_STAFF_SALARY_SUCCESS
} from './StaffSalaryAction';

// Initial State
const initialState = {
    staffSalaries: [],
    loading: false,
    error: '',
};

// Reducer Function
const StaffSalaryReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_STAFF_SALARY_REQUEST:
        case FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_REQUEST:
        case UPDATE_STAFF_SALARY_REQUEST:
        case DELETE_STAFF_SALARY_REQUEST:

            return {
                ...state, loading: true,
                // error: null
            };

        case CREATE_STAFF_SALARY_SUCCESS:
            return {
                ...state,
                loading: false,
                staffSalaries: [...state.staffSalaries, action.payload],
                error: '',
            };


        case FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_SUCCESS:
            return {
                ...state,
                loading: false,
                staffSalaries: action.payload,
                error: '',
            };

        case UPDATE_STAFF_SALARY_SUCCESS:
            return {
                ...state,
                loading: false,
                staffSalaries: state.staffSalaries.filter((salary) =>
                    salary.id === action.payload.id ? action.payload : salary
                ),
                error: '',
            };

        case DELETE_STAFF_SALARY_SUCCESS:
            return {
                ...state,
                loading: false,
                staffSalaries: state.staffSalaries.filter((salary) => salary.id !== action.payload),
                error: ''
            };


        case CREATE_STAFF_SALARY_FAILURE:
        case FETCH_STAFF_SALARY_BY_SCHOOL_SESSION_FAILURE:
        case UPDATE_STAFF_SALARY_FAILURE:
        case DELETE_STAFF_SALARY_FAILURE:

            return {...state, loading: false, error: action.payload,};

        default:
            return state;
    }
};

export default StaffSalaryReducer;






