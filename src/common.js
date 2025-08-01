import axios from "axios";
import store from "./component/redux/store";

export const NODE_URL = "https://node.ummahhub.com";
export const baseURL = "https://api.hesabbook.com";
export const api = axios.create({
    baseURL: baseURL,
    headers: {
        Accept: "application/json, text/plain, */*",
    },
});
export const LOGINAPI = axios.create({
    baseURL: baseURL,
    headers: {
        Accept: "application/json, text/plain, */*",
    },
});
export const RESETPASSWORD = axios.create({
    baseURL: baseURL,
    headers: {
        Accept: "application/json, text/plain, */*",
    },
});
api.interceptors.request.use(
    (config) => {
        const token = store.getState().user.token; // Access token from Redux store
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export const generatePassword = () => {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:',.<>?";
    let password = "";
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};
export const selectUserActualData = (state) => state.userActual?.userData || {};
export const selectSchoolDetails = (state) => state.school?.schools || {};
export const emailAddressFromState = (state) =>
    state.email?.emailAddresses || [];
export const roles = [
    "admin",
    "super_admin",
    "student",
    "parents",
    "teacher",
    "driver",
    "co_driver",
];
export const noticeTypes = [
    "Information",
    "Appreciation",
    "Warning",
    "Announcement",
    "Complain",
    "Reminder",
];
