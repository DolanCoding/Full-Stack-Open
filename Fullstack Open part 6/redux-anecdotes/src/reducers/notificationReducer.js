import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: "Welcome to Better Anecdotes!",
  reducers: {
    setNotificationText(state, action) {
      return action.payload;
    },
    clearNotification() {
      return "";
    },
  },
});

let timeoutId;
export const setNotification = (text, seconds) => (dispatch) => {
  dispatch(notificationSlice.actions.setNotificationText(text));
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    dispatch(notificationSlice.actions.clearNotification());
  }, seconds * 1000);
};

export default notificationSlice.reducer;
