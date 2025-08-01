import {
    CREATE_DAILYTASK_FAILURE,
    CREATE_DAILYTASK_REQUEST,
    CREATE_DAILYTASK_SUCCESS,
    DELETE_DAILYTASK_FAILURE,
    DELETE_DAILYTASK_REQUEST,
    DELETE_DAILYTASK_SUCCESS,
    FETCH_DAILYTASK_FAILURE,
    FETCH_DAILYTASK_REQUEST,
    FETCH_DAILYTASK_SUCCESS,
    UPDATE_DAILYTASK_FAILURE,
    UPDATE_DAILYTASK_REQUEST,
    UPDATE_DAILYTASK_SUCCESS,
} from "./DailyTaskActions";

const initialState = {
    loading: false,
    dailyTaskList: [],
    error: "",
};

const dailyTaskReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_DAILYTASK_REQUEST:
        case FETCH_DAILYTASK_REQUEST:
        case UPDATE_DAILYTASK_REQUEST:
        case DELETE_DAILYTASK_REQUEST:
            return {...state, loading: true};
        case CREATE_DAILYTASK_SUCCESS:
            return {
                ...state,
                loading: false,
                dailyTaskList: [...state.dailyTaskList, action.payload],
                error: "",
            };
        case FETCH_DAILYTASK_SUCCESS:
            return {
                ...state,
                loading: false,
                dailyTaskList: action.payload,
                error: "",
            };
        case UPDATE_DAILYTASK_SUCCESS:
            return {
                ...state,
                loading: false,
                dailyTaskList: state.dailyTaskList.filter((dailyTask) =>
                    dailyTask.id === action.payload.id ? action.payload : dailyTask
                ),
                error: "",
            };
        case DELETE_DAILYTASK_SUCCESS:
            return {
                ...state,
                loading: false,
                dailyTaskList: state.dailyTaskList.filter(
                    (dailyTask) => dailyTask.id !== action.payload
                ),
                error: "",
            };
        case CREATE_DAILYTASK_FAILURE:
        case FETCH_DAILYTASK_FAILURE:
        case UPDATE_DAILYTASK_FAILURE:
        case DELETE_DAILYTASK_FAILURE:
            return {...state, loading: false, error: action.payload};

        default:
            return state;
    }
};
export default dailyTaskReducer;
