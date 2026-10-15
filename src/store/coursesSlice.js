import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCourses } from "../api/courseApi";
import { loadCoursesCache, saveCoursesCache } from "../utils/cacheStore";
export const loadCourses = createAsyncThunk(
  "courses/load",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCourses({});
    } catch (err) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  },
  {
    condition: (_, { getState }) => getState().courses.status !== "loading"
  }
);
const coursesSlice = createSlice({
  name: "courses",
  initialState: () => ({
    items: loadCoursesCache(),
    status: "idle", 
    error: ""
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCourses.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loadCourses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        saveCoursesCache(action.payload);
      })
      .addCase(loadCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error.message || "Something went wrong";
      });
  }
});
export default coursesSlice.reducer;
