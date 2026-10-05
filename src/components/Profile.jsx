import React, { useState, useCallback, useEffect } from "react";

export default function Profile({ profile, onUpdate }) {
  const [form, setForm] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  // Experiment 4: simple validation errors
  const [errors, setErrors] = useState({});

  // useEffect: keep local form in sync if the parent profile changes externally
  useEffect(() => {
    setForm(profile);
  }, [profile]);

  // useEffect: auto-hide the "saved" confirmation message
  useEffect(() => {
    if (!savedMessage) return;
    const timeout = setTimeout(() => setSavedMessage(""), 2500);
    return () => clearTimeout(timeout);
  }, [savedMessage]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(
    (e) => {
      e.preventDefault();

      // Validation
      const errs = {};
      if (!form.name.trim()) errs.name = "Name is required";
      else if (form.name.trim().length < 3)
        errs.name = "Name must be at least 3 characters";
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        errs.email = "Enter a valid email";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      onUpdate(form);
      setErrors({});
      setEditing(false);
      setSavedMessage("Profile updated successfully!");
    },
    [form, onUpdate]
  );

  const handleCancel = useCallback(() => {
    setForm(profile);
    setErrors({});
    setEditing(false);
  }, [profile]);

  return (
    <div className="container">
      <h1 className="section-title">My Profile</h1>

      {savedMessage && <div className="alert-success">{savedMessage}</div>}

      <div className="profile-card card">
        <img src={form.avatar} alt="avatar" className="profile-avatar" />

        {editing ? (
          <form onSubmit={handleSave} className="form-card profile-form" noValidate>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                value={form.bio}
                onChange={handleChange}
              />
            </div>
            <div className="detail-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <h2>{profile.name}</h2>
            <p className="muted">{profile.email}</p>
            <p>{profile.bio}</p>
            <button
              className="btn btn-outline"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
