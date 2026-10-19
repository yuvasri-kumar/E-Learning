const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, "db.json");
const STORE_FILE = process.env.STORE_FILE || path.join(__dirname, "store.json");
const SECRET_FILE =
  process.env.JWT_SECRET_FILE || path.join(__dirname, ".jwt-secret");
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS) || 60 * 60;
const MAX_BODY_BYTES = 100 * 1024;

/* ---------- storage ---------- */

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(db) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

const EMPTY_STORE = {
  users: [],
  enrollments: [],
  progress: [],
  quizAttempts: [],
  assignments: [],
  certificates: [],
  history: [],
  revokedTokens: []
};

function readStore() {
  let parsed = {};
  if (fs.existsSync(STORE_FILE)) {
    parsed = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  }
  const store = { ...EMPTY_STORE };
  Object.keys(EMPTY_STORE).forEach((key) => {
    store[key] = Array.isArray(parsed[key]) ? parsed[key] : [];
  });
  return store;
}

function writeStore(store) {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

/* ---------- password hashing ---------- */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

/* ---------- JWT (HS256) ---------- */

function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const saved = fs.readFileSync(SECRET_FILE, "utf8").trim();
    if (saved) return saved;
  } catch (err) {
    // no secret yet, generate below
  }
  const secret = crypto.randomBytes(48).toString("hex");
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  return secret;
}

const JWT_SECRET = loadSecret();

const b64url = (input) => Buffer.from(input).toString("base64url");

function sign(data) {
  return crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
}

function createToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      sub: user.id,
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + TOKEN_TTL_SECONDS
    })
  );
  return {
    token: `${header}.${payload}.${sign(`${header}.${payload}`)}`,
    expiresIn: TOKEN_TTL_SECONDS,
    expiresAt: new Date((now + TOKEN_TTL_SECONDS) * 1000).toISOString()
  };
}

function verifyToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return { error: "TOKEN_INVALID" };
  const [header, payload, signature] = parts;
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const actual = Buffer.from(signature);
  if (
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(expected, actual)
  ) {
    return { error: "TOKEN_INVALID" };
  }
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (err) {
    return { error: "TOKEN_INVALID" };
  }
  if (!claims.sub || !claims.jti || typeof claims.exp !== "number") {
    return { error: "TOKEN_INVALID" };
  }
  if (claims.exp <= Math.floor(Date.now() / 1000)) {
    return { error: "TOKEN_EXPIRED", claims };
  }
  return { claims };
}

const AUTH_MESSAGES = {
  NO_TOKEN: "Please log in to continue.",
  TOKEN_INVALID: "Your session is invalid. Please log in again.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  TOKEN_REVOKED: "You have been logged out. Please log in again.",
  USER_NOT_FOUND: "This account no longer exists. Please log in again."
};

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function authenticate(req, store) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new HttpError(401, AUTH_MESSAGES.NO_TOKEN, "NO_TOKEN");
  const result = verifyToken(match[1].trim());
  if (result.error) {
    throw new HttpError(401, AUTH_MESSAGES[result.error], result.error);
  }
  const { claims } = result;
  if (store.revokedTokens.some((t) => t.jti === claims.jti)) {
    throw new HttpError(401, AUTH_MESSAGES.TOKEN_REVOKED, "TOKEN_REVOKED");
  }
  const user = store.users.find((u) => u.id === claims.sub);
  if (!user) {
    throw new HttpError(401, AUTH_MESSAGES.USER_NOT_FOUND, "USER_NOT_FOUND");
  }
  return { user, claims };
}

/* ---------- helpers ---------- */

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(status === 204 ? undefined : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, "Request body is too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (size === 0) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return reject(new HttpError(400, "Request body must be a JSON object"));
        }
        resolve(parsed);
      } catch (err) {
        reject(new HttpError(400, "Request body is not valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const str = (v) => (typeof v === "string" ? v.trim() : "");
const EMAIL_RE = /^\S+@\S+\.\S+$/;

function findCourse(db, id) {
  const course = db.courses.find((c) => c.id === String(id));
  if (!course) throw new HttpError(404, `Course ${id} not found`);
  return course;
}

function requireEnrollment(store, userId, courseId) {
  const enrollment = store.enrollments.find(
    (e) => e.userId === userId && e.courseId === courseId
  );
  if (!enrollment) {
    throw new HttpError(
      403,
      "You are not enrolled in this course.",
      "NOT_ENROLLED"
    );
  }
  return enrollment;
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, studentId: u.studentId, role: u.role || "student" };
}

function requireAdmin(auth) {
  if (!auth || auth.user.role !== "admin") {
    throw new HttpError(403, "Admin access is required to manage courses.", "ADMIN_REQUIRED");
  }
}

function ensureAdminAccount(store) {
  const email = (process.env.ADMIN_EMAIL || "admin@edusphere.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  let admin = store.users.find((u) => u.email === email);
  if (!admin) {
    admin = {
      id: crypto.randomUUID(),
      name: "EduSphere Admin",
      email,
      studentId: "ADMIN001",
      passwordHash: hashPassword(password),
      role: "admin",
      createdAt: new Date().toISOString()
    };
    store.users.push(admin);
    writeStore(store);
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    writeStore(store);
  }
}

function logHistory(store, userId, course, type, message, meta) {
  store.history.push({
    id: crypto.randomUUID(),
    userId,
    type,
    courseId: course ? course.id : null,
    courseTitle: course ? course.title : null,
    message,
    meta: meta || {},
    timestamp: new Date().toISOString()
  });
}

function progressFor(store, db, userId, courseId) {
  const course = db.courses.find((c) => c.id === courseId);
  const record = store.progress.find(
    (p) => p.userId === userId && p.courseId === courseId
  );
  const completed = record ? record.completedLessons : [];
  const total = course && course.lessonList ? course.lessonList.length : 0;
  return {
    courseId,
    completedLessons: completed,
    totalLessons: total,
    percent: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    updatedAt: record ? record.updatedAt : null
  };
}

function quizSummary(store, userId, courseId) {
  const attempts = store.quizAttempts
    .filter((a) => a.userId === userId && a.courseId === courseId)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  if (attempts.length === 0) return null;
  const latest = attempts[attempts.length - 1];
  return {
    courseId,
    score: latest.score,
    total: latest.total,
    passed: attempts.some((a) => a.passed),
    bestScore: Math.max(...attempts.map((a) => a.score)),
    attempts: attempts.length,
    lastAttemptAt: latest.submittedAt
  };
}

function allLessonsDone(store, db, userId, course) {
  const total = course.lessonList ? course.lessonList.length : 0;
  const done = progressFor(store, db, userId, course.id).completedLessons.length;
  return total > 0 && done >= total;
}

function questionsWithoutAnswers(quiz) {
  return quiz.questions.map(({ id, question, options }) => ({
    id,
    question,
    options
  }));
}

/* ---------- route handlers ---------- */

const routes = [];
function route(method, pattern, { auth = false } = {}, handler) {
  const keys = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:([A-Za-z]+)/g, (_, key) => {
        keys.push(key);
        return "([^/]+)";
      }) +
      "/?$"
  );
  routes.push({ method, regex, keys, auth, handler });
}

/* --- admin-only course CRUD --- */

route("POST", "/courses", { auth: true }, ({ db, auth, body }) => {
  requireAdmin(auth);
  const title = str(body.title);
  const category = str(body.category);
  const level = str(body.level);
  const instructor = str(body.instructor);
  const description = str(body.description);
  if (!title || !category || !level || !instructor || !description) {
    throw new HttpError(400, "Title, category, level, instructor, and description are required.", "VALIDATION_ERROR");
  }
  const syllabus = Array.isArray(body.syllabus)
    ? body.syllabus.map(str).filter(Boolean)
    : String(body.syllabus || "").split("\n").map(str).filter(Boolean);
  const course = {
    id: crypto.randomUUID(), title, category, level, instructor,
    duration: str(body.duration) || "Self-paced",
    lessons: syllabus.length || 0,
    price: Number.isFinite(Number(body.price)) ? Math.max(0, Number(body.price)) : 0,
    rating: 0,
    description,
    image: str(body.image) || "https://placehold.co/400x220?text=New+Course",
    syllabus,
    lessonList: syllabus.map((lesson, index) => ({
      id: `lesson-${index + 1}`,
      title: lesson,
      content: `Welcome to ${lesson}. Course content will be provided by the instructor.`
    }))
  };
  db.courses.push(course);
  return { status: 201, body: { message: "Course created successfully", course }, saveDb: true };
});

route("PUT", "/courses/:id", { auth: true }, ({ db, auth, body, params }) => {
  requireAdmin(auth);
  const course = findCourse(db, params.id);
  const title = str(body.title);
  const category = str(body.category);
  const level = str(body.level);
  const instructor = str(body.instructor);
  const description = str(body.description);
  if (!title || !category || !level || !instructor || !description) {
    throw new HttpError(400, "Title, category, level, instructor, and description are required.", "VALIDATION_ERROR");
  }
  const syllabus = Array.isArray(body.syllabus)
    ? body.syllabus.map(str).filter(Boolean)
    : String(body.syllabus || "").split("\n").map(str).filter(Boolean);
  Object.assign(course, {
    title, category, level, instructor,
    duration: str(body.duration) || course.duration || "Self-paced",
    price: Number.isFinite(Number(body.price)) ? Math.max(0, Number(body.price)) : 0,
    description,
    image: str(body.image) || course.image,
    syllabus,
    lessons: syllabus.length,
    lessonList: syllabus.map((lesson, index) => ({
      id: `lesson-${index + 1}`,
      title: lesson,
      content: `Welcome to ${lesson}. Course content will be provided by the instructor.`
    }))
  });
  return { status: 200, body: { message: "Course updated successfully", course }, saveDb: true };
});

route("DELETE", "/courses/:id", { auth: true }, ({ db, auth, params }) => {
  requireAdmin(auth);
  const index = db.courses.findIndex((course) => course.id === String(params.id));
  if (index < 0) throw new HttpError(404, `Course ${params.id} not found`);
  const [deleted] = db.courses.splice(index, 1);
  return { status: 200, body: { message: "Course deleted successfully", course: deleted }, saveDb: true };
});

/* --- public: courses (read-only for students/guests) --- */

route("GET", "/health", {}, () => ({ status: 200, body: { status: "ok" } }));

route("GET", "/courses", {}, ({ db, url }) => {
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = url.searchParams.get("category");
  const level = url.searchParams.get("level");
  const result = db.courses.filter((c) => {
    const matchesQ =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q);
    const matchesCategory =
      !category || category === "All" || c.category === category;
    const matchesLevel = !level || level === "All" || c.level === level;
    return matchesQ && matchesCategory && matchesLevel;
  });
  return { status: 200, body: result };
});

route("GET", "/courses/:id", {}, ({ db, params }) => ({
  status: 200,
  body: findCourse(db, params.id)
}));

route("GET", "/courses/:id/materials", {}, ({ db, params }) => ({
  status: 200,
  body: findCourse(db, params.id).materials || []
}));

/* --- auth --- */

route("POST", "/auth/register", {}, ({ store, body }) => {
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const studentId = str(body.studentId);
  const password = typeof body.password === "string" ? body.password : "";
  const errors = {};
  if (!name) errors.name = "Student name is required";
  else if (name.length < 3) errors.name = "Name must be at least 3 characters";
  if (!email) errors.email = "Student email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email";
  if (!studentId) errors.studentId = "Student ID is required";
  else if (!/^[A-Za-z0-9]{4,}$/.test(studentId))
    errors.studentId = "Student ID must be at least 4 letters/numbers";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters";
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, Object.values(errors)[0], "VALIDATION_ERROR");
  }
  if (store.users.some((u) => u.email === email)) {
    throw new HttpError(409, "This email is already registered", "EMAIL_TAKEN");
  }
  if (store.users.some((u) => u.studentId.toLowerCase() === studentId.toLowerCase())) {
    throw new HttpError(
      409,
      "This Student ID is already registered",
      "STUDENT_ID_TAKEN"
    );
  }
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    studentId,
    passwordHash: hashPassword(password),
    role: "student",
    createdAt: new Date().toISOString()
  };
  store.users.push(user);
  return {
    status: 201,
    body: { message: "Registration successful", user: publicUser(user) },
    save: true
  };
});

route("POST", "/auth/login", {}, ({ store, body }) => {
  const identifier = str(body.identifier).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!identifier) {
    throw new HttpError(400, "Email or Student ID is required", "VALIDATION_ERROR");
  }
  if (!password) {
    throw new HttpError(400, "Password is required", "VALIDATION_ERROR");
  }
  const user = store.users.find(
    (u) => u.email === identifier || u.studentId.toLowerCase() === identifier
  );
  // hash even when the user is unknown so response time does not reveal accounts
  const ok = user
    ? verifyPassword(password, user.passwordHash)
    : (verifyPassword(password, "00:00"), false);
  if (!ok) {
    throw new HttpError(401, "Invalid email/ID or password", "INVALID_CREDENTIALS");
  }
  const session = createToken(user);
  return {
    status: 200,
    body: { tokenType: "Bearer", ...session, user: publicUser(user) }
  };
});

route("GET", "/auth/me", { auth: true }, ({ auth }) => ({
  status: 200,
  body: { user: publicUser(auth.user) }
}));

route("POST", "/auth/logout", { auth: true }, ({ store, auth }) => {
  const now = Math.floor(Date.now() / 1000);
  store.revokedTokens = store.revokedTokens.filter((t) => t.exp > now);
  store.revokedTokens.push({ jti: auth.claims.jti, exp: auth.claims.exp });
  return { status: 200, body: { message: "Logged out" }, save: true };
});

/* --- enrollments --- */

route("GET", "/enrollments", { auth: true }, ({ store, auth }) => ({
  status: 200,
  body: store.enrollments
    .filter((e) => e.userId === auth.user.id)
    .sort((a, b) => a.enrolledAt.localeCompare(b.enrolledAt))
    .map(({ userId, ...rest }) => rest)
}));

route("POST", "/enrollments", { auth: true }, ({ db, store, auth, body }) => {
  const courseId = str(String(body.courseId ?? ""));
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  if (!courseId) throw new HttpError(400, "courseId is required", "VALIDATION_ERROR");
  if (!name) throw new HttpError(400, "Name is required", "VALIDATION_ERROR");
  if (!email) throw new HttpError(400, "Email is required", "VALIDATION_ERROR");
  if (!EMAIL_RE.test(email))
    throw new HttpError(400, "Enter a valid email", "VALIDATION_ERROR");
  if (!phone)
    throw new HttpError(400, "Phone number is required", "VALIDATION_ERROR");
  const course = findCourse(db, courseId);
  if (
    store.enrollments.some(
      (e) => e.userId === auth.user.id && e.courseId === course.id
    )
  ) {
    throw new HttpError(
      409,
      "You are already enrolled in this course.",
      "ALREADY_ENROLLED"
    );
  }
  const enrollment = {
    id: crypto.randomUUID(),
    userId: auth.user.id,
    courseId: course.id,
    name,
    email,
    phone,
    enrolledAt: new Date().toISOString()
  };
  store.enrollments.push(enrollment);
  logHistory(store, auth.user.id, course, "enrolled", `Enrolled in ${course.title}`);
  const { userId, ...publicEnrollment } = enrollment;
  return { status: 201, body: publicEnrollment, save: true };
});

route(
  "DELETE",
  "/enrollments/:courseId",
  { auth: true },
  ({ db, store, auth, params }) => {
    const course = findCourse(db, params.courseId);
    requireEnrollment(store, auth.user.id, course.id);
    store.enrollments = store.enrollments.filter(
      (e) => !(e.userId === auth.user.id && e.courseId === course.id)
    );
    store.progress = store.progress.filter(
      (p) => !(p.userId === auth.user.id && p.courseId === course.id)
    );
    logHistory(
      store,
      auth.user.id,
      course,
      "unenrolled",
      `Left ${course.title}`
    );
    return { status: 200, body: { message: "Enrollment removed" }, save: true };
  }
);

/* --- progress --- */

route("GET", "/progress", { auth: true }, ({ db, store, auth }) => ({
  status: 200,
  body: store.enrollments
    .filter((e) => e.userId === auth.user.id)
    .map((e) => progressFor(store, db, auth.user.id, e.courseId))
}));

route(
  "GET",
  "/progress/:courseId",
  { auth: true },
  ({ db, store, auth, params }) => {
    const course = findCourse(db, params.courseId);
    requireEnrollment(store, auth.user.id, course.id);
    return {
      status: 200,
      body: progressFor(store, db, auth.user.id, course.id)
    };
  }
);

function saveProgress(store, userId, courseId, completedLessons) {
  const now = new Date().toISOString();
  const record = store.progress.find(
    (p) => p.userId === userId && p.courseId === courseId
  );
  if (record) {
    record.completedLessons = completedLessons;
    record.updatedAt = now;
  } else {
    store.progress.push({ userId, courseId, completedLessons, updatedAt: now });
  }
}

// PATCH = partial update: mark one more lesson as completed
route(
  "PATCH",
  "/progress/:courseId",
  { auth: true },
  ({ db, store, auth, params, body }) => {
    const course = findCourse(db, params.courseId);
    requireEnrollment(store, auth.user.id, course.id);
    const lessonId = str(body.lessonId);
    if (!lessonId) throw new HttpError(400, "lessonId is required", "VALIDATION_ERROR");
    const lesson = (course.lessonList || []).find((l) => l.id === lessonId);
    if (!lesson) {
      throw new HttpError(
        404,
        `Lesson ${lessonId} not found in this course`,
        "LESSON_NOT_FOUND"
      );
    }
    const current = progressFor(store, db, auth.user.id, course.id).completedLessons;
    if (!current.includes(lessonId)) {
      saveProgress(store, auth.user.id, course.id, [...current, lessonId]);
      logHistory(
        store,
        auth.user.id,
        course,
        "lesson_completed",
        `Completed lesson "${lesson.title}" in ${course.title}`,
        { lessonId }
      );
    }
    return {
      status: 200,
      body: progressFor(store, db, auth.user.id, course.id),
      save: true
    };
  }
);

// PUT = full replacement of the completed-lessons list
route(
  "PUT",
  "/progress/:courseId",
  { auth: true },
  ({ db, store, auth, params, body }) => {
    const course = findCourse(db, params.courseId);
    requireEnrollment(store, auth.user.id, course.id);
    if (!Array.isArray(body.completedLessons)) {
      throw new HttpError(
        400,
        "completedLessons must be an array of lesson ids",
        "VALIDATION_ERROR"
      );
    }
    const validIds = (course.lessonList || []).map((l) => l.id);
    const unknown = body.completedLessons.filter((id) => !validIds.includes(id));
    if (unknown.length > 0) {
      throw new HttpError(
        400,
        `Unknown lesson id(s): ${unknown.join(", ")}`,
        "VALIDATION_ERROR"
      );
    }
    const unique = [...new Set(body.completedLessons)];
    const before = progressFor(store, db, auth.user.id, course.id).completedLessons;
    saveProgress(store, auth.user.id, course.id, unique);
    const added = unique.filter((id) => !before.includes(id));
    if (added.length > 0) {
      logHistory(
        store,
        auth.user.id,
        course,
        "lesson_completed",
        `Updated progress in ${course.title} (${unique.length}/${validIds.length} lessons)`,
        { lessonIds: added }
      );
    }
    return {
      status: 200,
      body: progressFor(store, db, auth.user.id, course.id),
      save: true
    };
  }
);

/* --- quiz (protected, graded on the server) --- */

function loadQuizForStudent(db, store, auth, courseId) {
  const course = findCourse(db, courseId);
  const quiz = db.quizzes.find((z) => z.courseId === course.id);
  if (!quiz) {
    throw new HttpError(404, `No quiz found for course ${courseId}`);
  }
  requireEnrollment(store, auth.user.id, course.id);
  if (!allLessonsDone(store, db, auth.user.id, course)) {
    throw new HttpError(
      403,
      "Complete all lessons to unlock this quiz.",
      "QUIZ_LOCKED"
    );
  }
  return { course, quiz };
}

const getQuiz = ({ db, store, auth, params }) => {
  const id = params.courseId || params.id;
  const { course, quiz } = loadQuizForStudent(db, store, auth, id);
  return {
    status: 200,
    body: {
      courseId: course.id,
      courseTitle: course.title,
      questions: questionsWithoutAnswers(quiz)
    }
  };
};
route("GET", "/quiz/:courseId", { auth: true }, getQuiz);
route("GET", "/courses/:id/quiz", { auth: true }, getQuiz);

route(
  "POST",
  "/quiz/:courseId/submit",
  { auth: true },
  ({ db, store, auth, params, body }) => {
    const { course, quiz } = loadQuizForStudent(db, store, auth, params.courseId);
    const answers = body.answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      throw new HttpError(
        400,
        "answers must be an object of questionId -> option index",
        "VALIDATION_ERROR"
      );
    }
    for (const q of quiz.questions) {
      const given = answers[q.id];
      if (
        given !== undefined &&
        (!Number.isInteger(given) || given < 0 || given >= q.options.length)
      ) {
        throw new HttpError(
          400,
          `Invalid answer for question ${q.id}`,
          "VALIDATION_ERROR"
        );
      }
    }
    const total = quiz.questions.length;
    const score = quiz.questions.filter((q) => answers[q.id] === q.answer).length;
    const passingScore = Math.ceil(total * 0.75);
    const attempt = {
      id: crypto.randomUUID(),
      userId: auth.user.id,
      courseId: course.id,
      score,
      total,
      passed: score >= passingScore,
      submittedAt: new Date().toISOString()
    };
    store.quizAttempts.push(attempt);
    logHistory(
      store,
      auth.user.id,
      course,
      "quiz_submitted",
      `Scored ${score}/${total} on the ${course.title} quiz (${
        attempt.passed ? "passed" : "not passed"
      })`,
      { score, total, passed: attempt.passed }
    );
    const { userId, ...publicAttempt } = attempt;
    return {
      status: 201,
      body: {
        attempt: { ...publicAttempt, passingScore },
        result: quizSummary(store, auth.user.id, course.id)
      },
      save: true
    };
  }
);

route("GET", "/quiz-results", { auth: true }, ({ store, auth }) => {
  const courseIds = [
    ...new Set(
      store.quizAttempts
        .filter((a) => a.userId === auth.user.id)
        .map((a) => a.courseId)
    )
  ];
  return {
    status: 200,
    body: courseIds.map((id) => quizSummary(store, auth.user.id, id))
  };
});

/* --- assignments --- */

route("GET", "/assignments", { auth: true }, ({ store, auth }) => ({
  status: 200,
  body: store.assignments
    .filter((a) => a.userId === auth.user.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map(({ userId, ...rest }) => rest)
}));

route("POST", "/assignments", { auth: true }, ({ store, auth, body }) => {
  const title = str(body.title);
  const notes = str(body.notes);
  const fileName = str(body.fileName) || "No file attached";
  if (!title)
    throw new HttpError(400, "Assignment title is required", "VALIDATION_ERROR");
  if (title.length < 3)
    throw new HttpError(
      400,
      "Title must be at least 3 characters",
      "VALIDATION_ERROR"
    );
  if (title.length > 120)
    throw new HttpError(
      400,
      "Title must be at most 120 characters",
      "VALIDATION_ERROR"
    );
  if (!notes)
    throw new HttpError(
      400,
      "Please describe your submission",
      "VALIDATION_ERROR"
    );
  if (notes.length > 2000)
    throw new HttpError(
      400,
      "Notes must be at most 2000 characters",
      "VALIDATION_ERROR"
    );
  const assignment = {
    id: crypto.randomUUID(),
    userId: auth.user.id,
    title,
    notes,
    fileName: fileName.slice(0, 200),
    submittedAt: new Date().toISOString()
  };
  store.assignments.push(assignment);
  logHistory(
    store,
    auth.user.id,
    null,
    "assignment_submitted",
    `Submitted assignment "${title}"`,
    { assignmentId: assignment.id }
  );
  const { userId, ...publicAssignment } = assignment;
  return { status: 201, body: publicAssignment, save: true };
});

/* --- certificates --- */

route("GET", "/certificates", { auth: true }, ({ store, auth }) => ({
  status: 200,
  body: store.certificates
    .filter((c) => c.userId === auth.user.id)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    .map(({ userId, ...rest }) => rest)
}));

// Issues a certificate once the quiz is passed; calling again returns the same one.
route(
  "POST",
  "/certificates",
  { auth: true },
  ({ db, store, auth, body }) => {
    const courseId = str(String(body.courseId ?? ""));
    if (!courseId) throw new HttpError(400, "courseId is required", "VALIDATION_ERROR");
    const course = findCourse(db, courseId);
    requireEnrollment(store, auth.user.id, course.id);
    const summary = quizSummary(store, auth.user.id, course.id);
    if (!summary || !summary.passed) {
      throw new HttpError(
        403,
        "Pass the course quiz to unlock this certificate.",
        "CERTIFICATE_LOCKED"
      );
    }
    const existing = store.certificates.find(
      (c) => c.userId === auth.user.id && c.courseId === course.id
    );
    if (existing) {
      const { userId, ...rest } = existing;
      return { status: 200, body: rest };
    }
    const studentName = str(body.studentName) || auth.user.name;
    const certificate = {
      id: crypto.randomUUID(),
      userId: auth.user.id,
      courseId: course.id,
      courseTitle: course.title,
      studentName: studentName.slice(0, 120),
      issuedAt: new Date().toISOString()
    };
    store.certificates.push(certificate);
    logHistory(
      store,
      auth.user.id,
      course,
      "certificate_issued",
      `Certificate issued for ${course.title}`,
      { certificateId: certificate.id }
    );
    const { userId, ...rest } = certificate;
    return { status: 201, body: rest, save: true };
  }
);

/* --- learning history --- */

route("GET", "/history", { auth: true }, ({ store, auth, url }) => {
  const type = url.searchParams.get("type");
  const courseId = url.searchParams.get("courseId");
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit"), 10) || 50, 1),
    200
  );
  const items = store.history
    .filter((h) => h.userId === auth.user.id)
    .filter((h) => !type || h.type === type)
    .filter((h) => !courseId || h.courseId === courseId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
    .map(({ userId, ...rest }) => rest);
  return { status: 200, body: items };
});

/* ---------- server ---------- */

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let matched = null;
    let pathExists = false;
    for (const r of routes) {
      const m = r.regex.exec(url.pathname);
      if (!m) continue;
      pathExists = true;
      if (r.method !== req.method) continue;
      const params = {};
      r.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(m[i + 1]);
      });
      matched = { route: r, params };
      break;
    }
    if (!matched) {
      if (pathExists) throw new HttpError(405, "Method not allowed");
      throw new HttpError(404, "Route not found");
    }

    let db;
    let store;
    try {
      db = readDb();
      store = readStore();
      ensureAdminAccount(store);
    } catch (err) {
      console.error("Storage error:", err);
      throw new HttpError(500, "Could not read database");
    }

    const auth = matched.route.auth ? authenticate(req, store) : null;
    const body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
      ? await readBody(req)
      : {};
    const result = matched.route.handler({
      req,
      url,
      db,
      store,
      auth,
      body,
      params: matched.params
    });
    if (result.save) writeStore(store);
    if (result.saveDb) writeDb(db);
    return send(res, result.status, result.body);
  } catch (err) {
    if (err instanceof HttpError) {
      return send(res, err.status, {
        message: err.message,
        ...(err.code ? { code: err.code } : {})
      });
    }
    console.error("Unexpected error:", err);
    return send(res, 500, { message: "Internal server error" });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`E-learning REST API running on http://localhost:${PORT}`);
  });
}

module.exports = { server };
