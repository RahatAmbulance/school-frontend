import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {api} from "../../../../../common";

const initialState = {
    feeAmounts: [],
    error: null,
    loading: false
};

export const fetchFeeAmountDetails = createAsyncThunk(
    'feeAmount/fetchFeeAmountDetails',
    async ({schoolId, session}, thunkAPI) => {
        try {
            const response = await api.get(`/api/fees/amount/school/session`, {params: {schoolId, session}});
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const addFeeAmount = createAsyncThunk(
    'feeAmount/addFeeAmount',
    async (newFees, thunkAPI) => {
        try {
            const response = await api.post(`/api/fees/amount`, newFees);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateFeeAmount = createAsyncThunk(
    'feeAmount/updateFeeAmount',
    async (updatedFee, thunkAPI) => {
        try {
            const response = await api.post(`/api/fees/amount/update`, updatedFee);
            // Return both the response data and the original fee ID for proper state update
            return {
                updatedFee: response.data,
                originalId: updatedFee.id
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteFeeAmount = createAsyncThunk(
    'feeAmount/deleteFeeAmount',
    async (feeId, thunkAPI) => {
        try {
            await api.delete(`/api/fees/amount/${feeId}`);
            return feeId;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const feeAmountSlice = createSlice({
    name: 'feeAmount',
    initialState,
    reducers: {
        setFeeAmounts: (state, action) => {
            state.feeAmounts = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cases
            .addCase(fetchFeeAmountDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeeAmountDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.feeAmounts = action.payload;
                state.error = null;
            })
            .addCase(fetchFeeAmountDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add cases
            .addCase(addFeeAmount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addFeeAmount.fulfilled, (state, action) => {
                state.loading = false;
                const newFees = Array.isArray(action.payload) ? action.payload : [action.payload];

                newFees.forEach(newFee => {
                    const existingIndex = state.feeAmounts.findIndex(fee =>
                        fee.id === newFee.id ||
                        (fee.selectedFee === newFee.selectedFee &&
                            fee.className === newFee.className &&
                            fee.session === newFee.session)
                    );

                    if (existingIndex !== -1) {
                        state.feeAmounts[existingIndex] = newFee;
                    } else {
                        state.feeAmounts.push(newFee);
                    }
                });

                state.error = null;
            })
            .addCase(addFeeAmount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update cases
            .addCase(updateFeeAmount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFeeAmount.fulfilled, (state, action) => {
                state.loading = false;
                const {updatedFee, originalId} = action.payload;

                const index = state.feeAmounts.findIndex(fee => fee.id === originalId);
                if (index !== -1) {
                    state.feeAmounts[index] = updatedFee;
                }

                state.error = null;
            })
            .addCase(updateFeeAmount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete cases
            .addCase(deleteFeeAmount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteFeeAmount.fulfilled, (state, action) => {
                state.loading = false;
                state.feeAmounts = state.feeAmounts.filter(fee => fee.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteFeeAmount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {setFeeAmounts} = feeAmountSlice.actions;
export default feeAmountSlice.reducer;