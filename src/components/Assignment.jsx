import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitAssignment } from "../store/learningSlice";
import { selectAssignments } from "../store/selectors";
function formatSubmittedAt(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
export default function Assignment() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const dispatch = useDispatch();
  const submissions = useSelector(selectAssignments);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);
  useEffect(() => {
    document.title = "Assignment - EduSphere";
  }, []);
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  }, []);
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;
      const errs = {};
      if (!title.trim()) errs.title = "Assignment title is required";
      else if (title.trim().length < 3)
        errs.title = "Title must be at least 3 characters";
      if (!notes.trim()) errs.notes = "Please describe your submission";
      setErrors(errs);
      setApiError("");
      setSuccessMessage("");
      if (Object.keys(errs).length > 0) return;
      setSubmitting(true);
      try {
        await dispatch(
          submitAssignment({
            title: title.trim(),
            notes: notes.trim(),
            fileName: fileName || undefined
          })
        ).unwrap();
        setErrors({});
        setTitle("");
        setNotes("");
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSuccessMessage("Assignment submitted successfully!");
      } catch (message) {
        setApiError(
          typeof message === "string"
            ? message
            : "Could not submit your assignment. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [title, notes, fileName, dispatch, submitting]
  );
  return (
    <div className="container">
      <h1 className="section-title">Assignments</h1>
      {successMessage && <div className="alert-success">{successMessage}</div>}
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {apiError && (
          <span className="error-text" role="alert">
            {apiError}
          </span>
        )}
        <div className="form-group">
          <label htmlFor="assignment-title">Assignment Title</label>
          <input
            id="assignment-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSuccessMessage("");
            }}
            placeholder="e.g. React Component Project"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="assignment-notes">Notes / Description</label>
          <textarea
            id="assignment-notes"
            rows="4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your submission..."
          />
          {errors.notes && <span className="error-text">{errors.notes}</span>}
        </div>
        <div className="form-group">
          <label>Attach File</label>
          <div className="file-upload-row">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleBrowseClick}
            >
              Choose File
            </button>
            <span className="muted">{fileName || "No file chosen"}</span>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              hidden
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Assignment"}
        </button>
      </form>
      <h2 className="section-title">My Submissions</h2>
      {submissions.length === 0 ? (
        <p className="empty-state">No assignments submitted yet.</p>
      ) : (
        <ul className="submission-list">
          {submissions.map((s) => (
            <li key={s.id} className="card submission-item">
              <h3>{s.title}</h3>
              {s.notes && <p>{s.notes}</p>}
              <p className="muted">📎 {s.fileName}</p>
              <p className="muted">Submitted: {formatSubmittedAt(s.submittedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
