// .redux/heartRateSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
};

export const heartRateSlice = createSlice({
  name: "heartRate",
  initialState,
  reducers: {
    setHeartRate: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setHeartRate } = heartRateSlice.actions;

export default heartRateSlice.reducer;
