import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {thunk} from "redux-thunk"; // Corrected import for thunk
import enquiryReducer from "../page/enquiry/redux/enquiryReducer";
import schoolReducer from "../MainPage/schools/redux/schoolReducer";
import staffReducer from "../page/staff/redux/staffReducer";
import vehicleReducer from "../../component/page/Transports/transport/redux/vehicleReducer.jsx"
import studentReducer from '../page/student/redux/studentSlice';
import userReducer from "../MainPage/redux/userSlice.js";
import userActualReducer from "../page/dashboard/redux/userReducer";
import {classesReducer} from "../page/master/classsection/redux/Reducer";
import religionReducer from "../page/master/religion/redux/religionReducer";
import roleReducer from "../page/master/roleresponsibility/redux/roleReducer";
import houseReducer from "../page/master/house/redux/reducer";
import masterReducer from "../page/dashboard/redux/masterReducer";
import attendanceReducer from "../page/attendance/redux/attendanceReducer";
import schoolInfoReducer from "../page/dashboard/redux/schoolReducer";
import bookReducer from "../page/library-books/redux/bookReducer.jsx";
import periodReducer from "../page/master/periods/redux/periodReducer";
import gradeReducer from "../page/master/grade/redux/gradeReducer.jsx"
import dailyTaskReducer from "../page/daily-task/redux/dailyTaskReducer.jsx";
import emailReducer from "../page/dashboard/redux/emailReducer.js";
import {studyMaterialReducer} from "../page/studymaterial/redux/studyMaterialReducer";
import galleryReducer from "../page/gallary/redux/galleryReducer.jsx";
import SchoolAssetReducer from "../page/SchoolAsset/redux/SchoolAssetReducer.jsx";
import StaffSalaryReducer from "../page/StaffSalary/Redux/StaffSalaryReducer.jsx";
import questionSlice from "../page/questionmcq/redux/questionSlice";
import teacherSlice from "../page/master/assignteacher/redux/teacherSlice";
import feeReducer from "../page/fee-module/fee-type/redux/reducer.js";
import feeAmountSlice from "../page/fee-module/fee-amout-set/redux/feeAmountSlice.jsx";
import chatReducer from "../page/communication/redux/reducers/chatReducer";
// import help&SupportReducer from "../page/help&support/redux/help&SupportReducer.jsx"
import HelpSupportReducer from "../page/help&support/redux/HelpSupportReducer.jsx"
import expenseReducer from "../page/expenses/redux/ExpenseReducer.jsx";
import pickupReducer from "../page/Transports/Pickup/redux/PickupReducer.jsx";
import notificationReducer from "../page/notification/redux/notificationReducer";
import assignmentReducer from '../page/Transports/transport/redux/assignmentReducer';
import routeReducer from '../page/Transports/transport/redux/routeReducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const rootReducer = combineReducers({
    enquiries: enquiryReducer,
    school: schoolReducer,
    staff: staffReducer,
    vehicles: vehicleReducer,
    students: studentReducer,
    user: userReducer,
    userActual: userActualReducer,
    classes: classesReducer,
    religion: religionReducer,
    roles: roleReducer,
    house: houseReducer,
    master: masterReducer,
    period: periodReducer,
    grade: gradeReducer,
    attendance: attendanceReducer,
    schoolInfo: schoolInfoReducer,
    book: bookReducer,
    dailyTask: dailyTaskReducer,
    email: emailReducer,
    studyMaterial: studyMaterialReducer,
    gallery: galleryReducer,
    questions: questionSlice,
    Assets: SchoolAssetReducer,
    salary: StaffSalaryReducer,
    teacherAssign: teacherSlice,
    feeType: feeReducer,
    feeAmount: feeAmountSlice,
    allDetails: chatReducer,
    tickets: HelpSupportReducer,
    expenses: expenseReducer,
    pickups: pickupReducer,
    notifications: notificationReducer,
    assignments: assignmentReducer,
    routes: routeReducer,
});

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
export default store;
