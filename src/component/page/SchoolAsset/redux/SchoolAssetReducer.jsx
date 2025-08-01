import {
    CREATE_SCHOOL_ASSET_FAILURE,
    CREATE_SCHOOL_ASSET_REQUEST,
    CREATE_SCHOOL_ASSET_SUCCESS,
    DELETE_SCHOOL_ASSET_FAILURE,
    DELETE_SCHOOL_ASSET_REQUEST,
    DELETE_SCHOOL_ASSET_SUCCESS,
    FETCH_SCHOOL_ASSETS_FAILURE,
    FETCH_SCHOOL_ASSETS_REQUEST,
    FETCH_SCHOOL_ASSETS_SUCCESS,
    UPDATE_SCHOOL_ASSET_FAILURE,
    UPDATE_SCHOOL_ASSET_REQUEST,
    UPDATE_SCHOOL_ASSET_SUCCESS,
} from "./SchoolAssetAction";

const initialState = {
    assetList: [],
    loading: false,
    error: '',
};

const schoolAssetReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_SCHOOL_ASSET_REQUEST:
        case FETCH_SCHOOL_ASSETS_REQUEST:
        case UPDATE_SCHOOL_ASSET_REQUEST:
        case DELETE_SCHOOL_ASSET_REQUEST:
            return {
                ...state,
                loading: true,
                // error: null,
            };

        case CREATE_SCHOOL_ASSET_SUCCESS:
            return {
                ...state,
                loading: false,
                assetList: [...state.assetList, action.payload], error: ''
            };

        case FETCH_SCHOOL_ASSETS_SUCCESS:
            return {
                ...state,
                loading: false,
                assetList: action.payload,
                error: ''
            };

        case UPDATE_SCHOOL_ASSET_SUCCESS:
            return {
                ...state,
                loading: false,
                assetList: state.assetList.map((Assets) =>
                    Assets.id === action.payload.id ? action.payload : Assets
                ),
                error: ''
            };

        case DELETE_SCHOOL_ASSET_SUCCESS:
            return {
                ...state,
                loading: false,
                assetList: state.assetList.filter(
                    (Assets) => Assets.id !== action.payload
                ),
                error: ''
            };

        case CREATE_SCHOOL_ASSET_FAILURE:
        case FETCH_SCHOOL_ASSETS_FAILURE:
        case UPDATE_SCHOOL_ASSET_FAILURE:
        case DELETE_SCHOOL_ASSET_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default schoolAssetReducer;

