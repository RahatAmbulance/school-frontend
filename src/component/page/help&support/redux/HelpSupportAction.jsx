import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";

// Action Types
export const CREATE_TICKET_REQUEST = "CREATE_TICKET_REQUEST";
export const CREATE_TICKET_SUCCESS = "CREATE_TICKET_SUCCESS";
export const CREATE_TICKET_FAILURE = "CREATE_TICKET_FAILURE";

export const UPDATE_TICKET_REQUEST = "UPDATE_TICKET_REQUEST";
export const UPDATE_TICKET_SUCCESS = "UPDATE_TICKET_SUCCESS";
export const UPDATE_TICKET_FAILURE = "UPDATE_TICKET_FAILURE";

export const FETCH_TICKET_BY_ID_REQUEST = "FETCH_TICKET_BY_ID_REQUEST";
export const FETCH_TICKET_BY_ID_SUCCESS = "FETCH_TICKET_BY_ID_SUCCESS";
export const FETCH_TICKET_BY_ID_FAILURE = "FETCH_TICKET_BY_ID_FAILURE";

export const FETCH_TICKETS_BY_SCHOOL_ID_REQUEST = "FETCH_TICKETS_BY_SCHOOL_ID_REQUEST";
export const FETCH_TICKETS_BY_SCHOOL_ID_SUCCESS = "FETCH_TICKETS_BY_SCHOOL_ID_SUCCESS";
export const FETCH_TICKETS_BY_SCHOOL_ID_FAILURE = "FETCH_TICKETS_BY_SCHOOL_ID_FAILURE";

export const FETCH_TICKETS_BY_SCHOOL_AND_STATUS_REQUEST = "FETCH_TICKETS_BY_SCHOOL_AND_STATUS_REQUEST";
export const FETCH_TICKETS_BY_SCHOOL_AND_STATUS_SUCCESS = "FETCH_TICKETS_BY_SCHOOL_AND_STATUS_SUCCESS";
export const FETCH_TICKETS_BY_SCHOOL_AND_STATUS_FAILURE = "FETCH_TICKETS_BY_SCHOOL_AND_STATUS_FAILURE";

// Action Creators
const createTicketRequest = () => ({type: CREATE_TICKET_REQUEST});
const createTicketSuccess = (data) => ({type: CREATE_TICKET_SUCCESS, payload: data});
const createTicketFailure = (error) => ({type: CREATE_TICKET_FAILURE, payload: error});

const updateTicketRequest = () => ({type: UPDATE_TICKET_REQUEST});
const updateTicketSuccess = (data) => ({type: UPDATE_TICKET_SUCCESS, payload: data});
const updateTicketFailure = (error) => ({type: UPDATE_TICKET_FAILURE, payload: error});

const fetchTicketByIdRequest = () => ({type: FETCH_TICKET_BY_ID_REQUEST});
const fetchTicketByIdSuccess = (data) => ({type: FETCH_TICKET_BY_ID_SUCCESS, payload: data});
const fetchTicketByIdFailure = (error) => ({type: FETCH_TICKET_BY_ID_FAILURE, payload: error});

const fetchTicketsBySchoolIdRequest = () => ({type: FETCH_TICKETS_BY_SCHOOL_ID_REQUEST});
const fetchTicketsBySchoolIdSuccess = (data) => ({type: FETCH_TICKETS_BY_SCHOOL_ID_SUCCESS, payload: data});
const fetchTicketsBySchoolIdFailure = (error) => ({type: FETCH_TICKETS_BY_SCHOOL_ID_FAILURE, payload: error});

const fetchTicketsBySchoolAndStatusRequest = () => ({type: FETCH_TICKETS_BY_SCHOOL_AND_STATUS_REQUEST});
const fetchTicketsBySchoolAndStatusSuccess = (data) => ({
    type: FETCH_TICKETS_BY_SCHOOL_AND_STATUS_SUCCESS,
    payload: data
});
const fetchTicketsBySchoolAndStatusFailure = (error) => ({
    type: FETCH_TICKETS_BY_SCHOOL_AND_STATUS_FAILURE,
    payload: error
});

// Async Action Creators
export const createTicket = (formData) => {
    return async (dispatch, getState) => {
        dispatch(createTicketRequest());
        try {
            const school = selectSchoolDetails(getState());
            const user = selectUserActualData(getState());

            // Map form data to API schema
            const payload = {
                subject: formData.category,       // Assuming category is the complaint type
                description: formData.description,
                status: "OPEN",
                priority: "MEDIUM",
                schoolId: school.id,
                session: school.session,
                createdBy: user.tableName,

            };
            const response = await api.post("/api/tickets/create", payload);
            dispatch(createTicketSuccess(response.data));
            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to create complaint';
            dispatch(createTicketFailure(errorMessage));
            throw error;
        }
    };
};
export const updateTicket = (ticketId, ticket) => {
    return async (dispatch, getState) => {
        dispatch(updateTicketRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());

            const ticketData = {
                ...ticket,
                schoolId: userData.id,
                staffId: actualUsrData.tableId,
                staffName: actualUsrData.tableName,
                session: userData.session,
            };

            const response = await api.put(`/api/tickets/update/${ticketId}`, ticketData);
            dispatch(updateTicketSuccess(response.data));
        } catch (error) {
            dispatch(updateTicketFailure(error.message));
        }
    };
};

export const fetchTicketById = (ticketId) => {
    return async (dispatch) => {
        dispatch(fetchTicketByIdRequest());
        try {
            const response = await api.get(`/api/tickets/${ticketId}`);
            dispatch(fetchTicketByIdSuccess(response.data));
        } catch (error) {
            dispatch(fetchTicketByIdFailure(error.message));
        }
    };
};

export const fetchTicketsBySchoolId = (schoolId) => {
    return async (dispatch) => {
        dispatch(fetchTicketsBySchoolIdRequest());
        try {
            const response = await api.get(`/api/tickets/school/${schoolId}`);
            dispatch(fetchTicketsBySchoolIdSuccess(response.data));
        } catch (error) {
            dispatch(fetchTicketsBySchoolIdFailure(error.message));
        }
    };
};

export const fetchTicketsBySchoolIdAndStatus = (schoolId, status) => {
    return async (dispatch) => {
        dispatch(fetchTicketsBySchoolAndStatusRequest());
        try {
            const response = await api.get(`/api/tickets/school/${schoolId}/status/${status}`);
            dispatch(fetchTicketsBySchoolAndStatusSuccess(response.data));
        } catch (error) {
            dispatch(fetchTicketsBySchoolAndStatusFailure(error.message));
        }
    };
};