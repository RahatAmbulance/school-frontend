import {combineReducers} from 'redux';
import complainReducer from './complainReducer'; // Import the complainReducer

const rootReducer = combineReducers({
    complaint: complainReducer, // Key here should match the state you're accessing in useSelector
});

export default rootReducer;
