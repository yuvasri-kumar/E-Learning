import React from "react";
import { Link } from "react-router-dom";

// Experiment 1: `progress` (0-100) is optional. It is only passed for
// courses the student is enrolled in, so each course shows its own progress.
export default function CourseCard({ course, progress }) {
  return (
    <div className="card course-card">
      <img src={course.image} alt={course.title} className="course-image" />
      <div className="card-body">
        <span className="badge">{course.level}</span>
        <h3>{course.title}</h3>
        <p className="muted">{course.category}</p>
        <p className="course-desc">{course.description}</p>
        {progress !== undefined && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}% complete</span>
          </div>
        )}
        <div className="card-footer">
          <span className="price">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </span>
          <Link to={`/courses/${course.id}`} className="btn btn-outline">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
