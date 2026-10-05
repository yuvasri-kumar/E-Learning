import React, { useState, useMemo, useCallback } from "react";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import CourseCard from "./CourseCard";
import DataStatus from "./DataStatus";
import useFetch from "../api/useFetch";
import { fetchCourses } from "../api/courseApi";

export default function CourseList({
  courses,
  enrolledCourseIds = [],
  progress = {}
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  // useMemo: derive unique filter options only when the course list changes
  const categories = useMemo(
    () => [...new Set(courses.map((c) => c.category))],
    [courses]
  );
  const levels = useMemo(
    () => [...new Set(courses.map((c) => c.level))],
    [courses]
  );

  // useCallback: stable handler passed to SearchBar to avoid needless re-renders
  const handleSearch = useCallback((term) => setSearchTerm(term), []);

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setCategory("All");
    setLevel("All");
  }, []);

  // Experiment 1: search + filters are sent to the REST API
  // GET /courses?q=...&category=...&level=...
  const {
    data: filteredCourses,
    loading,
    error,
    retry
  } = useFetch(
    (signal) => fetchCourses({ q: searchTerm, category, level }, signal),
    [searchTerm, category, level]
  );

  return (
    <div className="container">
      <h1 className="section-title">All Courses</h1>

      <div className="toolbar">
        <SearchBar onSearch={handleSearch} placeholder="Search by title..." />
        <FilterPanel
          categories={categories}
          levels={levels}
          selectedCategory={category}
          selectedLevel={level}
          onCategoryChange={setCategory}
          onLevelChange={setLevel}
          onReset={handleReset}
        />
      </div>

      {loading || error ? (
        <DataStatus
          loading={loading}
          error={error}
          onRetry={retry}
          loadingText="Loading courses..."
        />
      ) : !filteredCourses || filteredCourses.length === 0 ? (
        <p className="empty-state">No courses match your search/filters.</p>
      ) : (
        <div className="grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={
                enrolledCourseIds.includes(course.id)
                  ? progress[course.id] || 0
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
