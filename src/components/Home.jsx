import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";

export default function Home({ courses }) {
  // useMemo: only recompute "featured" list when courses array changes
  const featuredCourses = useMemo(() => courses.slice(0, 3), [courses]);

  return (
    <div className="container">
      <section className="hero">
        <h1>Learn Anything, Anytime, Anywhere</h1>
        <p>
          EduSphere brings you expert-led courses, hands-on quizzes,
          assignments, and certificates — all in one place.
        </p>
        <Link to="/courses" className="btn btn-primary">
          Browse Courses
        </Link>
      </section>

      <section>
        <h2 className="section-title">Featured Courses</h2>
        <div className="grid">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="info-strip">
        <div className="info-item">
          <h3>{courses.length}+</h3>
          <p>Courses Available</p>
        </div>
        <div className="info-item">
          <h3>Self-Paced</h3>
          <p>Learn at your own speed</p>
        </div>
        <div className="info-item">
          <h3>Certified</h3>
          <p>Earn certificates on completion</p>
        </div>
      </section>
    </div>
  );
}
