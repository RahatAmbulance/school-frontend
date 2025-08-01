import {
    ADD_ENQUIRY_SUCCESS,
    DELETE_ENQUIRY_SUCCESS,
    FETCH_ENQUIRIES_FAILURE,
    FETCH_ENQUIRIES_SUCCESS,
    UPDATE_ENQUIRY_SUCCESS
} from "./enquiryActions.js";


const initialState = {
    enquiries: [],
    error: null
};

const enquiryReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ENQUIRIES_SUCCESS:
            return {...state, enquiries: action.payload};
        case ADD_ENQUIRY_SUCCESS:
            return {...state, enquiries: [...state.enquiries, action.payload]};
        case UPDATE_ENQUIRY_SUCCESS:
            return {
                ...state,
                enquiries: state.enquiries.map(enquiry =>
                    enquiry.id === action.payload.id ? action.payload : enquiry
                ),
            };
        case DELETE_ENQUIRY_SUCCESS:
            return {
                ...state,
                enquiries: state.enquiries.filter(enquiry => enquiry.id !== action.payload),
            };
        case FETCH_ENQUIRIES_FAILURE:
            return {...state, error: action.payload};
        default:
            return state;
    }
};

export default enquiryReducer;
