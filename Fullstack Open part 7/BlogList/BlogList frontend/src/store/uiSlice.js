import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notification: { message: "", type: "" },
  showRegister: false,
  loading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setNotification(state, action) {
      state.notification = action.payload;
    },
    clearNotification(state) {
      state.notification = { message: "", type: "" };
    },
    setShowRegister(state, action) {
      state.showRegister = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const {
  setNotification,
  clearNotification,
  setShowRegister,
  setLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
