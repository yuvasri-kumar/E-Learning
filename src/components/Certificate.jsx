import React, { useState, useMemo, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectQuizResults } from "../store/selectors";
import { postCertificate } from "../api/learningApi";
import DataStatus from "./DataStatus";
export default function Certificate({ enrolledCourses, learnerName }) {
  const quizResults = useSelector(selectQuizResults);
  const certificateRef = useRef(null);
  const completedCourses = useMemo(
    () =>
      enrolledCourses.filter(
        (c) => quizResults[c.id] && quizResults[c.id].passed
      ),
    [enrolledCourses, quizResults]
  );
  const [selectedId, setSelectedId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");
  const latestRequest = useRef(0);
  const selectedCourse = useMemo(
    () => completedCourses.find((c) => c.id === selectedId),
    [completedCourses, selectedId]
  );
  const issueCertificate = useCallback(
    async (courseId) => {
      const requestNumber = ++latestRequest.current;
      setSelectedId(courseId);
      setCertificate(null);
      setIssueError("");
      if (!courseId) {
        setIssuing(false);
        return;
      }
      setIssuing(true);
      try {
        const issued = await postCertificate(courseId, learnerName);
        if (requestNumber === latestRequest.current) setCertificate(issued);
      } catch (err) {
        if (requestNumber === latestRequest.current) {
          setIssueError(err.message || "Could not issue the certificate.");
        }
      } finally {
        if (requestNumber === latestRequest.current) setIssuing(false);
      }
    },
    [learnerName]
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
              onChange={(e) => issueCertificate(e.target.value)}
            >
              <option value="">-- Choose a course --</option>
              {completedCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (issuing || issueError) && (
            <DataStatus
              loading={issuing}
              error={issueError}
              onRetry={() => issueCertificate(selectedId)}
              loadingText="Preparing your certificate..."
            />
          )}
          {selectedCourse && certificate && !issuing && !issueError && (
            <>
              <div className="certificate" ref={certificateRef}>
                <h2>Certificate of Completion</h2>
                <p className="certificate-sub">This certifies that</p>
                <h1 className="certificate-name">{learnerName}</h1>
                <p className="certificate-sub">has successfully completed</p>
                <h3 className="certificate-course">{selectedCourse.title}</h3>
                <p className="certificate-date">
                  Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
                <p className="certificate-date">
                  Certificate ID: {certificate.id}
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
