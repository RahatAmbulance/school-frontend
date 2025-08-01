import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";

// Action Types
export const CREATE_NOTIFICATION_REQUEST = 'CREATE_NOTIFICATION_REQUEST';
export const CREATE_NOTIFICATION_SUCCESS = 'CREATE_NOTIFICATION_SUCCESS';
export const CREATE_NOTIFICATION_FAILURE = 'CREATE_NOTIFICATION_FAILURE';

export const FETCH_NOTIFICATIONS_REQUEST = 'FETCH_NOTIFICATIONS_REQUEST';
export const FETCH_NOTIFICATIONS_SUCCESS = 'FETCH_NOTIFICATIONS_SUCCESS';
export const FETCH_NOTIFICATIONS_FAILURE = 'FETCH_NOTIFICATIONS_FAILURE';

// Action Creators
const createNotificationRequest = () => ({
    type: CREATE_NOTIFICATION_REQUEST
});

const createNotificationSuccess = (notification) => ({
    type: CREATE_NOTIFICATION_SUCCESS,
    payload: notification
});

const createNotificationFailure = (error) => ({
    type: CREATE_NOTIFICATION_FAILURE,
    payload: error
});

const fetchNotificationsRequest = () => ({
    type: FETCH_NOTIFICATIONS_REQUEST
});

const fetchNotificationsSuccess = (notifications) => ({
    type: FETCH_NOTIFICATIONS_SUCCESS,
    payload: notifications
});

const fetchNotificationsFailure = (error) => ({
    type: FETCH_NOTIFICATIONS_FAILURE,
    payload: error
});

// Helper function to convert date to IST
const convertToIST = (date) => {
    return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
};

// Helper function to validate and format filters
const validateAndFormatFilters = (filters) => {
    const validatedFilters = {};

    if (filters?.type && filters.type !== 'all') {
        validatedFilters.type = filters.type;
    }

    if (filters?.className && typeof filters.className === 'string' && filters.className.trim()) {
        validatedFilters.className = filters.className.trim();
    }

    if (filters?.section && typeof filters.section === 'string' && filters.section.trim()) {
        validatedFilters.section = filters.section.trim();
    }

    return validatedFilters;
};

// Thunk Actions
export const createNotification = (notificationData) => {
    return async (dispatch, getState) => {
        dispatch(createNotificationRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());

            // Format the notification data according to API requirements
            const payload = {
                ...notificationData,
                id: 0, // API will assign the actual ID
                schoolId: userData.id,
                session: userData.session,
                createDateTime: new Date().toISOString(), // This will be in UTC
                halfDay: notificationData.isHalfDay // Map isHalfDay to halfDay for API
            };

            const response = await api.post('/api/notifications', payload);
            dispatch(createNotificationSuccess(response.data));
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create notification';
            dispatch(createNotificationFailure(errorMessage));
            throw new Error(errorMessage);
        }
    };
};

export const fetchNotifications = (schoolId, session, filters = {}) => {
    return async (dispatch) => {
        if (!schoolId || !session) {
            dispatch(fetchNotificationsFailure('School ID and session are required'));
            return;
        }

        dispatch(fetchNotificationsRequest());
        try {
            // Validate and format filters
            const validatedFilters = validateAndFormatFilters(filters);

            // Construct query parameters
            const queryParams = new URLSearchParams({
                schoolId,
                session,
                ...validatedFilters
            });

            const response = await api.get(`/api/notifications/school/session?${queryParams.toString()}`);

            if (!Array.isArray(response.data)) {
                throw new Error('Invalid response format from server');
            }

            // Sort notifications by date in descending order (newest first)
            // Convert dates to IST before comparing
            const sortedNotifications = response.data.sort((a, b) => {
                const dateA = new Date(a.createDateTime);
                const dateB = new Date(b.createDateTime);
                return dateB.getTime() - dateA.getTime();
            });

            dispatch(fetchNotificationsSuccess(sortedNotifications));
            return sortedNotifications;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notifications';
            dispatch(fetchNotificationsFailure(errorMessage));
            throw new Error(errorMessage);
        }
    };
}; 