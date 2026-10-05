import React, { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LearningDashboard({
  enrolledCourses,
  progress,
  completedLessons,
  quizResults
}) {
  const [greeting, setGreeting] = useState("");

  // useEffect: set a time-based greeting once on mount
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // useMemo: compute overall completion stats only when inputs change
  const overallStats = useMemo(() => {
    const total = enrolledCourses.length;
    const totalProgress = enrolledCourses.reduce(
      (sum, c) => sum + (progress[c.id] || 0),
      0
    );
    const avg = total > 0 ? Math.round(totalProgress / total) : 0;
    const completed = enrolledCourses.filter(
      (c) => quizResults[c.id] && quizResults[c.id].passed
    ).length;
    return { total, avg, completed };
  }, [enrolledCourses, progress, quizResults]);

  return (
    <div className="container">
      <h1 className="section-title">
        {greeting}, welcome to your Dashboard 👋
      </h1>

      <div className="stats-row">
        <div className="stat-box">
          <h3>{overallStats.total}</h3>
          <p>Enrolled Courses</p>
        </div>
        <div className="stat-box">
          <h3>{overallStats.avg}%</h3>
          <p>Average Progress</p>
        </div>
        <div className="stat-box">
          <h3>{overallStats.completed}</h3>
          <p>Completed Courses</p>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="dashboard-list">
          {enrolledCourses.map((course) => {
            const percent = progress[course.id] || 0;
            const totalLessons = course.lessonList
              ? course.lessonList.length
              : 0;
            const doneCount = (completedLessons[course.id] || []).length;
            const allLessonsDone =
              totalLessons > 0 && doneCount === totalLessons;
            const quizResult = quizResults[course.id];
            const quizPassed = !!(quizResult && quizResult.passed);

            let quizStatusText = "Locked";
            if (quizPassed) quizStatusText = "Passed ✅";
            else if (quizResult) quizStatusText = "Failed – Retake";
            else if (allLessonsDone) quizStatusText = "Ready to Attend";

            const certificateStatusText = quizPassed ? "Unlocked 🎓" : "Locked";

            return (
              <div className="dashboard-item card" key={course.id}>
                <div>
                  <h3>{course.title}</h3>
                  <p className="muted">{course.category}</p>
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span>{percent}% complete</span>
                  <p className="muted">
                    Lessons completed: {doneCount}/{totalLessons} • Quiz:{" "}
                    {quizStatusText} • Certificate: {certificateStatusText}
                  </p>
                </div>
                <div className="dashboard-actions">
                  <Link to={`/courses/${course.id}`} className="btn btn-secondary">
                    Resume
                  </Link>
                  {allLessonsDone && (
                    <Link to={`/quiz/${course.id}`} className="btn btn-outline">
                      {quizPassed ? "Review Quiz" : "Take Quiz"}
                    </Link>
                  )}
                  {quizPassed && (
                    <Link to="/certificate" className="btn btn-primary">
                      Certificate
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
