// .redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import heartRateReducer from "./heartRateSlice";

export const store = configureStore({
  reducer: {
    heartRate: heartRateReducer,
  },
});
