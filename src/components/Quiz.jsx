import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DataStatus from "./DataStatus";
import useFetch from "../api/useFetch";
import { fetchQuizByCourseId } from "../api/courseApi";
import { loadQuizDraft, saveQuizDraft } from "../utils/quizDraftStore";

const TIME_LIMIT_SECONDS = 60;

// Experiment 1: /quiz/:id  ->  quiz of that course only.
// The `key` makes React start a fresh quiz (timer, answers, result) whenever
// the course id in the URL changes, so quizzes never leak between courses.
export default function Quiz(props) {
  const { id } = useParams();
  return id ? (
    <CourseQuiz key={id} {...props} />
  ) : (
    <QuizPicker {...props} />
  );
}

// /quiz (no course chosen): pick the course whose quiz you want to take.
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

  // A quiz tied to a course is only unlocked once every lesson is completed
  const totalLessons = relatedCourse && relatedCourse.lessonList
    ? relatedCourse.lessonList.length
    : 0;
  const doneCount = id ? (completedLessons[id] || []).length : 0;
  const isLocked =
    !!relatedCourse && totalLessons > 0 && doneCount < totalLessons;

  // Experiment 1: load only this course's questions  GET /quiz/:id
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
  // Minimum correct answers required to pass and unlock the certificate
  const PASSING_SCORE = Math.ceil(QUIZ_QUESTIONS.length * 0.75);

  // Answers picked so far are restored from this course's own saved draft
  const [answers, setAnswers] = useState(() => loadQuizDraft(id));
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  // Experiment 4: simple validation message for unanswered questions
  const [validationError, setValidationError] = useState("");
  const timerRef = useRef(null);

  // useEffect + useRef: run a countdown timer, auto-submit when it hits zero
  useEffect(() => {
    if (submitted || isLocked || loading || error) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [submitted, isLocked, loading, error]);

  // Save this course's in-progress answers (cleared once submitted)
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

  const handleSubmit = useCallback(() => {
    // Validation: every question must be answered before submitting
    const unanswered = QUIZ_QUESTIONS.filter(
      (q) => answers[q.id] === undefined
    ).length;
    if (unanswered > 0) {
      setValidationError(
        `Please answer all questions (${unanswered} remaining).`
      );
      return;
    }
    setValidationError("");
    clearInterval(timerRef.current);
    setSubmitted(true);
  }, [answers, QUIZ_QUESTIONS]);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setValidationError("");
    setTimeLeft(TIME_LIMIT_SECONDS);
  }, []);

  // useMemo: only recalculate the score when answers or submitted state change
  const score = useMemo(() => {
    if (!submitted) return null;
    return QUIZ_QUESTIONS.reduce(
      (total, q) => (answers[q.id] === q.answer ? total + 1 : total),
      0
    );
  }, [submitted, answers, QUIZ_QUESTIONS]);

  const passed = score !== null && score >= PASSING_SCORE;

  // Report the outcome back up to the app once the quiz is submitted,
  // so course completion / certificate unlock can be updated and persisted.
  useEffect(() => {
    if (submitted && score !== null && id && onQuizComplete) {
      onQuizComplete(id, {
        passed,
        score,
        total: QUIZ_QUESTIONS.length
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, score, id]);

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
          <h2>Your Score: {score} / {QUIZ_QUESTIONS.length}</h2>
          <p>
            {passed
              ? "Great job! You passed the quiz. 🎉"
              : `You need at least ${PASSING_SCORE}/${QUIZ_QUESTIONS.length} to pass. Review the lessons and try again.`}
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
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
