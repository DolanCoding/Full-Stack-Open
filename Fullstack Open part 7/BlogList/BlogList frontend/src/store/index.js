import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import blogsReducer from "./blogsSlice";
import userReducer from "./userSlice";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    blogs: blogsReducer,
    user: userReducer,
    // Add your reducers here
  },
});

export default store;
