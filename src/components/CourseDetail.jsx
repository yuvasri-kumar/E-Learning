import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DataStatus from "./DataStatus";
import useFetch from "../api/useFetch";
import { fetchCourseById } from "../api/courseApi";

export default function CourseDetail({
  enrolledCourseIds = [],
  paidCourseIds = [],
  completedLessons = {},
  quizResults = {},
  onMarkLessonCompleted
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Experiment 1: load this course from the REST API using its id
  // GET /courses/:id
  const {
    data: course,
    loading,
    error,
    retry
  } = useFetch((signal) => fetchCourseById(id, signal), [id]);

  // useEffect: scroll to top whenever the viewed course changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = course ? `${course.title} - EduSphere` : "EduSphere";
  }, [course]);

  const isEnrolled = enrolledCourseIds.includes(id);
  // Experiment 5: paid courses need payment before enrollment
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

  // Track which lesson is currently expanded for reading
  const [openLessonId, setOpenLessonId] = useState(null);

  // Collapse any open lesson when another course is opened
  useEffect(() => {
    setOpenLessonId(null);
  }, [id]);

  const toggleLesson = useCallback((lessonId) => {
    setOpenLessonId((prev) => (prev === lessonId ? null : lessonId));
  }, []);

  const handleMarkCompleted = useCallback(
    (lessonId) => {
      onMarkLessonCompleted(id, lessonId);
    },
    [id, onMarkLessonCompleted]
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
      <img src={course.image} alt={course.title} className="detail-image" />
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

        {/* Experiment 1: learning materials of the selected course */}
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
            {/* Experiment 1: this course's own quiz progress */}
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
                        disabled={isDone}
                      >
                        {isDone ? "Completed" : "Mark as Completed"}
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
