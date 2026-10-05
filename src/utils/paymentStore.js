// Experiment 5: localStorage store for paid-course status.
// Kept separate from progressStore so existing progress data is untouched.

const PAYMENT_KEY = "edusphere_paid_courses_v1";

export function loadPaidCourses() {
  try {
    const raw = window.localStorage.getItem(PAYMENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load payment status:", err);
    return [];
  }
}

export function savePaidCourses(paidCourseIds) {
  try {
    window.localStorage.setItem(PAYMENT_KEY, JSON.stringify(paidCourseIds));
  } catch (err) {
    console.error("Failed to save payment status:", err);
  }
}
