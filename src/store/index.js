import { configureStore } from "@reduxjs/toolkit";
import learningReducer from "./learningSlice";
import coursesReducer from "./coursesSlice";
import loggerMiddleware from "./loggerMiddleware";
import { saveProgress } from "../utils/progressStore";
import { saveAssignments } from "../utils/cacheStore";
export const store = configureStore({
  reducer: {
    learning: learningReducer,
    courses: coursesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware)
});
let lastLearning = store.getState().learning;
store.subscribe(() => {
  const learning = store.getState().learning;
  if (learning === lastLearning) return;
  if (
    learning.enrolledCourseIds !== lastLearning.enrolledCourseIds ||
    learning.completedLessons !== lastLearning.completedLessons ||
    learning.quizResults !== lastLearning.quizResults
  ) {
    saveProgress({
      enrolledCourseIds: learning.enrolledCourseIds,
      completedLessons: learning.completedLessons,
      quizResults: learning.quizResults
    });
  }
  if (learning.assignments !== lastLearning.assignments) {
    saveAssignments(learning.assignments);
  }
  lastLearning = learning;
});
export default store;
