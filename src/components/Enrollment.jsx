import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function Enrollment({ courses, paidCourseIds = [], onEnroll }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    return errs;
  }, [form]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length === 0) {
        onEnroll(id);
        setSubmitted(true);
      }
    },
    [validate, onEnroll, id]
  );

  if (!course) {
    return (
      <div className="container">
        <h2>Course not found</h2>
      </div>
    );
  }

  // Experiment 5: block enrollment for an unpaid paid course
  if (course.price > 0 && !paidCourseIds.includes(id)) {
    return (
      <div className="container">
        <h1 className="section-title">Enroll in: {course.title}</h1>
        <div className="card success-card">
          <h2>Payment Required</h2>
          <p className="error-text">
            Please complete payment to access this course.
          </p>
          <p className="price price-large">₹{course.price}</p>
          <Link to={`/payment/${course.id}`} className="btn btn-primary">
            Pay Now
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container">
        <div className="card success-card">
          <h2>🎉 Enrollment Successful!</h2>
          <p>
            You have successfully enrolled in <strong>{course.title}</strong>.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Enroll in: {course.title}</h1>
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <button type="submit" className="btn btn-primary">
          Confirm Enrollment
        </button>
      </form>
    </div>
  );
}
