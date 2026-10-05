import React, { useState, useMemo, useRef, useCallback } from "react";

export default function Certificate({ enrolledCourses, quizResults, learnerName }) {
  const certificateRef = useRef(null);

  // useMemo: only courses whose quiz has been passed are eligible for a certificate
  const completedCourses = useMemo(
    () =>
      enrolledCourses.filter(
        (c) => quizResults[c.id] && quizResults[c.id].passed
      ),
    [enrolledCourses, quizResults]
  );

  const [selectedId, setSelectedId] = useState("");

  const selectedCourse = useMemo(
    () => completedCourses.find((c) => c.id === selectedId),
    [completedCourses, selectedId]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="container">
      <h1 className="section-title">Certificates</h1>

      {completedCourses.length === 0 ? (
        <p className="empty-state">
          Complete all lessons and pass the quiz for a course to unlock its
          certificate.
        </p>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="cert-course-select">Select Completed Course</label>
            <select
              id="cert-course-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Choose a course --</option>
              {completedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <>
              <div className="certificate" ref={certificateRef}>
                <h2>Certificate of Completion</h2>
                <p className="certificate-sub">This certifies that</p>
                <h1 className="certificate-name">{learnerName}</h1>
                <p className="certificate-sub">has successfully completed</p>
                <h3 className="certificate-course">{selectedCourse.title}</h3>
                <p className="certificate-date">
                  Issued on {new Date().toLocaleDateString()}
                </p>
              </div>
              <button className="btn btn-primary" onClick={handlePrint}>
                Print / Download
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
