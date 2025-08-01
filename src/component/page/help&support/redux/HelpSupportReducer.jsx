import {
    CREATE_TICKET_FAILURE,
    CREATE_TICKET_REQUEST,
    CREATE_TICKET_SUCCESS,
    FETCH_TICKET_BY_ID_FAILURE,
    FETCH_TICKET_BY_ID_REQUEST,
    FETCH_TICKET_BY_ID_SUCCESS,
    FETCH_TICKETS_BY_SCHOOL_AND_STATUS_FAILURE,
    FETCH_TICKETS_BY_SCHOOL_AND_STATUS_REQUEST,
    FETCH_TICKETS_BY_SCHOOL_AND_STATUS_SUCCESS,
    FETCH_TICKETS_BY_SCHOOL_ID_FAILURE,
    FETCH_TICKETS_BY_SCHOOL_ID_REQUEST,
    FETCH_TICKETS_BY_SCHOOL_ID_SUCCESS,
    UPDATE_TICKET_FAILURE,
    UPDATE_TICKET_REQUEST,
    UPDATE_TICKET_SUCCESS,
} from "../redux/HelpSupportAction";

// Initial State
const initialState = {
    ticket: [], // List of tickets
    // ticket: null, // Single ticket details
    loading: false, // Loading state
    error: null, // Error message
};

// Reducer
const ticketReducer = (state = initialState, action) => {
    switch (action.type) {
        // Create Ticket
        case CREATE_TICKET_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case CREATE_TICKET_SUCCESS:
            return {
                ...state,
                loading: false,
                tickets: [...state.tickets, action.payload], // Add new ticket to the list
            };
        case CREATE_TICKET_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Update Ticket
        case UPDATE_TICKET_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case UPDATE_TICKET_SUCCESS:
            return {
                ...state,
                loading: false,
                tickets: state.tickets.map((ticket) =>
                    ticket.id === action.payload.id ? action.payload : ticket
                ), // Update the ticket in the list
            };
        case UPDATE_TICKET_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Fetch Ticket by ID
        case FETCH_TICKET_BY_ID_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_TICKET_BY_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                ticket: action.payload, // Set the single ticket details
            };
        case FETCH_TICKET_BY_ID_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Fetch Tickets by School ID
        case FETCH_TICKETS_BY_SCHOOL_ID_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_TICKETS_BY_SCHOOL_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                tickets: action.payload, // Set the list of tickets
            };
        case FETCH_TICKETS_BY_SCHOOL_ID_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Fetch Tickets by School ID and Status
        case FETCH_TICKETS_BY_SCHOOL_AND_STATUS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_TICKETS_BY_SCHOOL_AND_STATUS_SUCCESS:
            return {
                ...state,
                loading: false,
                tickets: action.payload, // Set the filtered list of tickets
            };
        case FETCH_TICKETS_BY_SCHOOL_AND_STATUS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Default Case
        default:
            return state;
    }
};

export default ticketReducer;