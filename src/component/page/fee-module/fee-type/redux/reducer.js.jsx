// actions.js
import {api} from "../../../../../common";

export const ADD_FEE = 'ADD_FEE';
export const DELETE_FEE = 'DELETE_FEE';
export const UPDATE_FEE = 'UPDATE_FEE';
export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const FETCH_FEES = 'FETCH_FEES';
export const SET_LOADING = 'SET_LOADING';

export const addFee = (fee) => async (dispatch) => {
    dispatch({type: SET_LOADING, payload: true});
    dispatch({type: CLEAR_ERROR});

    try {
        const response = await api.post('/api/fees/type', fee);
        if (response.status === 200) {
            dispatch({
                type: ADD_FEE,
                payload: response.data
            });
            return true;
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error adding fee';
        dispatch({
            type: SET_ERROR,
            payload: errorMessage
        });
        return false;
    } finally {
        dispatch({type: SET_LOADING, payload: false});
    }
};

export const deleteFee = (feeId) => async (dispatch) => {
    dispatch({type: SET_LOADING, payload: true});
    dispatch({type: CLEAR_ERROR});

    try {
        const response = await api.delete(`/api/fees/type/${feeId}`);
        if (response.status === 200) {
            dispatch({
                type: DELETE_FEE,
                payload: feeId
            });
            return true;
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting fee';
        dispatch({
            type: SET_ERROR,
            payload: errorMessage
        });
        return false;
    } finally {
        dispatch({type: SET_LOADING, payload: false});
    }
};

export const updateFee = (feeId, fee) => async (dispatch) => {
    dispatch({type: SET_LOADING, payload: true});
    dispatch({type: CLEAR_ERROR});

    try {
        const response = await api.put(`/api/fees/type/${feeId}`, fee);
        if (response.status === 200) {
            dispatch({
                type: UPDATE_FEE,
                payload: {feeId, fee: response.data}
            });
            return true;
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error updating fee';
        dispatch({
            type: SET_ERROR,
            payload: errorMessage
        });
        return false;
    } finally {
        dispatch({type: SET_LOADING, payload: false});
    }
};

export const fetchFees = (schoolId, session) => async (dispatch) => {
    dispatch({type: SET_LOADING, payload: true});
    dispatch({type: CLEAR_ERROR});

    try {
        const response = await api.get(`/api/fees/type/school/session?schoolId=${schoolId}&session=${session}`);
        if (response.status === 200) {
            dispatch({
                type: FETCH_FEES,
                payload: response.data
            });
            return true;
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error fetching fees';
        dispatch({
            type: SET_ERROR,
            payload: errorMessage
        });
        return false;
    } finally {
        dispatch({type: SET_LOADING, payload: false});
    }
};

// reducer.js
const initialState = {
    fees: [],
    error: null,
    loading: false
};

const feeReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_FEE:
            return {
                ...state,
                fees: [...state.fees, action.payload],
                error: null
            };

        case DELETE_FEE:
            return {
                ...state,
                fees: state.fees.filter(fee => fee.id !== action.payload),
                error: null
            };

        case UPDATE_FEE:
            return {
                ...state,
                fees: state.fees.map(fee =>
                    fee.id === action.payload.feeId ? {...fee, ...action.payload.fee} : fee
                ),
                error: null
            };

        case FETCH_FEES:
            return {
                ...state,
                fees: action.payload,
                error: null
            };

        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };

        case CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        case SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        default:
            return state;
    }
};

export default feeReducer;