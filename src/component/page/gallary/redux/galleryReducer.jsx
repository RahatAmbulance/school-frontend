import {
    CREATE_GALLERY_FAILURE,
    CREATE_GALLERY_REQUEST,
    CREATE_GALLERY_SUCCESS,
    DELETE_GALLERY_FAILURE,
    DELETE_GALLERY_REQUEST,
    DELETE_GALLERY_SUCCESS,
    FETCH_GALLERY_FAILURE,
    FETCH_GALLERY_REQUEST,
    FETCH_GALLERY_SUCCESS,
    UPDATE_GALLERY_FAILURE,
    UPDATE_GALLERY_REQUEST,
    UPDATE_GALLERY_SUCCESS,
} from "./GalleryActions";

const initialState = {
    loading: false,
    galleryList: [],
    error: "",
};

const galleryReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_GALLERY_REQUEST:
        case FETCH_GALLERY_REQUEST:
        case UPDATE_GALLERY_REQUEST:
        case DELETE_GALLERY_REQUEST:
            return {...state, loading: true};
        case CREATE_GALLERY_SUCCESS:
            return {
                ...state,
                loading: false,
                galleryList: [...state.galleryList, action.payload],
                error: "",
            };
        case FETCH_GALLERY_SUCCESS:
            return {
                ...state,
                loading: false,
                galleryList: action.payload,
                error: "",
            };
        case UPDATE_GALLERY_SUCCESS:
            return {
                ...state,
                loading: false,
                galleryList: state.galleryList.filter((gallery) =>
                    gallery.id === action.payload.id ? action.payload : gallery
                ),
                error: "",
            };
        case DELETE_GALLERY_SUCCESS:
            return {
                ...state,
                loading: false,
                galleryList: state.galleryList.filter(
                    (gallery) => gallery.id !== action.payload
                ),
                error: "",
            };
        case CREATE_GALLERY_FAILURE:
        case FETCH_GALLERY_FAILURE:
        case UPDATE_GALLERY_FAILURE:
        case DELETE_GALLERY_FAILURE:
            return {...state, loading: false, error: action.payload};

        default:
            return state;
    }
};
export default galleryReducer;
