import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {api} from "../../../../common"; // Assuming 'common' contains API utility

// Fetch all questions
export const fetchQuestions = createAsyncThunk("questions/fetchQuestions", async () => {
    const data = await api("/api/question/getall"); // Fetch all questions from the API
    return data;
});

// Fetch subjects
export const fetchSubjects = createAsyncThunk("questions/fetchSubjects", async () => {
    const data = await api("/api/question/subjects"); // Fetch subjects
    return data;
});

// Fetch question sets
export const fetchQuestionSets = createAsyncThunk("questions/fetchQuestionSets", async (size) => {
    const data = await api(`/api/question/sets/${size}`); // Fetch question sets
    return data;
});

export const questionSlice = createSlice({
    name: "questions",
    initialState: {
        questions: [],
        subjects: [],
        questionSets: [],
        loading: false,
        error: null,
    },
    reducers: {
        addQuestion(state, action) {
            state.questions.push(action.payload);
        },
        editQuestion(state, action) {
            const index = state.questions.findIndex((q) => q.id === action.payload.id);
            state.questions[index] = action.payload;
        },
        deleteQuestion(state, action) {
            state.questions = state.questions.filter((q) => q.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.questions = action.payload;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.subjects = action.payload;
            })
            .addCase(fetchQuestionSets.fulfilled, (state, action) => {
                state.questionSets = action.payload;
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

export const {addQuestion, editQuestion, deleteQuestion} = questionSlice.actions;
export default questionSlice.reducer;
