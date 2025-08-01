import {createAsyncThunk} from '@reduxjs/toolkit';
import {api, generatePassword, selectSchoolDetails} from "../../../../common";

export const fetchStudents = createAsyncThunk('students/fetchStudents', async (_, thunkAPI) => {
    const {getState} = thunkAPI;
    const userData = selectSchoolDetails(getState());  // Get session and schoolId from Redux store
    const schoolId = userData.id;
    const session = userData.session;

    // Pass session and schoolId as query parameters

    const response = await api.get(`/api/students/school/session?schoolId=${schoolId}&session=${session}`);

    return response.data;
});

export const saveStudent = createAsyncThunk(
    'students/saveStudent',
    async (student, thunkAPI) => {
        try {
            const {getState} = thunkAPI;
            const userData = selectSchoolDetails(getState());
            const schoolId = userData.id;
            const session = userData.session;
            let response;

            if (student.id) {
                response = await api.put(`/api/students/${student.id}`, student);
            } else {
                const password = generatePassword();
                student = {
                    ...student,
                    password,
                    session,
                    createdUserId: userData.createdUserId,
                    schoolId,
                };
                response = await api.post(`/api/students`, student);
            }

            if (!response || response.status !== 200 || response.data.error) {
                alert(response?.data?.message || 'An error occurred while saving the student.');
                return thunkAPI.rejectWithValue(response?.data);
            }

            return response.data;
        } catch (error) {
            alert(error.message || 'An unexpected error occurred.');
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const deleteStudent = createAsyncThunk('students/deleteStudent', async (id) => {
    await api.delete(`/api/students/${id}`);
    return id;
});
