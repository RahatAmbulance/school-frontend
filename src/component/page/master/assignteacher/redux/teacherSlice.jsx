import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../../../../../common"; // Adjust import based on your API utility

// Fetch all teachers
export const fetchTeachers = createAsyncThunk("teacher/fetchTeachers", async () => {
    const response = await api.get("/api/teachers"); // API endpoint for getting all teachers
    return response.data;
});

// Fetch all classes
export const fetchClasses = createAsyncThunk("teacher/fetchClasses", async () => {
    const response = await api.get("/api/classes"); // API endpoint for getting all classes
    return response.data;
});

// Fetch sections for a specific class
export const fetchSections = createAsyncThunk("teacher/fetchSections", async (classId) => {
    const response = await api.get(`/api/classes/${classId}/sections`); // API endpoint for sections
    return response.data;
});

// Assign a teacher to a class and section
export const assignClassTeacher = createAsyncThunk(
    "teacher/assignClassTeacher",
    async (assignmentDetails) => {
        const response = await api.post("/api/teacher-assignment", assignmentDetails); // API endpoint for teacher assignment
        return response.data;
    }
);


export const getTeacherAssignments = createAsyncThunk(
    "teacher/getTeacherAssignments",
    async (params) => {
        const {schoolId, session, teacherId, teacherName, classId, sectionId, className} = params;
        const queryParams = new URLSearchParams({
            schoolId,
            session,
            ...(teacherId && {teacherId}),
            ...(teacherName && {teacherName}),
            ...(classId && {classId}),
            ...(sectionId && {sectionId}),
            ...(className && {className}),
        }).toString();
        const response = await api.get(`/api/teacher-assignment?${queryParams}`); // API endpoint for teacher assignments
        return response.data;
    }
);

const teacherSlice = createSlice({
    name: "teacher",
    initialState: {
        teachers: [],
        classes: [],
        sections: [],
        assignedTeacher: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeachers.fulfilled, (state, action) => {
                state.teachers = action.payload;
            })
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.classes = action.payload;
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.sections = action.payload;
            })
            .addCase(assignClassTeacher.fulfilled, (state, action) => {
                state.assignedTeacher = action.payload;
            })
            .addMatcher(
                (action) => action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith("/fulfilled"),
                (state) => {
                    state.loading = false;
                }
            );
    },
});

export default teacherSlice.reducer;
