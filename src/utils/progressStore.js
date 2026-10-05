// Simple localStorage-backed persistence for enrollment / lesson / quiz progress.
// No backend or API involved - everything lives in the browser.

const STORAGE_KEY = "edusphere_learning_progress_v1";

const DEFAULT_STATE = {
  enrolledCourseIds: [],
  completedLessons: {}, // { [courseId]: string[] of completed lesson ids }
  quizResults: {} // { [courseId]: { passed: boolean, score: number, total: number } }
};

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      enrolledCourseIds: Array.isArray(parsed.enrolledCourseIds)
        ? parsed.enrolledCourseIds
        : [],
      completedLessons:
        parsed.completedLessons && typeof parsed.completedLessons === "object"
          ? parsed.completedLessons
          : {},
      quizResults:
        parsed.quizResults && typeof parsed.quizResults === "object"
          ? parsed.quizResults
          : {}
    };
  } catch (err) {
    console.error("Failed to load saved progress:", err);
    return { ...DEFAULT_STATE };
  }
}

export function saveProgress(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save progress:", err);
  }
}
