import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadCourses } from "../store/coursesSlice";
import { createCourse, deleteCourse, fetchCourses, updateCourse } from "../api/courseApi";
import DataStatus from "./DataStatus";

const blankForm = {
  title: "", category: "Web Development", level: "Beginner", instructor: "",
  duration: "", price: "0", description: "", image: "", syllabus: ""
};

function toForm(course) {
  return {
    title: course.title || "", category: course.category || "Web Development",
    level: course.level || "Beginner", instructor: course.instructor || "",
    duration: course.duration || "", price: String(course.price ?? 0),
    description: course.description || "", image: course.image || "",
    syllabus: (course.syllabus || []).join("\n")
  };
}

export default function AdminCourses() {
  const dispatch = useDispatch();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try { setCourses(await fetchCourses({})); }
    catch (err) { setError(err.message || "Unable to load courses."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  const reset = () => { setForm(blankForm); setEditingId(null); setError(""); };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const payload = { ...form, price: Number(form.price) || 0, syllabus: form.syllabus.split("\n").map((x) => x.trim()).filter(Boolean) };
    try {
      if (editingId) await updateCourse(editingId, payload);
      else await createCourse(payload);
      setNotice(editingId ? "Course updated successfully." : "Course added successfully.");
      reset(); await refresh(); dispatch(loadCourses());
    } catch (err) { setError(err.message || "Could not save course."); }
    finally { setSaving(false); }
  };

  const edit = (course) => { setEditingId(course.id); setForm(toForm(course)); setNotice(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (course) => {
    if (!window.confirm(`Delete “${course.title}”? This cannot be undone.`)) return;
    setError(""); setNotice("");
    try { await deleteCourse(course.id); setNotice(`“${course.title}” deleted successfully.`); if (editingId === course.id) reset(); await refresh(); dispatch(loadCourses()); }
    catch (err) { setError(err.message || "Could not delete course."); }
  };

  return <div className="container admin-page">
    <h1 className="section-title">Admin — Course Management</h1>
    <p className="muted">Only admin accounts can add, view, update, or delete courses. Students can browse courses but cannot change them.</p>
    {notice && <div className="alert-success" role="status">{notice}</div>}
    {error && <div className="admin-error" role="alert">{error}</div>}
    <form className="form-card admin-form" onSubmit={submit}>
      <h2>{editingId ? "Update Course" : "Add New Course"}</h2>
      <div className="admin-form-grid">
        <label className="form-group">Course title<input name="title" value={form.title} onChange={change} required /></label>
        <label className="form-group">Category<select name="category" value={form.category} onChange={change}><option>Web Development</option><option>Programming</option><option>Design</option><option>Computer Science</option><option>Data Science</option><option>Cyber Security</option><option>Business</option><option>Other</option></select></label>
        <label className="form-group">Level<select name="level" value={form.level} onChange={change}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label className="form-group">Instructor<input name="instructor" value={form.instructor} onChange={change} required /></label>
        <label className="form-group">Duration<input name="duration" value={form.duration} onChange={change} placeholder="e.g. 6 hours" /></label>
        <label className="form-group">Price (₹)<input name="price" type="number" min="0" value={form.price} onChange={change} /></label>
        <label className="form-group admin-wide">Image URL (optional)<input name="image" type="url" value={form.image} onChange={change} placeholder="https://..." /></label>
        <label className="form-group admin-wide">Description<textarea name="description" value={form.description} onChange={change} required rows="3" /></label>
        <label className="form-group admin-wide">Syllabus (one lesson per line)<textarea name="syllabus" value={form.syllabus} onChange={change} rows="4" placeholder="Introduction\nCore concepts\nFinal project" /></label>
      </div>
      <div className="admin-actions"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Course"}</button>{editingId && <button className="btn btn-secondary" type="button" onClick={reset}>Cancel Edit</button>}</div>
    </form>
    <section className="admin-course-section">
      <h2 className="section-title">Manage Courses ({courses.length})</h2>
      {loading ? <DataStatus loading loadingText="Loading courses..." /> : courses.length === 0 ? <p className="empty-state">No courses found.</p> : <div className="admin-course-list">
        {courses.map((course) => <article className="card admin-course-row" key={course.id}>
          <div className="admin-course-info"><h3>{course.title}</h3><p className="muted">{course.category} · {course.level} · {course.instructor}</p><p>{course.description}</p><strong>{Number(course.price) === 0 ? "Free" : `₹${course.price}`}</strong></div>
          <div className="admin-actions"><button type="button" className="btn btn-outline" onClick={() => edit(course)}>Edit</button><button type="button" className="btn btn-danger" onClick={() => remove(course)}>Delete</button></div>
        </article>)}
      </div>}
    </section>
  </div>;
}
