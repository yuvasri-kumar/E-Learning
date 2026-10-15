import { createSelector } from "@reduxjs/toolkit";
export const selectEnrolledCourseIds = (s) => s.learning.enrolledCourseIds;
export const selectCompletedLessons = (s) => s.learning.completedLessons;
export const selectQuizResults = (s) => s.learning.quizResults;
export const selectAssignments = (s) => s.learning.assignments;
export const selectCourses = (s) => s.courses.items;
export const selectCoursesStatus = (s) => s.courses.status;
export const selectCoursesError = (s) => s.courses.error;
export const selectEnrolledCourses = createSelector(
  [selectCourses, selectEnrolledCourseIds],
  (courses, ids) => courses.filter((c) => ids.includes(c.id))
);
export const selectProgress = createSelector(
  [selectEnrolledCourses, selectCompletedLessons],
  (enrolledCourses, completedLessons) => {
    const result = {};
    enrolledCourses.forEach((course) => {
      const total = course.lessonList ? course.lessonList.length : 0;
      const done = (completedLessons[course.id] || []).length;
      result[course.id] = total > 0 ? Math.round((done / total) * 100) : 0;
    });
    return result;
  }
);
export const selectLearningStatus = (s) => s.learning.status;
export const selectLearningError = (s) => s.learning.error;
