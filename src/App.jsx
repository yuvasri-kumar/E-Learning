import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import DataStatus from "./components/DataStatus";
import AdminRoute from "./components/AdminRoute";
import { loadCourses } from "./store/coursesSlice";
import { loadLearning, resetLearning } from "./store/learningSlice";
import {
  selectCourses,
  selectCoursesStatus,
  selectCoursesError,
  selectEnrolledCourses,
  selectProgress
} from "./store/selectors";
import { loadPaidCourses, savePaidCourses } from "./utils/paymentStore";
import { useAuth } from "./context/AuthContext";

const CourseList = lazy(() => import("./components/CourseList"));
const CourseDetail = lazy(() => import("./components/CourseDetail"));
const Enrollment = lazy(() => import("./components/Enrollment"));
const LearningDashboard = lazy(() => import("./components/LearningDashboard"));
const Quiz = lazy(() => import("./components/Quiz"));
const Assignment = lazy(() => import("./components/Assignment"));
const Certificate = lazy(() => import("./components/Certificate"));
const Profile = lazy(() => import("./components/Profile"));
const Login = lazy(() => import("./components/Login"));
const Payment = lazy(() => import("./components/Payment"));
const AdminCourses = lazy(() => import("./components/AdminCourses"));
export default function App() {
  const dispatch = useDispatch();
  const coursesData = useSelector(selectCourses);
  const coursesStatus = useSelector(selectCoursesStatus);
  const coursesErrorMessage = useSelector(selectCoursesError);
  const hasCourses = coursesData.length > 0;
  const coursesLoading =
    !hasCourses && (coursesStatus === "idle" || coursesStatus === "loading");
  const coursesError =
    !hasCourses && coursesStatus === "failed" ? coursesErrorMessage : "";
  const retryCourses = useCallback(() => dispatch(loadCourses()), [dispatch]);
  useEffect(() => {
    dispatch(loadCourses());
  }, [dispatch]);
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
  const { user } = useAuth();
  const userId = user ? user.id || user.email : null;
  useEffect(() => {
    if (userId) {
      dispatch(loadLearning());
    } else {
      dispatch(resetLearning());
    }
  }, [dispatch, userId]);
  const enrolledCourses = useSelector(selectEnrolledCourses);
  const progress = useSelector(selectProgress);
  const [paidCourseIds, setPaidCourseIds] = useState(loadPaidCourses);
  const [profile, setProfile] = useState({
    name: user ? user.name : "Guest Learner",
    email: user ? user.email : "guest@example.com",
    bio: "Passionate about learning new skills online.",
    avatar: "https://placehold.co/120x120?text=User"
  });
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user ? user.name : "Guest Learner",
      email: user ? user.email : "guest@example.com"
    }));
  }, [user]);
  useEffect(() => {
    savePaidCourses(paidCourseIds);
  }, [paidCourseIds]);
  const markCoursePaid = useCallback((courseId) => {
    setPaidCourseIds((prev) =>
      prev.includes(courseId) ? prev : [...prev, courseId]
    );
  }, []);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      <main className="main-content" id="main-content" tabIndex="-1">
        <Suspense fallback={<div className="container" role="status" aria-live="polite">Loading learning page...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
          <Route path="/" element={withCourses(<Home courses={coursesData} />)} />
          <Route
            path="/courses"
            element={withCourses(<CourseList courses={coursesData} />)}
          />
          <Route
            path="/courses/:id"
            element={
              <CourseDetail
                paidCourseIds={paidCourseIds}
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
                />
              </ProtectedRoute>
            )}
          />
          {}
          <Route
            path="/learning"
            element={withCourses(
              <ProtectedRoute>
                <LearningDashboard
                  enrolledCourses={enrolledCourses}
                  progress={progress}
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
          {}
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
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
