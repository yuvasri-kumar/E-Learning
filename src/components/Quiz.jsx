import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitQuizAttempt } from "../store/learningSlice";
import {
  selectEnrolledCourseIds,
  selectCompletedLessons,
  selectQuizResults
} from "../store/selectors";
import DataStatus from "./DataStatus";
import useFetch from "../api/useFetch";
import { fetchQuizByCourseId } from "../api/courseApi";
import { loadQuizDraft, saveQuizDraft } from "../utils/quizDraftStore";
const TIME_LIMIT_SECONDS = 60;
export default function Quiz(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const enrolledCourseIds = useSelector(selectEnrolledCourseIds);
  const completedLessons = useSelector(selectCompletedLessons);
  const quizResults = useSelector(selectQuizResults);
  const onQuizComplete = useCallback(
    (courseId, answers) =>
      dispatch(submitQuizAttempt({ courseId, answers })).unwrap(),
    [dispatch]
  );
  const shared = {
    ...props,
    enrolledCourseIds,
    completedLessons,
    quizResults
  };
  return id ? (
    <CourseQuiz key={id} {...shared} onQuizComplete={onQuizComplete} />
  ) : (
    <QuizPicker {...shared} />
  );
}
function QuizPicker({
  courses,
  enrolledCourseIds = [],
  completedLessons = {},
  quizResults = {}
}) {
  const enrolled = courses.filter((c) => enrolledCourseIds.includes(c.id));
  return (
    <div className="container">
      <h1 className="section-title">Quiz</h1>
      {enrolled.length === 0 ? (
        <div className="empty-state">
          <p>Enroll in a course to take its quiz.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="dashboard-list">
          {enrolled.map((course) => {
            const total = course.lessonList ? course.lessonList.length : 0;
            const done = (completedLessons[course.id] || []).length;
            const result = quizResults[course.id];
            const unlocked = total > 0 && done === total;
            return (
              <div className="dashboard-item card" key={course.id}>
                <div>
                  <h3>{course.title} Quiz</h3>
                  <p className="muted">
                    {result
                      ? result.passed
                        ? "Passed ✅"
                        : "Not passed yet"
                      : unlocked
                      ? "Ready to attempt"
                      : `Locked (${done}/${total} lessons done)`}
                  </p>
                </div>
                <div className="dashboard-actions">
                  <Link to={`/quiz/${course.id}`} className="btn btn-primary">
                    {unlocked ? "Open Quiz" : "View"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function CourseQuiz({
  courses,
  completedLessons = {},
  quizResults = {},
  onQuizComplete
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const relatedCourse = useMemo(
    () => (id ? courses.find((c) => c.id === id) : null),
    [courses, id]
  );
  const totalLessons = relatedCourse && relatedCourse.lessonList
    ? relatedCourse.lessonList.length
    : 0;
  const doneCount = id ? (completedLessons[id] || []).length : 0;
  const isLocked =
    !!relatedCourse && totalLessons > 0 && doneCount < totalLessons;
  const {
    data: quizData,
    loading,
    error,
    retry
  } = useFetch((signal) => fetchQuizByCourseId(id, signal), [id]);
  const QUIZ_QUESTIONS = useMemo(
    () => (quizData && quizData.questions ? quizData.questions : []),
    [quizData]
  );
  const [answers, setAnswers] = useState(() => loadQuizDraft(id));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [validationError, setValidationError] = useState("");
  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittingRef = useRef(false);
  const autoSubmitTriedRef = useRef(false);
  const timedOut = timeLeft <= 0;
  useEffect(() => {
    if (submitted || isLocked || loading || error || submitting || timedOut) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted, isLocked, loading, error, submitting, timedOut]);
  useEffect(() => {
    saveQuizDraft(id, submitted ? {} : answers);
  }, [id, answers, submitted]);
  const handleSelect = useCallback(
    (questionId, optionIndex) => {
      if (submitted) return;
      setValidationError("");
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    },
    [submitted]
  );
  const doSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await onQuizComplete(id, answersRef.current);
      setResult(data.attempt);
      setSubmitted(true);
    } catch (message) {
      setSubmitError(
        typeof message === "string"
          ? message
          : "Could not submit your quiz. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [id, onQuizComplete]);
  const handleSubmit = useCallback(() => {
    const unanswered = QUIZ_QUESTIONS.filter(
      (q) => answers[q.id] === undefined
    ).length;
    if (unanswered > 0 && !timedOut) {
      setValidationError(
        `Please answer all questions (${unanswered} remaining).`
      );
      return;
    }
    setValidationError("");
    clearInterval(timerRef.current);
    doSubmit();
  }, [answers, QUIZ_QUESTIONS, timedOut, doSubmit]);
  useEffect(() => {
    if (
      timedOut &&
      !submitted &&
      !isLocked &&
      !loading &&
      !error &&
      !autoSubmitTriedRef.current
    ) {
      autoSubmitTriedRef.current = true;
      doSubmit();
    }
  }, [timedOut, submitted, isLocked, loading, error, doSubmit]);
  const handleRetake = useCallback(() => {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
    setSubmitError("");
    setValidationError("");
    autoSubmitTriedRef.current = false;
    setTimeLeft(TIME_LIMIT_SECONDS);
  }, []);
  const score = result ? result.score : null;
  const passed = !!(result && result.passed);
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  if (isLocked) {
    return (
      <div className="container">
        <h1 className="section-title">
          Quiz{relatedCourse ? `: ${relatedCourse.title}` : ""}
        </h1>
        <div className="card success-card">
          <h2>Quiz Locked 🔒</h2>
          <p>
            Complete all {totalLessons} lessons ({doneCount}/{totalLessons}{" "}
            done) to unlock this quiz.
          </p>
          <Link to={`/courses/${id}`} className="btn btn-primary">
            Go to Lessons
          </Link>
        </div>
      </div>
    );
  }
  if (loading || error) {
    return (
      <div className="container">
        <h1 className="section-title">
          Quiz{relatedCourse ? `: ${relatedCourse.title}` : ""}
        </h1>
        <DataStatus
          loading={loading}
          error={error}
          onRetry={retry}
          loadingText="Loading quiz questions..."
        />
      </div>
    );
  }
  return (
    <div className="container">
      <h1 className="section-title">
        Quiz{relatedCourse ? `: ${relatedCourse.title}` : ""}
      </h1>
      {!submitted && (
        <div className="quiz-timer">⏱ Time Left: {minutes}:{seconds}</div>
      )}
      {submitted ? (
        <div className="card success-card">
          <h2>Your Score: {score} / {result.total}</h2>
          <p>
            {passed
              ? "Great job! You passed the quiz. 🎉"
              : `You need at least ${result.passingScore}/${result.total} to pass. Review the lessons and try again.`}
          </p>
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handleRetake}>
              Retake Quiz
            </button>
            {passed && (
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/certificate")}
              >
                View Certificate
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="quiz-list">
          {QUIZ_QUESTIONS.map((q, qIdx) => (
            <div className="card quiz-question" key={q.id}>
              <h3>
                {qIdx + 1}. {q.question}
              </h3>
              <div className="options-list">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`option ${
                      answers[q.id] === optIdx ? "option-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === optIdx}
                      onChange={() => handleSelect(q.id, optIdx)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {validationError && (
            <span className="error-text">{validationError}</span>
          )}
          {submitError && (
            <span className="error-text" role="alert">
              ⚠ {submitError}
            </span>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}
