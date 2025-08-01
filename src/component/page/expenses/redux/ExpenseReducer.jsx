import {
    CREATE_EXPENSE_FAILURE,
    CREATE_EXPENSE_REQUEST,
    CREATE_EXPENSE_SUCCESS,
    DELETE_EXPENSE_FAILURE,
    DELETE_EXPENSE_REQUEST,
    DELETE_EXPENSE_SUCCESS,
    FETCH_EXPENSES_FAILURE,
    FETCH_EXPENSES_REQUEST,
    FETCH_EXPENSES_SUCCESS,
} from './ExpenseAction';

const initialState = {
    expenses: [],
    loading: false,
    error: null,
    createLoading: false,
    fetchLoading: false
};

const expenseReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_EXPENSE_REQUEST:
            return {
                ...state,
                createLoading: true,
                error: null
            };

        case CREATE_EXPENSE_SUCCESS:
            return {
                ...state,
                createLoading: false,
                expenses: [...state.expenses, action.payload],
                error: null
            };

        case CREATE_EXPENSE_FAILURE:
            return {
                ...state,
                createLoading: false,
                error: action.payload
            };

        case FETCH_EXPENSES_REQUEST:
            return {
                ...state,
                fetchLoading: true,
                error: null
            };

        case FETCH_EXPENSES_SUCCESS:
            return {
                ...state,
                fetchLoading: false,
                expenses: action.payload,
                error: null
            };

        case FETCH_EXPENSES_FAILURE:
            return {
                ...state,
                fetchLoading: false,
                error: action.payload
            };
        case DELETE_EXPENSE_REQUEST:
            return {
                ...state,
                deleteLoading: true,
                deleteError: null
            };

        case DELETE_EXPENSE_SUCCESS:
            return {
                ...state,
                deleteLoading: false,
                expenses: state.expenses.filter(expense => expense.id !== action.payload),
                deleteError: null
            };

        case DELETE_EXPENSE_FAILURE:
            return {
                ...state,
                deleteLoading: false,
                deleteError: action.payload
            };
        default:
            return state;
    }
};

export default expenseReducer;