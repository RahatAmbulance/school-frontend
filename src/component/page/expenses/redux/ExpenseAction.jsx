import {api, selectSchoolDetails, selectUserActualData} from '../../../../common';
// Expense Action Types
export const CREATE_EXPENSE_REQUEST = "CREATE_EXPENSE_REQUEST";
export const CREATE_EXPENSE_SUCCESS = "CREATE_EXPENSE_SUCCESS";
export const CREATE_EXPENSE_FAILURE = "CREATE_EXPENSE_FAILURE";

export const FETCH_EXPENSES_REQUEST = "FETCH_EXPENSES_REQUEST";
export const FETCH_EXPENSES_SUCCESS = "FETCH_EXPENSES_SUCCESS";
export const FETCH_EXPENSES_FAILURE = "FETCH_EXPENSES_FAILURE";
export const DELETE_EXPENSE_REQUEST = "DELETE_EXPENSE_REQUEST";
export const DELETE_EXPENSE_SUCCESS = "DELETE_EXPENSE_SUCCESS";
export const DELETE_EXPENSE_FAILURE = "DELETE_EXPENSE_FAILURE";

// Synchronous Action Creators
const createExpenseRequest = () => ({type: CREATE_EXPENSE_REQUEST});
const createExpenseSuccess = (data) => ({
    type: CREATE_EXPENSE_SUCCESS,
    payload: data,
});
const createExpenseFailure = (error) => ({
    type: CREATE_EXPENSE_FAILURE,
    payload: error,
});

const fetchExpensesRequest = () => ({type: FETCH_EXPENSES_REQUEST});
const fetchExpensesSuccess = (data) => ({
    type: FETCH_EXPENSES_SUCCESS,
    payload: data,
});
const fetchExpensesFailure = (error) => ({
    type: FETCH_EXPENSES_FAILURE,
    payload: error,
});
const deleteExpenseRequest = () => ({type: DELETE_EXPENSE_REQUEST});
const deleteExpenseSuccess = (id) => ({
    type: DELETE_EXPENSE_SUCCESS,
    payload: id,
});
const deleteExpenseFailure = (error) => ({
    type: DELETE_EXPENSE_FAILURE,
    payload: error,
});

// Async Action Creators
export const createExpense = (expenseData) => {
    return async (dispatch, getState) => {
        dispatch(createExpenseRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());

            // Add contextual data to expense payload
            expenseData = {
                ...expenseData,
                session: userData.session,
                schoolId: userData.id,
                staffId: actualUsrData.tableId,
                staffName: actualUsrData.tableName
            };

            const response = await api.post("/api/expenses", expenseData);
            dispatch(createExpenseSuccess(response.data));
        } catch (error) {
            dispatch(createExpenseFailure(error.message));
        }
    };
};

export const fetchExpenses = (schoolId, session) => {
    return async (dispatch) => {
        dispatch(fetchExpensesRequest());
        try {
            const response = await api.get("/api/expenses", {
                params: {schoolId, session},
            });
            dispatch(fetchExpensesSuccess(response.data));
        } catch (error) {
            dispatch(fetchExpensesFailure(error.message));
        }
    };
};
export const deleteExpense = (id) => {
    return async (dispatch) => {
        dispatch(deleteExpenseRequest());
        try {
            await api.delete(`/api/expenses/${id}`);
            dispatch(deleteExpenseSuccess(id));
        } catch (error) {
            dispatch(deleteExpenseFailure(error.message));
            throw error; // Re-throw for handling in components
        }
    };
};
// export const filterExpenses = (filters) => {
// };