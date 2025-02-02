import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
  endDate: new Date().toISOString(),
  currentRange: "1 Month",
};

const dateRangeSlice = createSlice({
  name: "dateRange",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate
      state.endDate = action.payload.endDate
      state.currentRange = action.payload.currentRange;
    },
  },
});

export const { setDateRange } = dateRangeSlice.actions;
export default dateRangeSlice.reducer;
