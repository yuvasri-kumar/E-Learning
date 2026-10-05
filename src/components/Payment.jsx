// Experiment 5: Payment page for paid courses.
// Shows the price, a "Pay Now" button, then a simple payment form.
// On success the course is marked as paid (saved in localStorage).

import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function Payment({ courses, paidCourseIds = [], onPaymentSuccess }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", cardNumber: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const [paid, setPaid] = useState(paidCourseIds.includes(id));

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePay = useCallback(
    (e) => {
      e.preventDefault();

      // Simple validation
      const errs = {};
      if (!form.name.trim()) errs.name = "Name on card is required";
      if (!form.cardNumber.trim()) errs.cardNumber = "Card number is required";
      else if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, "")))
        errs.cardNumber = "Card number must be 16 digits";
      if (!form.expiry.trim()) errs.expiry = "Expiry date is required";
      else if (!/^\d{2}\/\d{2}$/.test(form.expiry.trim()))
        errs.expiry = "Use MM/YY format";
      if (!form.cvv.trim()) errs.cvv = "CVV is required";
      else if (!/^\d{3}$/.test(form.cvv.trim())) errs.cvv = "CVV must be 3 digits";

      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      onPaymentSuccess(id);
      setPaid(true);
    },
    [form, id, onPaymentSuccess]
  );

  if (!course) {
    return (
      <div className="container">
        <h2>Course not found</h2>
        <button className="btn btn-primary" onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    );
  }

  // Payment complete - the student can now enroll
  if (paid) {
    return (
      <div className="container">
        <h1 className="section-title">Payment</h1>
        <div className="card success-card">
          <h2>✅ Payment Successful!</h2>
          <p>
            You have paid ₹{course.price} for <strong>{course.title}</strong>.
          </p>
          <Link to={`/enrollment/${course.id}`} className="btn btn-primary">
            Enroll Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Payment: {course.title}</h1>

      <div className="card success-card">
        <h2>Course Price</h2>
        <p className="price price-large">₹{course.price}</p>
        <p className="muted">Please complete payment to access this course.</p>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Pay Now
          </button>
        )}
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handlePay} noValidate>
          <div className="form-group">
            <label htmlFor="card-name">Name on Card</label>
            <input
              id="card-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              value={form.cardNumber}
              onChange={handleChange}
              placeholder="16 digit card number"
            />
            {errors.cardNumber && (
              <span className="error-text">{errors.cardNumber}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="expiry">Expiry Date</label>
            <input
              id="expiry"
              name="expiry"
              type="text"
              value={form.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
            />
            {errors.expiry && <span className="error-text">{errors.expiry}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              name="cvv"
              type="password"
              value={form.cvv}
              onChange={handleChange}
              placeholder="3 digits"
            />
            {errors.cvv && <span className="error-text">{errors.cvv}</span>}
          </div>

          <button type="submit" className="btn btn-primary">
            Pay ₹{course.price}
          </button>
        </form>
      )}
    </div>
  );
}
