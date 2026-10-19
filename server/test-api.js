// Integration tests for the REST API. Run with: npm run test:api
// Starts the real server (temporary data + secret files) and calls it over HTTP.
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "edu-api-"));
let passed = 0;
let failed = 0;

function startServer(port, env = {}) {
  const child = spawn(process.execPath, [path.join(__dirname, "server.js")], {
    env: {
      ...process.env,
      PORT: String(port),
      STORE_FILE: path.join(tmp, `store-${port}.json`),
      JWT_SECRET_FILE: path.join(tmp, `secret-${port}`),
      ...env
    },
    stdio: ["ignore", "pipe", "inherit"]
  });
  return new Promise((resolve, reject) => {
    child.stdout.on("data", (d) => {
      if (String(d).includes("running")) resolve(child);
    });
    child.on("error", reject);
    child.on("exit", (code) => reject(new Error(`server exited (${code})`)));
  });
}

function client(port) {
  return async function call(method, url, { token, body, headers } = {}) {
    const res = await fetch(`http://localhost:${port}${url}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL ${name}\n       ${err.message}`);
  }
}

async function main() {
  const port = 5100 + Math.floor(Math.random() * 400);
  const server = await startServer(port);
  const call = client(port);
  const student = {
    name: "Test Student",
    email: "student@example.com",
    studentId: "STU1001",
    password: "secret123"
  };
  let token;

  console.log("Experiment 3 + 4: API tests");

  console.log("\nPublic course API");
  await test("GET /courses returns courses", async () => {
    const r = await call("GET", "/courses");
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.length >= 1);
  });
  await test("GET /courses?q= filters", async () => {
    const r = await call("GET", "/courses?q=react");
    assert.ok(r.body.length >= 1 && r.body.every((c) => /react/i.test(JSON.stringify(c))));
  });
  await test("GET /courses/:id and 404 for unknown", async () => {
    assert.strictEqual((await call("GET", "/courses/1")).status, 200);
    assert.strictEqual((await call("GET", "/courses/999")).status, 404);
  });

  console.log("\nAuthentication");
  await test("register validates input", async () => {
    const r = await call("POST", "/auth/register", {
      body: { ...student, email: "bad", password: "123" }
    });
    assert.strictEqual(r.status, 400);
  });
  await test("register creates student (no password in response)", async () => {
    const r = await call("POST", "/auth/register", { body: student });
    assert.strictEqual(r.status, 201);
    assert.ok(!JSON.stringify(r.body).includes("secret123"));
    assert.ok(!JSON.stringify(r.body).toLowerCase().includes("hash"));
  });
  await test("register rejects duplicate email and student id", async () => {
    const a = await call("POST", "/auth/register", { body: student });
    assert.strictEqual(a.status, 409);
    const b = await call("POST", "/auth/register", {
      body: { ...student, email: "other@example.com" }
    });
    assert.strictEqual(b.status, 409);
  });
  await test("login rejects missing fields (400) and wrong password (401)", async () => {
    assert.strictEqual(
      (await call("POST", "/auth/login", { body: { identifier: "", password: "" } })).status,
      400
    );
    const r = await call("POST", "/auth/login", {
      body: { identifier: student.email, password: "wrongpass" }
    });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.code, "INVALID_CREDENTIALS");
  });
  await test("login by email returns a signed token", async () => {
    const r = await call("POST", "/auth/login", {
      body: { identifier: student.email, password: student.password }
    });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.token.split(".").length, 3);
    assert.strictEqual(r.body.tokenType, "Bearer");
    assert.ok(r.body.expiresIn > 0);
    token = r.body.token;
  });
  await test("login by student id works", async () => {
    const r = await call("POST", "/auth/login", {
      body: { identifier: "stu1001", password: student.password }
    });
    assert.strictEqual(r.status, 200);
  });
  await test("GET /auth/me with token", async () => {
    const r = await call("GET", "/auth/me", { token });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.user.email, student.email);
  });

  console.log("\nProtected endpoints reject unauthenticated requests");
  const protectedCalls = [
    ["GET", "/auth/me"],
    ["GET", "/enrollments"],
    ["POST", "/enrollments", { courseId: "1" }],
    ["GET", "/progress"],
    ["PATCH", "/progress/1", { lessonId: "l1" }],
    ["PUT", "/progress/1", { completedLessons: [] }],
    ["GET", "/quiz/1"],
    ["POST", "/quiz/1/submit", { answers: {} }],
    ["GET", "/quiz-results"],
    ["GET", "/assignments"],
    ["POST", "/assignments", { title: "abc", notes: "x" }],
    ["GET", "/certificates"],
    ["POST", "/certificates", { courseId: "1" }],
    ["GET", "/history"]
  ];
  for (const [method, url, body] of protectedCalls) {
    await test(`${method} ${url} -> 401 without token`, async () => {
      const r = await call(method, url, { body });
      assert.strictEqual(r.status, 401);
      assert.strictEqual(r.body.code, "NO_TOKEN");
    });
  }
  await test("tampered / garbage tokens -> 401 TOKEN_INVALID", async () => {
    const [h, p, s] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ sub: "x", jti: "y", exp: 9999999999 })
    ).toString("base64url");
    for (const bad of ["garbage", `${h}.${forgedPayload}.${s}`, `${h}.${p}.AAAA`]) {
      const r = await call("GET", "/enrollments", { token: bad });
      assert.strictEqual(r.status, 401, bad);
      assert.strictEqual(r.body.code, "TOKEN_INVALID");
    }
  });
  await test("token signed with alg none is rejected", async () => {
    const h = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const p = token.split(".")[1];
    const r = await call("GET", "/enrollments", { token: `${h}.${p}.` });
    assert.strictEqual(r.status, 401);
  });

  console.log("\nEnrollment (POST / GET)");
  await test("learning data starts empty", async () => {
    assert.deepStrictEqual((await call("GET", "/enrollments", { token })).body, []);
    assert.deepStrictEqual((await call("GET", "/progress", { token })).body, []);
    assert.deepStrictEqual((await call("GET", "/history", { token })).body, []);
  });
  await test("progress/quiz blocked before enrolling (403)", async () => {
    assert.strictEqual(
      (await call("PATCH", "/progress/1", { token, body: { lessonId: "l1" } })).status,
      403
    );
    assert.strictEqual((await call("GET", "/quiz/1", { token })).status, 403);
  });
  await test("enrollment validates body (400) and course (404)", async () => {
    const bad = await call("POST", "/enrollments", {
      token,
      body: { courseId: "1", name: "A", email: "nope", phone: "1" }
    });
    assert.strictEqual(bad.status, 400);
    const missing = await call("POST", "/enrollments", {
      token,
      body: { courseId: "999", name: "A B", email: "a@b.co", phone: "123" }
    });
    assert.strictEqual(missing.status, 404);
  });
  const enrollBody = { courseId: "1", name: "Test Student", email: "student@example.com", phone: "9876543210" };
  await test("POST /enrollments creates enrollment (201)", async () => {
    const r = await call("POST", "/enrollments", { token, body: enrollBody });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.courseId, "1");
  });
  await test("duplicate enrollment -> 409", async () => {
    const r = await call("POST", "/enrollments", { token, body: enrollBody });
    assert.strictEqual(r.status, 409);
    assert.strictEqual(r.body.code, "ALREADY_ENROLLED");
  });
  await test("GET /enrollments lists it", async () => {
    const r = await call("GET", "/enrollments", { token });
    assert.deepStrictEqual(r.body.map((e) => e.courseId), ["1"]);
  });

  console.log("\nProgress (PATCH / PUT / GET)");
  await test("quiz locked until all lessons done (403 QUIZ_LOCKED)", async () => {
    const r = await call("GET", "/quiz/1", { token });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.body.code, "QUIZ_LOCKED");
  });
  await test("PATCH rejects unknown lesson (404) and missing id (400)", async () => {
    assert.strictEqual(
      (await call("PATCH", "/progress/1", { token, body: { lessonId: "zzz" } })).status,
      404
    );
    assert.strictEqual((await call("PATCH", "/progress/1", { token, body: {} })).status, 400);
  });
  await test("PATCH marks a lesson complete and is idempotent", async () => {
    const a = await call("PATCH", "/progress/1", { token, body: { lessonId: "l1" } });
    assert.strictEqual(a.status, 200);
    assert.deepStrictEqual(a.body.completedLessons, ["l1"]);
    assert.strictEqual(a.body.percent, 20);
    const b = await call("PATCH", "/progress/1", { token, body: { lessonId: "l1" } });
    assert.deepStrictEqual(b.body.completedLessons, ["l1"]);
  });
  await test("PUT replaces progress and validates ids", async () => {
    const bad = await call("PUT", "/progress/1", { token, body: { completedLessons: ["nope"] } });
    assert.strictEqual(bad.status, 400);
    const notArray = await call("PUT", "/progress/1", { token, body: { completedLessons: "l1" } });
    assert.strictEqual(notArray.status, 400);
    const ok = await call("PUT", "/progress/1", {
      token,
      body: { completedLessons: ["l1", "l2", "l3", "l4"] }
    });
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(ok.body.percent, 80);
  });
  await test("GET /progress and /progress/:id", async () => {
    const all = await call("GET", "/progress", { token });
    assert.strictEqual(all.body[0].completedLessons.length, 4);
    const one = await call("GET", "/progress/1", { token });
    assert.strictEqual(one.body.totalLessons, 5);
  });
  await test("quiz still locked at 4/5 lessons", async () => {
    assert.strictEqual((await call("GET", "/quiz/1", { token })).status, 403);
  });
  await call("PATCH", "/progress/1", { token, body: { lessonId: "l5" } });

  console.log("\nQuiz (GET / POST, graded on server)");
  let quiz;
  await test("GET /quiz/:id hides correct answers", async () => {
    const r = await call("GET", "/quiz/1", { token });
    assert.strictEqual(r.status, 200);
    quiz = r.body;
    assert.ok(quiz.questions.length > 0);
    assert.ok(quiz.questions.every((q) => q.answer === undefined));
  });
  await test("submit rejects malformed answers (400)", async () => {
    assert.strictEqual((await call("POST", "/quiz/1/submit", { token, body: {} })).status, 400);
    const bad = await call("POST", "/quiz/1/submit", {
      token,
      body: { answers: { [quiz.questions[0].id]: 99 } }
    });
    assert.strictEqual(bad.status, 400);
  });
  await test("certificate locked before passing (403)", async () => {
    const r = await call("POST", "/certificates", { token, body: { courseId: "1" } });
    assert.strictEqual(r.status, 403);
    assert.strictEqual(r.body.code, "CERTIFICATE_LOCKED");
  });
  await test("failing attempt is graded and recorded", async () => {
    const r = await call("POST", "/quiz/1/submit", { token, body: { answers: {} } });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.attempt.score, 0);
    assert.strictEqual(r.body.attempt.passed, false);
    assert.strictEqual(r.body.result.attempts, 1);
  });
  await test("passing attempt (correct answers) updates summary", async () => {
    const db = JSON.parse(fs.readFileSync(path.join(__dirname, "db.json"), "utf8"));
    const answers = {};
    db.quizzes.find((z) => z.courseId === "1").questions.forEach((q) => {
      answers[q.id] = q.answer;
    });
    const r = await call("POST", "/quiz/1/submit", { token, body: { answers } });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.attempt.passed, true);
    assert.strictEqual(r.body.result.attempts, 2);
    assert.strictEqual(r.body.result.passed, true);
    assert.strictEqual(r.body.result.bestScore, r.body.attempt.total);
  });
  await test("GET /quiz-results returns summary", async () => {
    const r = await call("GET", "/quiz-results", { token });
    assert.strictEqual(r.body.length, 1);
    assert.strictEqual(r.body[0].passed, true);
  });

  console.log("\nAssignments (POST / GET)");
  await test("assignment validation (400)", async () => {
    assert.strictEqual(
      (await call("POST", "/assignments", { token, body: { title: "ab", notes: "x" } })).status,
      400
    );
    assert.strictEqual(
      (await call("POST", "/assignments", { token, body: { title: "Project", notes: "" } })).status,
      400
    );
  });
  await test("POST /assignments saves and GET returns it", async () => {
    const r = await call("POST", "/assignments", {
      token,
      body: { title: "React Project", notes: "Built a todo app", fileName: "todo.zip" }
    });
    assert.strictEqual(r.status, 201);
    const list = await call("GET", "/assignments", { token });
    assert.strictEqual(list.body.length, 1);
    assert.strictEqual(list.body[0].fileName, "todo.zip");
  });

  console.log("\nCertificates");
  await test("certificate issued after passing; second call returns the same one", async () => {
    const a = await call("POST", "/certificates", { token, body: { courseId: "1" } });
    assert.strictEqual(a.status, 201);
    const b = await call("POST", "/certificates", { token, body: { courseId: "1" } });
    assert.strictEqual(b.status, 200);
    assert.strictEqual(a.body.id, b.body.id);
    const list = await call("GET", "/certificates", { token });
    assert.strictEqual(list.body.length, 1);
  });

  console.log("\nLearning history (GET)");
  await test("history lists every action newest first, with filters", async () => {
    const r = await call("GET", "/history", { token });
    assert.strictEqual(r.status, 200);
    const types = r.body.map((h) => h.type);
    ["enrolled", "lesson_completed", "quiz_submitted", "assignment_submitted", "certificate_issued"].forEach(
      (t) => assert.ok(types.includes(t), `missing ${t}`)
    );
    const times = r.body.map((h) => h.timestamp);
    assert.deepStrictEqual(times, [...times].sort().reverse());
    const quizOnly = await call("GET", "/history?type=quiz_submitted&limit=1", { token });
    assert.strictEqual(quizOnly.body.length, 1);
  });

  console.log("\nData isolation between students");
  let token2;
  await test("a second student sees none of the first student's data", async () => {
    await call("POST", "/auth/register", {
      body: { name: "Other Student", email: "other@example.com", studentId: "STU2002", password: "password9" }
    });
    const login = await call("POST", "/auth/login", {
      body: { identifier: "other@example.com", password: "password9" }
    });
    token2 = login.body.token;
    for (const url of ["/enrollments", "/progress", "/assignments", "/certificates", "/history", "/quiz-results"]) {
      assert.deepStrictEqual((await call("GET", url, { token: token2 })).body, [], url);
    }
    assert.strictEqual((await call("GET", "/quiz/1", { token: token2 })).status, 403);
    assert.strictEqual(
      (await call("POST", "/certificates", { token: token2, body: { courseId: "1" } })).status,
      403
    );
  });

  console.log("\nDELETE enrollment");
  await test("student can leave a course", async () => {
    await call("POST", "/enrollments", {
      token: token2,
      body: { courseId: "2", name: "Other Student", email: "other@example.com", phone: "123456" }
    });
    assert.strictEqual((await call("DELETE", "/enrollments/2", { token: token2 })).status, 200);
    assert.strictEqual((await call("DELETE", "/enrollments/2", { token: token2 })).status, 403);
  });

  console.log("\nLogout");
  await test("logout revokes the token on the server", async () => {
    const out = await call("POST", "/auth/logout", { token });
    assert.strictEqual(out.status, 200);
    const after = await call("GET", "/enrollments", { token });
    assert.strictEqual(after.status, 401);
    assert.strictEqual(after.body.code, "TOKEN_REVOKED");
  });
  await test("other sessions stay valid after one logout", async () => {
    assert.strictEqual((await call("GET", "/enrollments", { token: token2 })).status, 200);
  });

  console.log("\nHTTP basics");
  await test("unknown route 404, wrong method 405, bad JSON 400, CORS preflight 204", async () => {
    assert.strictEqual((await call("GET", "/nope")).status, 404);
    assert.strictEqual((await call("DELETE", "/courses")).status, 405);
    const bad = await fetch(`http://localhost:${port}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json"
    });
    assert.strictEqual(bad.status, 400);
    const pre = await fetch(`http://localhost:${port}/enrollments`, { method: "OPTIONS" });
    assert.strictEqual(pre.status, 204);
    assert.ok(pre.headers.get("access-control-allow-headers").includes("Authorization"));
  });
  server.removeAllListeners("exit");
  server.kill();

  console.log("\nExpired token (server started with a 1 second token lifetime)");
  const port2 = port + 500;
  const short = await startServer(port2, { TOKEN_TTL_SECONDS: "1" });
  const call2 = client(port2);
  await call2("POST", "/auth/register", { body: student });
  const login = await call2("POST", "/auth/login", {
    body: { identifier: student.email, password: student.password }
  });
  await test("fresh token works", async () => {
    assert.strictEqual((await call2("GET", "/enrollments", { token: login.body.token })).status, 200);
  });
  await new Promise((r) => setTimeout(r, 2200));
  await test("same token after expiry -> 401 TOKEN_EXPIRED", async () => {
    const r = await call2("GET", "/enrollments", { token: login.body.token });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.code, "TOKEN_EXPIRED");
  });
  short.removeAllListeners("exit");
  short.kill();

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
