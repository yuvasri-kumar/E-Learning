import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { markLessonComplete } from "../store/learningSlice";
import LearningGate from "./LearningGate";
import {
  selectEnrolledCourseIds,
  selectCompletedLessons,
  selectQuizResults
} from "../store/selectors";
import DataStatus from "./DataStatus";
import useFetch from "../api/useFetch";
import { fetchCourseById } from "../api/courseApi";
export default function CourseDetail(props) {
  return (
    <LearningGate>
      <CourseDetailContent {...props} />
    </LearningGate>
  );
}
function CourseDetailContent({ paidCourseIds = [] }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const enrolledCourseIds = useSelector(selectEnrolledCourseIds);
  const completedLessons = useSelector(selectCompletedLessons);
  const quizResults = useSelector(selectQuizResults);
  const navigate = useNavigate();
  const {
    data: course,
    loading,
    error,
    retry
  } = useFetch((signal) => fetchCourseById(id, signal), [id]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = course ? `${course.title} - EduSphere` : "EduSphere";
  }, [course]);
  const isEnrolled = enrolledCourseIds.includes(id);
  const isPaidCourse = !!course && course.price > 0;
  const isPaidFor = paidCourseIds.includes(id);
  const lessonList = course && course.lessonList ? course.lessonList : [];
  const doneLessonIds = completedLessons[id] || [];
  const totalLessons = lessonList.length;
  const doneCount = doneLessonIds.length;
  const percent =
    totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  const allLessonsDone = totalLessons > 0 && doneCount === totalLessons;
  const quizResult = quizResults[id];
  const quizPassed = !!(quizResult && quizResult.passed);
  const [openLessonId, setOpenLessonId] = useState(null);
  const [savingLessonId, setSavingLessonId] = useState(null);
  const [progressError, setProgressError] = useState("");
  useEffect(() => {
    setOpenLessonId(null);
    setProgressError("");
  }, [id]);
  const toggleLesson = useCallback((lessonId) => {
    setOpenLessonId((prev) => (prev === lessonId ? null : lessonId));
  }, []);
  const handleMarkCompleted = useCallback(
    async (lessonId) => {
      setProgressError("");
      setSavingLessonId(lessonId);
      try {
        await dispatch(markLessonComplete({ courseId: id, lessonId })).unwrap();
      } catch (message) {
        setProgressError(
          typeof message === "string"
            ? message
            : "Could not save your progress. Please try again."
        );
      } finally {
        setSavingLessonId(null);
      }
    },
    [id, dispatch]
  );
  if (loading || (error && !course)) {
    const notFound = error && error.toLowerCase().includes("not found");
    if (!loading && notFound) {
      return (
        <div className="container">
          <h2>Course not found</h2>
          <button className="btn btn-primary" onClick={() => navigate("/courses")}>
            Back to Courses
          </button>
        </div>
      );
    }
    return (
      <div className="container">
        <DataStatus
          loading={loading}
          error={error}
          onRetry={retry}
          loadingText="Loading course details..."
        />
      </div>
    );
  }
  if (!course) {
    return (
      <div className="container">
        <h2>Course not found</h2>
        <button className="btn btn-primary" onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    );
  }
  return (
    <div className="container course-detail">
      <img src={course.image} alt={course.title} className="detail-image" loading="lazy" decoding="async" />
      <div className="detail-info">
        <span className="badge">{course.level}</span>
        <h1>{course.title}</h1>
        <p className="muted">
          {course.category} • {course.duration} • {course.lessons} lessons
        </p>
        <p className="muted">Instructor: {course.instructor}</p>
        <p className="rating">⭐ {course.rating} / 5</p>
        <p>{course.description}</p>
        <h3>Syllabus</h3>
        <ul className="syllabus-list">
          {course.syllabus.map((topic, idx) => (
            <li key={idx}>{topic}</li>
          ))}
        </ul>
        {}
        <h3>Learning Materials</h3>
        {course.materials && course.materials.length > 0 ? (
          <ul className="syllabus-list">
            {course.materials.map((m) => (
              <li key={m.id}>
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  {m.title}
                </a>{" "}
                <span className="badge">{m.type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No learning materials available yet.</p>
        )}
        {!isEnrolled ? (
          <div className="detail-actions">
            <span className="price price-large">
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </span>
            {isPaidCourse && !isPaidFor ? (
              <>
                <p className="error-text">
                  Please complete payment to access this course.
                </p>
                <Link
                  to={`/payment/${course.id}`}
                  className="btn btn-primary"
                >
                  Pay Now
                </Link>
              </>
            ) : (
              <Link to={`/enrollment/${course.id}`} className="btn btn-primary">
                Enroll Now
              </Link>
            )}
          </div>
        ) : (
          <>
            <h3>Lessons</h3>
            <div className="progress-wrap" style={{ marginBottom: "1rem" }}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span>
                {doneCount}/{totalLessons} lessons complete ({percent}%)
              </span>
            </div>
            {}
            <p className="muted">
              {course.title} Quiz:{" "}
              {quizResult
                ? `${quizPassed ? "Passed ✅" : "Not passed yet"} (best ${
                    quizResult.bestScore ?? quizResult.score
                  }/${quizResult.total}, ${quizResult.attempts || 1} attempt${
                    (quizResult.attempts || 1) > 1 ? "s" : ""
                  })`
                : allLessonsDone
                ? "Ready to attempt"
                : "Locked until all lessons are complete"}
            </p>
            {progressError && (
              <p className="error-text" role="alert">
                ⚠ {progressError}
              </p>
            )}
            <div className="dashboard-list">
              {lessonList.map((lesson, idx) => {
                const isDone = doneLessonIds.includes(lesson.id);
                const isOpen = openLessonId === lesson.id;
                return (
                  <div className="card dashboard-item" key={lesson.id}>
                    <div>
                      <h3>
                        {idx + 1}. {lesson.title}{" "}
                        {isDone && <span className="badge">Completed</span>}
                      </h3>
                      {isOpen && <p className="muted">{lesson.content}</p>}
                    </div>
                    <div className="dashboard-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => toggleLesson(lesson.id)}
                      >
                        {isOpen ? "Hide Lesson" : "Read Lesson"}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleMarkCompleted(lesson.id)}
                        disabled={isDone || savingLessonId !== null}
                      >
                        {isDone
                          ? "Completed"
                          : savingLessonId === lesson.id
                          ? "Saving..."
                          : "Mark as Completed"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="detail-actions">
              {allLessonsDone ? (
                <Link to={`/quiz/${course.id}`} className="btn btn-primary">
                  {quizPassed ? "Review Quiz" : "Take Quiz"}
                </Link>
              ) : (
                <button className="btn btn-secondary" disabled>
                  Complete all lessons to unlock the Quiz
                </button>
              )}
              {quizPassed && (
                <Link to="/certificate" className="btn btn-secondary">
                  View Certificate
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
