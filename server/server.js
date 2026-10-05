// Experiment 1: tiny zero-dependency REST API for the e-learning app.
//
//   GET /courses                       -> all courses
//   GET /courses?q=react               -> search by title / description / instructor
//   GET /courses?category=Design       -> filter by category
//   GET /courses?level=Beginner        -> filter by level
//   GET /courses/:id                   -> one course (lessons + materials)
//   GET /courses/:id/materials         -> learning materials of one course
//   GET /quiz/:id                      -> quiz questions of ONE course only
//   GET /courses/:id/quiz              -> same as /quiz/:id
//
// Run with:  npm run api   (listens on http://localhost:5000)

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, "db.json");

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method !== "GET") return send(res, 405, { message: "Method not allowed" });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  let db;
  try {
    db = readDb();
  } catch (err) {
    return send(res, 500, { message: "Could not read database" });
  }

  // /courses
  if (parts[0] === "courses" && parts.length === 1) {
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const category = url.searchParams.get("category");
    const level = url.searchParams.get("level");

    const result = db.courses.filter((c) => {
      const matchesQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q);
      const matchesCategory = !category || category === "All" || c.category === category;
      const matchesLevel = !level || level === "All" || c.level === level;
      return matchesQ && matchesCategory && matchesLevel;
    });
    return send(res, 200, result);
  }

  // /courses/:id, /courses/:id/materials, /courses/:id/quiz
  if (parts[0] === "courses" && parts.length >= 2) {
    const course = db.courses.find((c) => c.id === parts[1]);
    if (!course) return send(res, 404, { message: `Course ${parts[1]} not found` });

    if (parts.length === 2) return send(res, 200, course);
    if (parts[2] === "materials" && parts.length === 3) {
      return send(res, 200, course.materials || []);
    }
    if (parts[2] === "quiz" && parts.length === 3) {
      return sendQuiz(res, db, course.id);
    }
  }

  // /quiz/:id  (id = course id)
  if (parts[0] === "quiz" && parts.length === 2) {
    return sendQuiz(res, db, parts[1]);
  }

  return send(res, 404, { message: "Route not found" });
});

function sendQuiz(res, db, courseId) {
  const course = db.courses.find((c) => c.id === courseId);
  const quiz = db.quizzes.find((z) => z.courseId === courseId);
  if (!course || !quiz) {
    return send(res, 404, { message: `No quiz found for course ${courseId}` });
  }
  return send(res, 200, {
    courseId: course.id,
    courseTitle: course.title,
    questions: quiz.questions
  });
}

server.listen(PORT, () => {
  console.log(`E-learning REST API running on http://localhost:${PORT}`);
});
