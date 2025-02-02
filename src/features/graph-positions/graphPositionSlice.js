import { createSlice } from '@reduxjs/toolkit';
import { fetchGraphPositions, saveGraphPositions } from './graphPositionThunk';

const initialState = {
  graphPositions: [],
  loading: false,
  error: null,
};

const graphPositionsSlice = createSlice({
  name: 'graphPositions',
  initialState,
  reducers: {
    setGraphPositions: (state, action) => {
      state.graphPositions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGraphPositions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGraphPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.graphPositions = action.payload;
      })
      .addCase(fetchGraphPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveGraphPositions.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveGraphPositions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveGraphPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setGraphPositions } = graphPositionsSlice.actions;

export default graphPositionsSlice.reducer;

