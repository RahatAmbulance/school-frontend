// src/api.js
import {RESETPASSWORD} from "../../common";

export const resetPassword = async (email) => {
    try {
        const response = await RESETPASSWORD.get(`/auth/reset-pwd-link`, {
            params: {email} // Pass email as a query parameter
        });
        return response.data; // Return the data from the response
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error; // Re-throw the error so the caller can handle it
    }
};

// Add more API functions as needed

