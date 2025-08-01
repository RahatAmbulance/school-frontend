import {
    BORROW_BOOK_FAILURE,
    BORROW_BOOK_REQUEST,
    BORROW_BOOK_SUCCESS,
    CHECK_FINE_FAILURE,
    CHECK_FINE_REQUEST,
    CHECK_FINE_SUCCESS,
    CREATE_BOOK_FAILURE,
    CREATE_BOOK_REQUEST,
    CREATE_BOOK_SUCCESS,
    DELETE_BOOK_FAILURE,
    DELETE_BOOK_REQUEST,
    DELETE_BOOK_SUCCESS,
    FETCH_BOOK_FAILURE,
    FETCH_BOOK_REQUEST,
    FETCH_BOOK_SUCCESS,
    RETURN_BOOK_FAILURE,
    RETURN_BOOK_REQUEST,
    RETURN_BOOK_SUCCESS,
    UPDATE_BOOK_FAILURE,
    UPDATE_BOOK_REQUEST,
    UPDATE_BOOK_SUCCESS,
} from "./BookActions";

const initialState = {
    loading: false,
    bookList: [],
    error: "",
};

const bookReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_BOOK_REQUEST:
        case FETCH_BOOK_REQUEST:
        case UPDATE_BOOK_REQUEST:
        case DELETE_BOOK_REQUEST:
            return {...state, loading: true};
        case CREATE_BOOK_SUCCESS:
            return {
                ...state,
                loading: false,
                bookList: [...state.bookList, action.payload],
                error: "",
            };
        case FETCH_BOOK_SUCCESS:
            return {...state, loading: false, bookList: action.payload, error: ""};
        case UPDATE_BOOK_SUCCESS:
            return {
                ...state,
                loading: false,
                bookList: state.bookList.filter((book) =>
                    book.id === action.payload.id ? action.payload : book
                ),
                error: "",
            };
        case DELETE_BOOK_SUCCESS:
            return {
                ...state,
                loading: false,
                bookList: state.bookList.filter((book) => book.id !== action.payload),
                error: "",
            };
        case CREATE_BOOK_FAILURE:
        case FETCH_BOOK_FAILURE:
        case UPDATE_BOOK_FAILURE:
        case DELETE_BOOK_FAILURE:
            return {...state, loading: false, error: action.payload};
        case CHECK_FINE_REQUEST:
            return {...state, loading: false, bookList: action.payload, error: ""};
        case CHECK_FINE_SUCCESS:
            return {
                ...state,
                loading: false,
                bookList: state.book.bookList.map((BOOK) =>
                    BOOK.id === action.payload.id ? action.payload : BOOK
                ),
                error: "",
            };
        case CHECK_FINE_FAILURE:

        case RETURN_BOOK_REQUEST:
            return {...state, loading: false, bookList: action.payload, error: ""};
        case RETURN_BOOK_SUCCESS:
            return {
                ...state,
                loading: false,
                bookList: state.book.bookList.filter((book) =>
                    book.id === action.payload.id ? action.payload : book
                ),
                error: "",
            };
        case RETURN_BOOK_FAILURE:

        case BORROW_BOOK_REQUEST:
            return {...state, loading: false, bookList: action.payload, error: ""};
        case BORROW_BOOK_SUCCESS:
            return {
                ...state,
                loading: false,
                bookList: state.book.bookList.filter((book) =>
                    book.id === action.payload.id ? action.payload : book
                ),
                error: "",
            };
        case BORROW_BOOK_FAILURE:
        default:
            return state;
    }
};

export default bookReducer;
