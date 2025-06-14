import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBlogs = createAsyncThunk("blogs/fetchBlogs", async () => {
  const response = await fetch("http://localhost:3003/api/blogs");
  const data = await response.json();
  // Sort blogs by likes descending
  return (Array.isArray(data) ? data : []).sort(
    (a, b) => (b.likes ?? 0) - (a.likes ?? 0)
  );
});

const initialState = [];

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setBlogs(state, action) {
      return action.payload;
    },
    addBlog(state, action) {
      state.unshift(action.payload);
    },
    updateBlog(state, action) {
      const updated = action.payload;
      return state.map((blog) =>
        (blog.id || blog._id) === (updated.id || updated._id) ? updated : blog
      );
    },
    removeBlog(state, action) {
      const id = action.payload;
      return state.filter((blog) => (blog.id || blog._id) !== id);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBlogs.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const { setBlogs, addBlog, updateBlog, removeBlog } = blogsSlice.actions;
export default blogsSlice.reducer;
