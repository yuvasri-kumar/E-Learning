// Experiment 4 + 5: Login / Sign Up page with validation.
// Reuses the existing .form-card / .form-group / .error-text styles.

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, signup, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Page the user originally asked for, or Home by default
  const from = location.state?.from?.pathname || "/";

  // false = Login form, true = Sign Up form
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

  useEffect(() => {
    document.title = "Login - EduSphere";
  }, []);

  // Already logged in? Go straight through.
  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true });
  }, [isLoggedIn, navigate, from]);

  const switchMode = useCallback(() => {
    setShowSignup((prev) => !prev);
    setErrors({});
    setMessage("");
  }, []);

  /* ---------------- Login ---------------- */

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(
    (e) => {
      e.preventDefault();

      const errs = {};
      if (!form.identifier.trim())
        errs.identifier = "Email or Student ID is required";
      if (!form.password) errs.password = "Password is required";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      const result = login(form.identifier, form.password);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }
      // Send the user back to the page they originally requested
      navigate(from, { replace: true });
    },
    [form, login, navigate, from]
  );

  /* ---------------- Sign Up ---------------- */

  const handleSignupChange = useCallback((e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSignup = useCallback(
    (e) => {
      e.preventDefault();

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

      const result = signup(signupForm);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }

      // Registration done - go back to the login form
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
    [signupForm, signup]
  );

  /* ---------------- Sign Up form ---------------- */

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

          <button type="submit" className="btn btn-primary">
            Create Account
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

  /* ---------------- Login form ---------------- */

  return (
    <div className="container">
      <h1 className="section-title">Login</h1>

      {message && <div className="alert-success">{message}</div>}

      <form className="form-card" onSubmit={handleLogin} noValidate>
        {errors.form && <span className="error-text">{errors.form}</span>}

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

        <button type="submit" className="btn btn-primary">
          Login
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
