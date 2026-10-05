import React, { useState, useRef, useCallback, useEffect } from "react";

export default function Assignment() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [submissions, setSubmissions] = useState([]);
  // Experiment 4: simple validation errors
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // useEffect: simple document title side-effect for this page
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
    (e) => {
      e.preventDefault();

      // Validation
      const errs = {};
      if (!title.trim()) errs.title = "Assignment title is required";
      else if (title.trim().length < 3)
        errs.title = "Title must be at least 3 characters";
      if (!notes.trim()) errs.notes = "Please describe your submission";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      const newSubmission = {
        id: Date.now(),
        title,
        notes,
        fileName: fileName || "No file attached",
        submittedAt: new Date().toLocaleString()
      };

      setSubmissions((prev) => [newSubmission, ...prev]);
      setErrors({});
      setTitle("");
      setNotes("");
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [title, notes, fileName]
  );

  return (
    <div className="container">
      <h1 className="section-title">Assignments</h1>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="assignment-title">Assignment Title</label>
          <input
            id="assignment-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        <button type="submit" className="btn btn-primary">
          Submit Assignment
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
              <p className="muted">Submitted: {s.submittedAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
