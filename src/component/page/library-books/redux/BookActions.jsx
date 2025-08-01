// Action Types
import {api, generatePassword, selectSchoolDetails} from "../../../../common";

export const CREATE_BOOK_REQUEST = "CREATE_BOOK_REQUEST";
export const CREATE_BOOK_SUCCESS = "CREATE_BOOK_SUCCESS";
export const CREATE_BOOK_FAILURE = "CREATE_BOOK_FAILURE";

export const FETCH_BOOK_REQUEST = "FETCH_BOOK_REQUEST";
export const FETCH_BOOK_SUCCESS = "FETCH_BOOK_SUCCESS";
export const FETCH_BOOK_FAILURE = "FETCH_BOOK_FAILURE";

export const UPDATE_BOOK_REQUEST = "UPDATE_BOOK_REQUEST";
export const UPDATE_BOOK_SUCCESS = "UPDATE_BOOK_SUCCESS";
export const UPDATE_BOOK_FAILURE = "UPDATE_BOOK_FAILURE";

export const DELETE_BOOK_REQUEST = "DELETE_BOOK_REQUEST";
export const DELETE_BOOK_SUCCESS = "DELETE_BOOK_SUCCESS";
export const DELETE_BOOK_FAILURE = "DELETE_BOOK_FAILURE";

export const BORROW_BOOK_REQUEST = "BORROW_BOOK_REQUEST";
export const BORROW_BOOK_SUCCESS = "BORROW_BOOK_SUCCESS";
export const BORROW_BOOK_FAILURE = "BORROW_BOOK_FAILURE";

export const CHECK_FINE_REQUEST = "CHECK_FINE_REQUEST";
export const CHECK_FINE_SUCCESS = "CHECK_FINE_SUCCESS";
export const CHECK_FINE_FAILURE = "CHECK_FINE_FAILURE";

export const RETURN_BOOK_REQUEST = "RETURN_BOOK_REQUEST";
export const RETURN_BOOK_SUCCESS = "RETURN_BOOK_SUCCESS";
export const RETURN_BOOK_FAILURE = "RETURN_BOOK_FAILURE";

// Action Creators
const createBookRequest = () => ({
    type: CREATE_BOOK_REQUEST,
});
const createBookSuccess = (data) => ({
    type: CREATE_BOOK_SUCCESS,
    payload: data,
});
const createBookFailure = (error) => ({
    type: CREATE_BOOK_FAILURE,
    payload: error,
});
const borrowBookRequest = () => ({
    type: BORROW_BOOK_REQUEST,
});
const borrowBookSuccess = (data) => ({
    type: BORROW_BOOK_SUCCESS,
    payload: data,
});
const borrowBookFailure = (error) => ({
    type: BORROW_BOOK_FAILURE,
    payload: error,
});

const fetchBookRequest = () => ({
    type: FETCH_BOOK_REQUEST,
});
const fetchBookSuccess = (data) => ({
    type: FETCH_BOOK_SUCCESS,
    payload: data,
});
const fetchBookFailure = (error) => ({
    type: FETCH_BOOK_FAILURE,
    payload: error,
});

const updateBookRequest = () => ({type: UPDATE_BOOK_REQUEST});
const updateBookSuccess = (data) => ({
    type: UPDATE_BOOK_SUCCESS,
    payload: data,
});
const updateBookFailure = (error) => ({
    type: UPDATE_BOOK_FAILURE,
    payload: error,
});

const deleteBookRequest = () => ({type: DELETE_BOOK_REQUEST});
const deleteBookSuccess = (id) => ({
    type: DELETE_BOOK_SUCCESS,
    payload: id,
});
const deleteBookFailure = (error) => ({
    type: DELETE_BOOK_FAILURE,
    payload: error,
});

//fine check
const checkFineOnBorrowBookRequest = () => ({
    type: CHECK_FINE_REQUEST,
});
const checkFineOnBorrowBookSuccess = (data) => ({
    type: CHECK_FINE_SUCCESS,
    payload: data,
});
const checkFineOnBorrowBookFailure = (error) => ({
    type: CHECK_FINE_FAILURE,
    payload: error,
});
// return book
//fine check
const returnBorrowBookRequest = () => ({
    type: RETURN_BOOK_REQUEST,
});
const returnBorrowBookSuccess = (data) => ({
    type: RETURN_BOOK_SUCCESS,
    payload: data,
});
const returnBorrowBookFailure = (error) => ({
    type: RETURN_BOOK_FAILURE,
    payload: error,
});
// Async Action Creators
export const createBook = (bookData) => {
    return async (dispatch, getState) => {
        dispatch(createBookRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const password = generatePassword();
            bookData["password"] = password;
            bookData["session"] = userData.session;
            bookData["createdUserId"] = userData.createdUserId;
            bookData["schoolId"] = userData.id;
            const response = await api.post("/api/books", bookData);
            dispatch(createBookSuccess(response.data));
        } catch (error) {
            dispatch(createBookFailure(error.message));
        }
    };
};
export const fetchBOOK = (schoolId, session) => {
    return async (dispatch) => {
        dispatch(fetchBookRequest());
        try {
            const response = await api.get("/api/books", {
                params: {schoolId, session}
            });
            dispatch(fetchBookSuccess(response.data));
        } catch (error) {
            dispatch(fetchBookFailure(error.message));
        }
    };
};

export const updateBook = (id, bookData) => {
    return async (dispatch, getState) => {
        dispatch(updateBookRequest());
        try {
            const userData = selectSchoolDetails(getState());
            bookData["session"] = userData.session;
            bookData["createdUserId"] = userData.createdUser;
            bookData["schoolId"] = userData.id;
            const response = await api.put(`/api/books/${id}`, bookData);
            dispatch(updateBookSuccess(response.data));
        } catch (error) {
            dispatch(updateBookFailure(error.message));
        }
    };
};

export const deleteBook = (id) => {
    return async (dispatch) => {
        dispatch(deleteBookRequest());
        try {
            await api.delete(`/api/books/${id}`);
            dispatch(deleteBookSuccess(id));
        } catch (error) {
            dispatch(deleteBookFailure(error.message));
        }
    };
};
export const createBorrowBook = (bookId, emailId) => {
    return async (dispatch, getState) => {
        dispatch(borrowBookRequest());
        try {
            const response = await api.post(
                `/api/books/borrow?bookId=${bookId}&emailId=${emailId}`,
                null
            );
            dispatch(borrowBookSuccess(response.data));
        } catch (error) {
            dispatch(borrowBookFailure(error.message));
        }
    };
};
export const checkFineOnBorrowBook = (bookId, emailId, submitDate) => {
    return async (dispatch, getState) => {
        console.log("checkFine on BookAction Page bookId::" + bookId);
        console.log("checkFine on BookAction Page emailId ::" + emailId);
        console.log("checkFine on BookAction Page submitDate ::" + submitDate);
        dispatch(checkFineOnBorrowBookRequest());
        try {
            const response = await api.get(
                `/api/books/check-fine?bookId=${bookId}&submitDate=${submitDate}`
            );
            console.log("check-fine response api response:::" + response.data);
            dispatch(checkFineOnBorrowBookSuccess(response.data));
        } catch (error) {
            dispatch(checkFineOnBorrowBookFailure(error.message));
        }
    };
};

export const returnBorrowBook = (bookId, submitDate, lateFine) => {
    return async (dispatch, getState) => {
        console.log("returnBorrowBook on BookAction Page lateFine ::" + lateFine);
        dispatch(returnBorrowBookRequest());
        try {
            const response = await api.post(
                `/api/books/return?bookId=${bookId}&submitDate=${submitDate}&lateFine=${lateFine}`,
                null
            );
            dispatch(returnBorrowBookSuccess(response.data));
        } catch (error) {
            dispatch(returnBorrowBookFailure(error.message));
        }
    };
};
