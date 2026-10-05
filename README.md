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

## Experiment 1: Course REST API

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
| `GET /quiz/:id` | Quiz questions for that course only |

Course -> Details -> Quiz is linked by course id: `/courses/2` -> `/quiz/2`.
Quiz results (best score, attempts, passed) and in-progress answers are saved per course id.
Data lives in `server/db.json`. Set `REACT_APP_API_URL` to use a different API address.
