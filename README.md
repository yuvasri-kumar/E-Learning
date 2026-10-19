# EduSphere - E-Learning Web Application

A beginner-friendly, responsive e-learning platform built with **React**, **JSX**, and **React Router**.

## Features

- **Pages / Routes** (via `react-router-dom`):
  - `/` — Home
  - `/courses` — Course List (search + filter)
  - `/courses/:id` — Course Detail
  - `/enrollment/:id` — Enrollment form
  - `/dashboard` — Learning Dashboard (progress tracking)
  - `/quiz` and `/quiz/:id` — Timed Quiz
  - `/assignment` — Assignment submission
  - `/certificate` — Certificate generator
  - `/profile` — User profile

- **Reusable components**: `Header`, `Footer`, `Home`, `CourseList`, `CourseCard`,
  `CourseDetail`, `SearchBar`, `FilterPanel`, `Enrollment`, `LearningDashboard`,
  `Quiz`, `Assignment`, `Certificate`, `Profile`.

- **React Hooks used throughout**: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`.

- Clean, responsive CSS (`src/styles/App.css`) with a mobile hamburger menu.

## Experiment 1: Test E-Learning Components (Jest + React Testing Library)

The component test suite is in `src/__tests__/components.test.jsx` and covers course cards, search and filter controls, six-course pagination, enrollment validation/submission, course details and learning materials, quiz interactions, assignment submission, and learning-progress updates.

Install the test libraries with `npm install`, then run the tests in non-watch mode:

```bash
npm run test:ci
```

The React Scripts Jest runner is used together with React Testing Library and `@testing-library/jest-dom`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
elearning-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Home.jsx
│   │   ├── CourseList.jsx
│   │   ├── CourseCard.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── Enrollment.jsx
│   │   ├── LearningDashboard.jsx
│   │   ├── Quiz.jsx
│   │   ├── Assignment.jsx
│   │   ├── Certificate.jsx
│   │   └── Profile.jsx
│   ├── data/
│   │   └── courses.js
│   ├── styles/
│   │   └── App.css
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md
```

## Notes

- Course/enrollment/progress data is kept in React state at the `App` level and
  passed down as props — no backend is required to try it out.
- Progress on the Dashboard can be bumped up manually ("Mark 10% Progress") to
  simulate lesson completion; once a course hits 100%, it becomes eligible for
  a certificate.
- Swap the in-memory state for API calls / localStorage / a backend of your
  choice to make it persistent.

## Course REST API

Courses, learning materials and quizzes are loaded from a REST API (Fetch + async/await).

```bash
npm install
npm run dev        # API (http://localhost:5000) + React app (http://localhost:3000)
```

Or in two terminals: `npm run api` and `npm start`.

| Endpoint | Purpose |
| --- | --- |
| `GET /courses?q=&category=&level=` | List courses with search and filters |
| `GET /courses/:id` | One course (details, lessons, learning materials) |
| `GET /quiz/:id` | Quiz questions for that course only (**login required since Experiment 4**; correct answers are never sent to the browser) |

Course -> Details -> Quiz is linked by course id: `/courses/2` -> `/quiz/2`.
Quiz results (best score, attempts, passed) and in-progress answers are saved per course id.
Data lives in `server/db.json`. Set `REACT_APP_API_URL` to use a different API address.

## Experiment 2: Redux Toolkit

Global learning state lives in a Redux store (`src/store`).

- `learning` slice: enrolled courses, course progress (completed lessons), quiz scores, assignments
- `courses` slice: courses fetched from the REST API with `idle/loading/succeeded/failed` status and error
- Actions: `enrollCourse`, `updateProgress`, `saveQuizScore`, `updateAssignment`
- Middleware: `loggerMiddleware` logs `learning/*` and `courses/*` actions in the browser console
- Caching: learning data, assignments and the last course list are saved to localStorage and restored on load

## Experiment 3: Course Enrollment and Learning CRUD (REST + Axios)

All learning data now lives on the server (per student) and the React app talks to it with **Axios**
(`src/api/client.js`, `courseApi.js`, `learningApi.js`). The Redux `learning` slice is filled from the API
(`loadLearning`) and only changes after the server confirms an action - there are no fake success messages.

| Requirement | Endpoint | Where in the UI |
| --- | --- | --- |
| a) Retrieve courses | `GET /courses`, `GET /courses/:id` | Home, Courses, Course Detail |
| b) Create enrollment | `POST /enrollments` | Enrollment form |
| c) Update learning progress | `PATCH /progress/:courseId` (mark a lesson done), `PUT /progress/:courseId` (replace the list) | "Mark as Completed" on Course Detail |
| d) Submit quiz / assignment | `POST /quiz/:courseId/submit`, `POST /assignments` | Quiz, Assignment |
| e) Learning history | `GET /history` (`?type=`, `?courseId=`, `?limit=`) | "Learning History" on the Dashboard |
| f) Loading and errors | `DataStatus` component, button "..." states, error text | every screen above |

Other endpoints: `GET /enrollments`, `DELETE /enrollments/:courseId`, `GET /progress`, `GET /progress/:courseId`,
`GET /quiz-results`, `GET /assignments`, `GET /certificates`.

Server-side rules: progress and quiz need an enrollment; the quiz unlocks only after every lesson is complete;
quizzes are graded on the server (pass mark = 75%); duplicate enrollments return `409`.
Student data is stored in `server/store.json` (created automatically on first write; `server/db.json` still holds the course content).

## Experiment 4: Authentication and Token Management

| Requirement | Implementation |
| --- | --- |
| a) Student login | `POST /auth/register`, `POST /auth/login` (email or Student ID + password). Passwords are hashed with scrypt; inputs are validated in the form and again on the server. |
| b) Store the token | The signed token (JWT, HS256) is saved by `src/utils/tokenStore.js` in `localStorage`. It is generated by the server at login - nothing is hard coded. |
| c) Attach the token | The Axios request interceptor in `src/api/client.js` adds `Authorization: Bearer <token>` to every request. |
| d) Protected operations | The server checks the token on enrollment, progress, quiz, assignment, certificate and history endpoints. Without a valid token they return `401`. In the UI these pages are wrapped in `ProtectedRoute`. |
| e) Logout | `POST /auth/logout` revokes the token on the server; the app removes the token, the saved user, quiz drafts and the Redux learning data. |
| f) Unauthorized / expired tokens | The server answers `401` with a `code` (`NO_TOKEN`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `TOKEN_REVOKED`). The Axios response interceptor ends the session and the student lands on the Login page with the message (e.g. "Your session has expired. Please log in again."). A timer also logs the student out when the token runs out while idle. |

Also: `GET /auth/me` (used on app start to check the saved token) and certificates are issued by the server
(`POST /certificates`) only after the quiz has been passed.

### Server settings (optional environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `JWT_SECRET` | random value saved in `server/.jwt-secret` | Token signing secret |
| `TOKEN_TTL_SECONDS` | `3600` | Token lifetime (set to e.g. `30` to try expiry) |
| `REACT_APP_API_URL` | `http://localhost:5000` | API address used by the React app |

### Run and test

```bash
npm install
npm run dev        # API on :5000 + React app on :3000
npm run test:api   # starts the API on a temporary data file and checks every endpoint (55 checks)
```

Notes:
- Students must sign up once on the Login page (accounts are stored on the server, not in the browser).
  Accounts created in older versions that were kept only in the browser are not carried over.
- Payment for paid courses is still the original front-end-only flow; it is not verified by the API.


## Admin-only Course CRUD

- Start both apps with `npm run dev`.
- Admin login: `admin@edusphere.com` / `Admin@12345` (change these with `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables before starting the API for a non-demo deployment).
- After login, use **Admin CRUD** in the navigation to create, read, update, and delete courses.
- Student sign-up always creates a `student` role; the browser cannot promote itself to admin.
- The backend requires a valid bearer token and checks the user's role on `POST /courses`, `PUT /courses/:id`, and `DELETE /courses/:id`. Students and guests can only read course data; direct API calls are also rejected with HTTP 403.
- The demo admin password is intended for local coursework only. Set a strong secret via environment variables before deploying publicly.


## Course Catalog Updates

The course catalog contains 10 courses in `src/data/courses.js` and `server/db.json`, with a course-specific quiz record for each course. The Courses page displays six courses per page (Page 1: courses 1–6; Page 2: courses 7–12). Search and category/level filters continue to apply before pagination.


## Experiment 2: Optimize the E-Learning Application

- **Lazy loading and code splitting:** route-level components (course list/detail, quiz, learning dashboard, enrollment, assignment, certificate, profile, payment, login, and admin course management) are loaded with `React.lazy` and `Suspense`, so each route can be delivered in a separate bundle when needed.
- **Media performance:** course images use `loading="lazy"` and `decoding="async"`; course search/filter results continue to load through the API with loading/error states.
- **PWA:** `public/manifest.json` describes the installable app; `public/service-worker.js` caches the app shell and same-origin static resources for repeat visits and a basic offline navigation fallback. The service worker registers only in production. API results and authenticated data are not intentionally cached by the service worker.
- **Accessibility:** a keyboard-focusable skip link, visible `:focus-visible` outlines, semantic pagination navigation, live page status, labels on form fields, and reduced-motion support improve keyboard and assistive-technology use.
- **Security:** the API sends `nosniff`, frame-denial, referrer, permissions, and no-store headers; enrollment fields have browser-side required/length constraints; React escapes ordinary rendered text and the existing API validates requests and verifies authentication tokens server-side. Client-side checks do not replace server-side validation.

## Updated Course Catalog

The catalog now contains **12 courses** in `src/data/courses.js` and `server/db.json`, with matching course-specific quiz records. The Courses page shows **6 courses per page**: Page 1 contains courses 1–6 and Page 2 contains courses 7–12. Search and category/level filters apply before pagination.
