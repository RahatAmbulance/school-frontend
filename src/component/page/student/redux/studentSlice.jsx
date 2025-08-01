import {createSlice} from '@reduxjs/toolkit';
import {deleteStudent, fetchStudents, saveStudent} from './studentActions';

const studentSlice = createSlice({
    name: 'students',
    initialState: {
        students: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.students = action.payload;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(saveStudent.fulfilled, (state, action) => {
                const index = state.students.findIndex((student) => student.id === action.payload.id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                } else {
                    state.students.push(action.payload);
                }
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.students = state.students.filter((student) => student.id !== action.payload);
            });
    },
});

export default studentSlice.reducer;
