
const BASE_URL = process.env.REACT_APP_API_URL  ||"http://localhost:5000" ;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error(
      "Cannot reach the course server. Make sure the API is running (npm run api)."
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && body.message) message = body.message;
    } catch (e) {
      /* keep default message */
    }
    throw new Error(message);
  }
  return response.json();
}

// GET /courses?q=&category=&level=
export async function fetchCourses({ q = "", category = "All", level = "All" } = {}, signal) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category && category !== "All") params.set("category", category);
  if (level && level !== "All") params.set("level", level);
  const query = params.toString();
  return request(`/courses${query ? `?${query}` : ""}`, { signal });
}

// GET /courses/:id
export async function fetchCourseById(id, signal) {
  return request(`/courses/${encodeURIComponent(id)}`, { signal });
}
// GET /quiz/:id (quiz belonging only to that course)
export async function fetchQuizByCourseId(id, signal) {
  return request(`/quiz/${encodeURIComponent(id)}`, { signal });
}
