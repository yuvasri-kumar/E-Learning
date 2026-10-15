import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loadProgress } from "../utils/progressStore";
import { loadAssignments } from "../utils/cacheStore";
import {
  getEnrollments,
  createEnrollment,
  getProgress,
  patchProgress,
  getQuizResults,
  postQuizSubmission,
  getAssignments,
  postAssignment
} from "../api/learningApi";

function buildInitialState() {
  const saved = loadProgress();
  return {
    enrolledCourseIds: saved.enrolledCourseIds,
    completedLessons: saved.completedLessons,
    quizResults: saved.quizResults,
    assignments: loadAssignments(),
    status: "idle",
    error: "",
    loadRequestId: ""
  };
}

const failWith = (err, rejectWithValue) =>
  rejectWithValue(err.message || "Something went wrong");

// GET: everything the signed-in student has done so far
export const loadLearning = createAsyncThunk(
  "learning/load",
  async (_, { rejectWithValue }) => {
    try {
      const [enrollments, progress, quizResults, assignments] =
        await Promise.all([
          getEnrollments(),
          getProgress(),
          getQuizResults(),
          getAssignments()
        ]);
      const completedLessons = {};
      enrollments.forEach((e) => {
        completedLessons[e.courseId] = [];
      });
      progress.forEach((p) => {
        completedLessons[p.courseId] = p.completedLessons;
      });
      const results = {};
      quizResults.forEach(({ courseId, ...rest }) => {
        results[courseId] = rest;
      });
      return {
        enrolledCourseIds: enrollments.map((e) => e.courseId),
        completedLessons,
        quizResults: results,
        assignments
      };
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  },
  { condition: (_, { getState }) => getState().learning.status !== "loading" }
);

// POST: create an enrollment
export const enrollInCourse = createAsyncThunk(
  "learning/enroll",
  async (payload, { rejectWithValue }) => {
    try {
      return await createEnrollment(payload);
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  }
);

// PATCH: mark one lesson as completed
export const markLessonComplete = createAsyncThunk(
  "learning/markLesson",
  async ({ courseId, lessonId }, { rejectWithValue }) => {
    try {
      return await patchProgress(courseId, lessonId);
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  }
);

// POST: submit quiz answers (the server grades them)
export const submitQuizAttempt = createAsyncThunk(
  "learning/submitQuiz",
  async ({ courseId, answers }, { rejectWithValue }) => {
    try {
      return await postQuizSubmission(courseId, answers);
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  }
);

// POST: submit an assignment
export const submitAssignment = createAsyncThunk(
  "learning/submitAssignment",
  async (payload, { rejectWithValue }) => {
    try {
      return await postAssignment(payload);
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  }
);

const learningSlice = createSlice({
  name: "learning",
  initialState: buildInitialState,
  reducers: {
    enrollCourse(state, action) {
      const courseId = action.payload;
      if (!state.enrolledCourseIds.includes(courseId)) {
        state.enrolledCourseIds.push(courseId);
      }
      if (!state.completedLessons[courseId]) {
        state.completedLessons[courseId] = [];
      }
    },
    updateProgress(state, action) {
      const { courseId, lessonId } = action.payload;
      const done = state.completedLessons[courseId] || [];
      if (!done.includes(lessonId)) {
        state.completedLessons[courseId] = [...done, lessonId];
      }
    },
    saveQuizScore(state, action) {
      const { courseId, result } = action.payload;
      const old = state.quizResults[courseId];
      const attempts = (old && old.attempts ? old.attempts : old ? 1 : 0) + 1;
      const bestScore = old
        ? Math.max(old.bestScore ?? old.score, result.score)
        : result.score;
      state.quizResults[courseId] = {
        ...result,
        passed: result.passed || !!(old && old.passed),
        bestScore,
        attempts
      };
    },
    updateAssignment(state, action) {
      const assignment = action.payload;
      const index = state.assignments.findIndex((a) => a.id === assignment.id);
      if (index >= 0) {
        state.assignments[index] = { ...state.assignments[index], ...assignment };
      } else {
        state.assignments.unshift(assignment);
      }
    },
    // used on logout / expired session so one student never sees another's data
    resetLearning() {
      return {
        enrolledCourseIds: [],
        completedLessons: {},
        quizResults: {},
        assignments: [],
        status: "idle",
        error: "",
        loadRequestId: ""
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLearning.pending, (state, action) => {
        state.status = "loading";
        state.error = "";
        state.loadRequestId = action.meta.requestId;
      })
      .addCase(loadLearning.fulfilled, (state, action) => {
        if (state.loadRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.error = "";
        state.enrolledCourseIds = action.payload.enrolledCourseIds;
        state.completedLessons = action.payload.completedLessons;
        state.quizResults = action.payload.quizResults;
        state.assignments = action.payload.assignments;
      })
      .addCase(loadLearning.rejected, (state, action) => {
        if (state.loadRequestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error =
          action.payload || action.error.message || "Something went wrong";
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        const { courseId } = action.payload;
        if (!state.enrolledCourseIds.includes(courseId)) {
          state.enrolledCourseIds.push(courseId);
        }
        if (!state.completedLessons[courseId]) {
          state.completedLessons[courseId] = [];
        }
      })
      .addCase(markLessonComplete.fulfilled, (state, action) => {
        state.completedLessons[action.payload.courseId] =
          action.payload.completedLessons;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        const { courseId, ...summary } = action.payload.result;
        state.quizResults[courseId] = summary;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.assignments.unshift(action.payload);
      });
  }
});

export const {
  enrollCourse,
  updateProgress,
  saveQuizScore,
  updateAssignment,
  resetLearning
} = learningSlice.actions;
export default learningSlice.reducer;
