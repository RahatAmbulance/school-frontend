import {api, selectSchoolDetails, selectUserActualData,} from "../../../../common";


// Action Types
export const CREATE_SCHOOL_ASSET_REQUEST = "CREATE_SCHOOL_ASSET_REQUEST";
export const CREATE_SCHOOL_ASSET_SUCCESS = "CREATE_SCHOOL_ASSET_SUCCESS";
export const CREATE_SCHOOL_ASSET_FAILURE = "CREATE_SCHOOL_ASSET_FAILURE";

export const FETCH_SCHOOL_ASSETS_REQUEST = "FETCH_SCHOOL_ASSETS_REQUEST";
export const FETCH_SCHOOL_ASSETS_SUCCESS = "FETCH_SCHOOL_ASSETS_SUCCESS";
export const FETCH_SCHOOL_ASSETS_FAILURE = "FETCH_SCHOOL_ASSETS_FAILURE";

export const UPDATE_SCHOOL_ASSET_REQUEST = "UPDATE_SCHOOL_ASSET_REQUEST";
export const UPDATE_SCHOOL_ASSET_SUCCESS = "UPDATE_SCHOOL_ASSET_SUCCESS";
export const UPDATE_SCHOOL_ASSET_FAILURE = "UPDATE_SCHOOL_ASSET_FAILURE";

export const DELETE_SCHOOL_ASSET_REQUEST = "DELETE_SCHOOL_ASSET_REQUEST";
export const DELETE_SCHOOL_ASSET_SUCCESS = "DELETE_SCHOOL_ASSET_SUCCESS";
export const DELETE_SCHOOL_ASSET_FAILURE = "DELETE_SCHOOL_ASSET_FAILURE";


// Action Creators
const createSchoolAssetRequest = () => ({type: CREATE_SCHOOL_ASSET_REQUEST});
const createSchoolAssetSuccess = (data) => ({
    type: CREATE_SCHOOL_ASSET_SUCCESS,
    payload: data,
});
const createSchoolAssetFailure = (error) => ({
    type: CREATE_SCHOOL_ASSET_FAILURE,
    payload: error,
});

const fetchSchoolAssetsRequest = () => ({type: FETCH_SCHOOL_ASSETS_REQUEST});
const fetchSchoolAssetsSuccess = (data) => ({
    type: FETCH_SCHOOL_ASSETS_SUCCESS,
    payload: data,
});
const fetchSchoolAssetsFailure = (error) => ({
    type: FETCH_SCHOOL_ASSETS_FAILURE,
    payload: error,
});


const updateSchoolAssetRequest = () => ({type: UPDATE_SCHOOL_ASSET_REQUEST});
const updateSchoolAssetSuccess = (data) => ({
    type: UPDATE_SCHOOL_ASSET_SUCCESS,
    payload: data,
});
const updateSchoolAssetFailure = (error) => ({
    type: UPDATE_SCHOOL_ASSET_FAILURE,
    payload: error,
});

const deleteSchoolAssetRequest = () => ({type: DELETE_SCHOOL_ASSET_REQUEST});
const deleteSchoolAssetSuccess = (id) => ({
    type: DELETE_SCHOOL_ASSET_SUCCESS,
    payload: id,
});
const deleteSchoolAssetFailure = (error) => ({
    type: DELETE_SCHOOL_ASSET_FAILURE,
    payload: error,
});

// Async Action Creators
export const createSchoolAsset = (schoolAsset) => {
    return async (dispatch, getState) => {
        dispatch(createSchoolAssetRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            schoolAsset["session"] = userData.session;
            schoolAsset["schoolId"] = userData.id;
            schoolAsset["staffId"] = actualUsrData.tableId;
            schoolAsset["staffName"] = actualUsrData.tableName;

            const response = await api.post("/api/school-assets/add", schoolAsset);
            dispatch(createSchoolAssetSuccess(response.data));
        } catch (error) {
            dispatch(createSchoolAssetFailure(error.message));
        }
    };
};


export const fetchSchoolAssets = (schoolId, session) => {
    return async (dispatch) => {
        dispatch(fetchSchoolAssetsRequest());
        console.log("fetchassets", schoolId, session)
        try {
            const response = await api.get("/api/school-assets/school/session", {
                params: {schoolId, session},
            });
            dispatch(fetchSchoolAssetsSuccess(response.data));
        } catch (error) {
            dispatch(fetchSchoolAssetsFailure(error.message));
        }
    };
};

export const updateSchoolAsset = (id, schoolAsset) => {
    return async (dispatch, getState) => {
        dispatch(updateSchoolAssetRequest());
        try {
            const userData = selectSchoolDetails(getState());
            const actualUsrData = selectUserActualData(getState());
            schoolAsset["schoolId"] = userData.id;
            schoolAsset["staffId"] = actualUsrData.tableId;
            schoolAsset["staffName"] = actualUsrData.tableName;
            schoolAsset["session"] = userData.session;

            const response = await api.put(
                `/api/school-assets/update/${id}`,
                schoolAsset
            );
            dispatch(updateSchoolAssetSuccess(response.data));
        } catch (error) {
            dispatch(updateSchoolAssetFailure(error.message));
        }
    };
};


export const deleteSchoolAsset = (id) => {
    return async (dispatch) => {
        dispatch(deleteSchoolAssetRequest());
        try {
            await api.delete(`/api/school-assets/${id}`);
            dispatch(deleteSchoolAssetSuccess(id));
        } catch (error) {
            dispatch(deleteSchoolAssetFailure(error.message));
        }
    };
};
