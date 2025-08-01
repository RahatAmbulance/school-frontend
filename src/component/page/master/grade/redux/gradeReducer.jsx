import {
    ADD_GRADE,
    DELETE_GRADE,
    FETCH_GRADES_FAILURE,
    FETCH_GRADES_REQUEST,
    FETCH_GRADES_SUCCESS,
} from './gradeActions';

const initialState = {
    grades: [],
    loading: false,
    error: null,
};

const gradeReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_GRADES_REQUEST:
            return {...state, loading: true};
        case FETCH_GRADES_SUCCESS:
            return {...state, loading: false, grades: action.payload};
        case FETCH_GRADES_FAILURE:
            return {...state, loading: false, error: action.payload};
        case ADD_GRADE:
            console.log('Previous State:', state.grades);
            const updatedGrades = [...state.grades, action.payload];
            console.log('Updated State:', updatedGrades);
            return {...state, grades: updatedGrades};
        case DELETE_GRADE:
            return {
                ...state,
                grades: state.grades.filter(grade => grade.id !== action.payload),
            };
        default:
            return state;
    }
};

export default gradeReducer;


