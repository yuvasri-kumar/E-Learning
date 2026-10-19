const ASSIGNMENTS_KEY = "edusphere_assignments_v1";
const COURSES_CACHE_KEY = "edusphere_courses_cache_v1";
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read cache "${key}":`, err);
    return fallback;
  }
}
function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write cache "${key}":`, err);
  }
}
export function loadAssignments() {
  const data = read(ASSIGNMENTS_KEY, []);
  return Array.isArray(data) ? data : [];
}
export function saveAssignments(assignments) {
  write(ASSIGNMENTS_KEY, assignments);
}
export function loadCoursesCache() {
  const data = read(COURSES_CACHE_KEY, []);
  return Array.isArray(data) ? data : [];
}
export function saveCoursesCache(courses) {
  write(COURSES_CACHE_KEY, courses);
}
