import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectEnrolledCourseIds, selectProgress } from "../store/selectors";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import CourseCard from "./CourseCard";
import DataStatus from "./DataStatus";
import useFetch from "../api/useFetch";
import { fetchCourses } from "../api/courseApi";
export default function CourseList({ courses }) {
  const enrolledCourseIds = useSelector(selectEnrolledCourseIds);
  const progress = useSelector(selectProgress);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const categories = useMemo(
    () => [...new Set(courses.map((c) => c.category))],
    [courses]
  );
  const levels = useMemo(
    () => [...new Set(courses.map((c) => c.level))],
    [courses]
  );
  const handleSearch = useCallback((term) => setSearchTerm(term), []);
  const handleReset = useCallback(() => {
    setSearchTerm("");
    setCategory("All");
    setLevel("All");
    setCurrentPage(1);
  }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, category, level]);
  const {
    data: filteredCourses,
    loading,
    error,
    retry
  } = useFetch(
    (signal) => fetchCourses({ q: searchTerm, category, level }, signal),
    [searchTerm, category, level]
  );
  const totalPages = Math.ceil((filteredCourses || []).length / coursesPerPage);
  const visibleCourses = (filteredCourses || []).slice(
    (currentPage - 1) * coursesPerPage, currentPage * coursesPerPage
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
          {visibleCourses.map((course) => (
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
      {!loading && !error && totalPages > 1 && (
        <nav className="course-pagination" aria-label="Course pages">
          <button type="button" className="btn btn-outline" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</button>
          <span aria-live="polite">Page {currentPage} of {totalPages}</span>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button type="button" key={page} className={`btn ${currentPage === page ? "btn-primary" : "btn-outline"}`} aria-current={currentPage === page ? "page" : undefined} onClick={() => setCurrentPage(page)}>{page}</button>
          ))}
          <button type="button" className="btn btn-outline" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next</button>
        </nav>
      )}
    </div>
  );
}
