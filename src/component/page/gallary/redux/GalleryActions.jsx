// Action Types
import {api, generatePassword, selectSchoolDetails, selectUserActualData,} from "../../../../common";

export const CREATE_GALLERY_REQUEST = "CREATE_GALLERY_REQUEST";
export const CREATE_GALLERY_SUCCESS = "CREATE_GALLERY_SUCCESS";
export const CREATE_GALLERY_FAILURE = "CREATE_GALLERY_FAILURE";

export const FETCH_GALLERY_REQUEST = "FETCH_GALLERY_REQUEST";
export const FETCH_GALLERY_SUCCESS = "FETCH_GALLERY_SUCCESS";
export const FETCH_GALLERY_FAILURE = "FETCH_GALLERY_FAILURE";

export const UPDATE_GALLERY_REQUEST = "UPDATE_GALLERY_REQUEST";
export const UPDATE_GALLERY_SUCCESS = "UPDATE_GALLERY_SUCCESS";
export const UPDATE_GALLERY_FAILURE = "UPDATE_GALLERY_FAILURE";

export const DELETE_GALLERY_REQUEST = "DELETE_GALLERY_REQUEST";
export const DELETE_GALLERY_SUCCESS = "DELETE_GALLERY_SUCCESS";
export const DELETE_GALLERY_FAILURE = "DELETE_GALLERY_FAILURE";

// Action Creators
const createGalleryRequest = () => ({
    type: CREATE_GALLERY_REQUEST,
});
const createGallerySuccess = (data) => ({
    type: CREATE_GALLERY_SUCCESS,
    payload: data,
});
const createGalleryFailure = (error) => ({
    type: CREATE_GALLERY_FAILURE,
    payload: error,
});
const fetchGalleryRequest = () => ({
    type: FETCH_GALLERY_REQUEST,
});
const fetchGallerySuccess = (data) => ({
    type: FETCH_GALLERY_SUCCESS,
    payload: data,
});
const fetchGalleryFailure = (error) => ({
    type: FETCH_GALLERY_FAILURE,
    payload: error,
});

const updateGalleryRequest = () => ({type: UPDATE_GALLERY_REQUEST});

const updateGallerySuccess = (data) => ({
    type: UPDATE_GALLERY_SUCCESS,
    payload: data,
});
const updateGalleryFailure = (error) => ({
    type: UPDATE_GALLERY_FAILURE,
    payload: error,
});

const deleteGalleryRequest = () => ({type: DELETE_GALLERY_REQUEST});
const deleteGallerySuccess = (id) => ({
    type: DELETE_GALLERY_SUCCESS,
    payload: id,
});
const deleteGalleryFailure = (error) => ({
    type: DELETE_GALLERY_FAILURE,
    payload: error,
});

// Async Action Creators
export const createGallery = (galleryData) => {
    return async (dispatch, getState) => {
        dispatch(createGalleryRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            const password = generatePassword();
            //galleryData["password"] = password;
            galleryData["session"] = userData.session;
            galleryData["createdUserId"] = userData.createdUserId;
            galleryData["schoolId"] = userData.id;
            galleryData["staffId"] = actualUsrData.tableId;
            galleryData["staffName"] = actualUsrData.tableName;
            const response = await api.post(
                "/api/gallery/createGallery",
                galleryData
            );
            dispatch(createGallerySuccess(response.data));
        } catch (error) {
            dispatch(createGalleryFailure(error.message));
        }
    };
};
export const fetchGallery = (schoolId, session) => {
    return async (dispatch) => {
        dispatch(fetchGalleryRequest());
        try {
            const response = await api.get("/api/gallery/schoolId/session", {
                params: {schoolId, session},
            });
            dispatch(fetchGallerySuccess(response.data));
        } catch (error) {
            dispatch(fetchGalleryFailure(error.message));
        }
    };
};

export const updateGallery = (id, galleryData) => {
    return async (dispatch, getState) => {
        dispatch(updateGalleryRequest());

        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            galleryData["session"] = userData.session;
            galleryData["createdUserId"] = userData.createdUser;
            galleryData["schoolId"] = userData.id;
            galleryData["staffId"] = actualUsrData.tableId;
            galleryData["staffName"] = actualUsrData.tableName;
            const response = await api.put(
                `/api/gallery/updateGallery/${id}`,
                galleryData
            );
            dispatch(updateGallerySuccess(response.data));
        } catch (error) {
            dispatch(updateGalleryFailure(error.message));
        }
    };
};

export const deleteGallery = (id) => {
    return async (dispatch) => {
        dispatch(deleteGalleryRequest());
        try {
            await api.delete(`/api/gallery/deleteDailyTask/${id}`);
            dispatch(deleteGallerySuccess(id));
        } catch (error) {
            dispatch(deleteGalleryFailure(error.message));
        }
    };
};
