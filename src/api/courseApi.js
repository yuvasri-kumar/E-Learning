import client from "./client";

export async function fetchCourses(
  { q = "", category = "All", level = "All" } = {},
  signal
) {
  const params = {};
  if (q) params.q = q;
  if (category && category !== "All") params.category = category;
  if (level && level !== "All") params.level = level;
  const { data } = await client.get("/courses", { params, signal });
  return data;
}

export async function fetchCourseById(id, signal) {
  const { data } = await client.get(`/courses/${encodeURIComponent(id)}`, {
    signal
  });
  return data;
}

// Protected: needs a logged-in, enrolled student who finished all lessons.
export async function fetchQuizByCourseId(id, signal) {
  const { data } = await client.get(`/quiz/${encodeURIComponent(id)}`, {
    signal
  });
  return data;
}


// Admin-only course management. The backend enforces the admin role.
export async function createCourse(course) {
  const { data } = await client.post("/courses", course);
  return data;
}

export async function updateCourse(id, course) {
  const { data } = await client.put(`/courses/${encodeURIComponent(id)}`, course);
  return data;
}

export async function deleteCourse(id) {
  const { data } = await client.delete(`/courses/${encodeURIComponent(id)}`);
  return data;
}
