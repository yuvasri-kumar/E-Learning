import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import CourseList from "./components/CourseList";
import CourseDetail from "./components/CourseDetail";
import Enrollment from "./components/Enrollment";
import LearningDashboard from "./components/LearningDashboard";
import Quiz from "./components/Quiz";
import Assignment from "./components/Assignment";
import Certificate from "./components/Certificate";
import Profile from "./components/Profile";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Payment from "./components/Payment";

import DataStatus from "./components/DataStatus";
import useFetch from "./api/useFetch";
import { fetchCourses } from "./api/courseApi";
import { loadProgress, saveProgress } from "./utils/progressStore";
import { loadPaidCourses, savePaidCourses } from "./utils/paymentStore";
import { useAuth } from "./context/AuthContext";

export default function App() {
  // Experiment 1: courses come from the REST API (GET /courses)
  const {
    data: fetchedCourses,
    loading: coursesLoading,
    error: coursesError,
    retry: retryCourses
  } = useFetch((signal) => fetchCourses({}, signal), []);
  const coursesData = useMemo(() => fetchedCourses || [], [fetchedCourses]);

  // Show loading / error messages instead of a page that needs course data
  const withCourses = (element) =>
    coursesLoading || coursesError ? (
      <div className="container">
        <DataStatus
          loading={coursesLoading}
          error={coursesError}
          onRetry={retryCourses}
          loadingText="Loading courses..."
        />
      </div>
    ) : (
      element
    );

  // Experiment 6: the logged-in student (name comes from their signup details)
  const { user } = useAuth();

  // Load any previously saved progress once, synchronously, before first render.
  const initialData = useRef(loadProgress());

  // Central app-level state shared across pages
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(
    initialData.current.enrolledCourseIds
  );
  // { [courseId]: string[] of completed lesson ids }
  const [completedLessons, setCompletedLessons] = useState(
    initialData.current.completedLessons
  );
  // { [courseId]: { passed: boolean, score: number, total: number } }
  const [quizResults, setQuizResults] = useState(
    initialData.current.quizResults
  );
  // Experiment 5: ids of paid courses the student has already paid for
  const [paidCourseIds, setPaidCourseIds] = useState(loadPaidCourses);
  const [profile, setProfile] = useState({
    name: user ? user.name : "Guest Learner",
    email: user ? user.email : "guest@example.com",
    bio: "Passionate about learning new skills online.",
    avatar: "https://placehold.co/120x120?text=User"
  });

  // Experiment 6: keep the profile name/email in sync with the logged-in user.
  // Runs on login, on logout, and after a page refresh (the session is
  // restored from localStorage by AuthContext).
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user ? user.name : "Guest Learner",
      email: user ? user.email : "guest@example.com"
    }));
  }, [user]);

  // Persist to localStorage whenever the trackable progress state changes
  useEffect(() => {
    saveProgress({ enrolledCourseIds, completedLessons, quizResults });
  }, [enrolledCourseIds, completedLessons, quizResults]);

  // Persist payment status whenever it changes
  useEffect(() => {
    savePaidCourses(paidCourseIds);
  }, [paidCourseIds]);

  // Experiment 5: mark a paid course as paid after successful payment
  const markCoursePaid = useCallback((courseId) => {
    setPaidCourseIds((prev) =>
      prev.includes(courseId) ? prev : [...prev, courseId]
    );
  }, []);

  // useCallback: stable function reference passed down to many children
  const enrollInCourse = useCallback((courseId) => {
    setEnrolledCourseIds((prev) =>
      prev.includes(courseId) ? prev : [...prev, courseId]
    );
    setCompletedLessons((prev) =>
      prev[courseId] ? prev : { ...prev, [courseId]: [] }
    );
  }, []);

  // Mark a single lesson as completed for a course (idempotent)
  const markLessonCompleted = useCallback((courseId, lessonId) => {
    setCompletedLessons((prev) => {
      const existing = prev[courseId] || [];
      if (existing.includes(lessonId)) return prev;
      return { ...prev, [courseId]: [...existing, lessonId] };
    });
  }, []);

  // Record the outcome of a quiz attempt for a course
  const recordQuizResult = useCallback((courseId, result) => {
    // Quiz progress is stored separately per course id. A later failed retake
    // never removes an earlier pass: we keep the best score and count attempts.
    setQuizResults((prev) => {
      const old = prev[courseId];
      const attempts = (old && old.attempts ? old.attempts : old ? 1 : 0) + 1;
      const bestScore = old ? Math.max(old.bestScore ?? old.score, result.score) : result.score;
      return {
        ...prev,
        [courseId]: {
          ...result,
          passed: result.passed || !!(old && old.passed),
          bestScore,
          attempts
        }
      };
    });
  }, []);

  // useMemo: derive enrolled course objects only when dependencies change
  const enrolledCourses = useMemo(
    () => coursesData.filter((c) => enrolledCourseIds.includes(c.id)),
    [coursesData, enrolledCourseIds]
  );

  // useMemo: derive real percentage progress per course from completed lessons
  const progress = useMemo(() => {
    const result = {};
    enrolledCourses.forEach((course) => {
      const totalLessons = course.lessonList ? course.lessonList.length : 0;
      const doneCount = (completedLessons[course.id] || []).length;
      result[course.id] =
        totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
    });
    return result;
  }, [enrolledCourses, completedLessons]);

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={withCourses(<Home courses={coursesData} />)} />
          <Route
            path="/courses"
            element={withCourses(<CourseList courses={coursesData} enrolledCourseIds={enrolledCourseIds} progress={progress} quizResults={quizResults} />)}
          />
          <Route
            path="/courses/:id"
            element={
              <CourseDetail
                enrolledCourseIds={enrolledCourseIds}
                paidCourseIds={paidCourseIds}
                completedLessons={completedLessons}
                quizResults={quizResults}
                onMarkLessonCompleted={markLessonCompleted}
              />
            }
          />
          <Route
            path="/enrollment/:id"
            element={withCourses(
              <ProtectedRoute>
                <Enrollment
                  courses={coursesData}
                  paidCourseIds={paidCourseIds}
                  onEnroll={enrollInCourse}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/payment/:id"
            element={withCourses(
              <ProtectedRoute>
                <Payment
                  courses={coursesData}
                  paidCourseIds={paidCourseIds}
                  onPaymentSuccess={markCoursePaid}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={withCourses(
              <ProtectedRoute>
                <LearningDashboard
                  enrolledCourses={enrolledCourses}
                  progress={progress}
                  completedLessons={completedLessons}
                  quizResults={quizResults}
                />
              </ProtectedRoute>
            )}
          />
          {/* /learning is an alias of the learning dashboard */}
          <Route
            path="/learning"
            element={withCourses(
              <ProtectedRoute>
                <LearningDashboard
                  enrolledCourses={enrolledCourses}
                  progress={progress}
                  completedLessons={completedLessons}
                  quizResults={quizResults}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/quiz"
            element={withCourses(
              <ProtectedRoute>
                <Quiz
                  courses={coursesData}
                  enrolledCourseIds={enrolledCourseIds}
                  completedLessons={completedLessons}
                  quizResults={quizResults}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/quiz/:id"
            element={withCourses(
              <ProtectedRoute>
                <Quiz
                  courses={coursesData}
                  completedLessons={completedLessons}
                  quizResults={quizResults}
                  onQuizComplete={recordQuizResult}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/assignment"
            element={
              <ProtectedRoute>
                <Assignment />
              </ProtectedRoute>
            }
          />
          {/* /assignments is an alias of the assignment page */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate"
            element={withCourses(
              <ProtectedRoute>
                <Certificate
                  enrolledCourses={enrolledCourses}
                  quizResults={quizResults}
                  learnerName={profile.name}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile profile={profile} onUpdate={setProfile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="container">
                <h2>404 - Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
