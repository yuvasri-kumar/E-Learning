import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const { login, signup, isLoggedIn, authNotice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showSignup, setShowSignup] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    document.title = "Login - EduSphere";
  }, []);
  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true });
  }, [isLoggedIn, navigate, from]);
  const switchMode = useCallback(() => {
    setShowSignup((prev) => !prev);
    setErrors({});
    setMessage("");
    clearNotice();
  }, [clearNotice]);
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;
      const errs = {};
      const identifier = form.identifier.trim();
      if (!identifier) errs.identifier = "Email or Student ID is required";
      else if (identifier.includes("@") && !/^\S+@\S+\.\S+$/.test(identifier))
        errs.identifier = "Enter a valid email";
      else if (!identifier.includes("@") && !/^[A-Za-z0-9]{4,}$/.test(identifier))
        errs.identifier = "Student ID must be at least 4 letters/numbers";
      if (!form.password) errs.password = "Password is required";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      setSubmitting(true);
      setMessage("");
      clearNotice();
      const result = await login(identifier, form.password);
      setSubmitting(false);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }
      navigate(from, { replace: true });
    },
    [form, login, navigate, from, submitting, clearNotice]
  );
  const handleSignupChange = useCallback((e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleSignup = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;
      const errs = {};
      if (!signupForm.name.trim()) errs.name = "Student name is required";
      else if (signupForm.name.trim().length < 3)
        errs.name = "Name must be at least 3 characters";
      if (!signupForm.email.trim()) errs.email = "Student email is required";
      else if (!/\S+@\S+\.\S+/.test(signupForm.email))
        errs.email = "Enter a valid email";
      if (!signupForm.studentId.trim())
        errs.studentId = "Student ID is required";
      else if (!/^[A-Za-z0-9]{4,}$/.test(signupForm.studentId.trim()))
        errs.studentId = "Student ID must be at least 4 letters/numbers";
      if (!signupForm.password) errs.password = "Password is required";
      else if (signupForm.password.length < 6)
        errs.password = "Password must be at least 6 characters";
      if (!signupForm.confirmPassword)
        errs.confirmPassword = "Please confirm your password";
      else if (signupForm.confirmPassword !== signupForm.password)
        errs.confirmPassword = "Passwords do not match";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      setSubmitting(true);
      const result = await signup(signupForm);
      setSubmitting(false);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }
      setSignupForm({
        name: "",
        email: "",
        studentId: "",
        password: "",
        confirmPassword: ""
      });
      setShowSignup(false);
      setMessage("Registration successful! Please login to continue.");
    },
    [signupForm, signup, submitting]
  );
  if (showSignup) {
    return (
      <div className="container">
        <h1 className="section-title">Sign Up</h1>
        <form className="form-card" onSubmit={handleSignup} noValidate>
          {errors.form && <span className="error-text">{errors.form}</span>}
          <div className="form-group">
            <label htmlFor="name">Student Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={signupForm.name}
              onChange={handleSignupChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Student Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={signupForm.email}
              onChange={handleSignupChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={signupForm.studentId}
              onChange={handleSignupChange}
              placeholder="e.g. STU1001"
            />
            {errors.studentId && (
              <span className="error-text">{errors.studentId}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              value={signupForm.password}
              onChange={handleSignupChange}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={signupForm.confirmPassword}
              onChange={handleSignupChange}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
          <p className="muted">
            Already registered?{" "}
            <button
              type="button"
              className="btn btn-outline"
              onClick={switchMode}
            >
              Login
            </button>
          </p>
        </form>
      </div>
    );
  }
  return (
    <div className="container">
      <h1 className="section-title">Login</h1>
      {message && <div className="alert-success">{message}</div>}
      <form className="form-card" onSubmit={handleLogin} noValidate>
        {authNotice && !errors.form && (
          <span className="error-text" role="alert">
            {authNotice}
          </span>
        )}
        {errors.form && (
          <span className="error-text" role="alert">
            {errors.form}
          </span>
        )}
        <div className="form-group">
          <label htmlFor="identifier">Email or Student ID</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            value={form.identifier}
            onChange={handleChange}
            placeholder="student@example.com or STU1001"
          />
          {errors.identifier && (
            <span className="error-text">{errors.identifier}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="muted">
          New student?{" "}
          <button
            type="button"
            className="btn btn-outline"
            onClick={switchMode}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
