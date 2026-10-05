import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  }, [logout, navigate]);

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="header">
      <div className="header-inner container">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          🎓 EduSphere
        </NavLink>

        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/courses" className={linkClass} onClick={closeMenu}>
            Courses
          </NavLink>
          <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
            Dashboard
          </NavLink>
          <NavLink to="/quiz" className={linkClass} onClick={closeMenu}>
            Quiz
          </NavLink>
          <NavLink to="/assignment" className={linkClass} onClick={closeMenu}>
            Assignment
          </NavLink>
          <NavLink
            to="/certificate"
            className={linkClass}
            onClick={closeMenu}
          >
            Certificate
          </NavLink>
          <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
            Profile
          </NavLink>
          {isLoggedIn ? (
            <>
              {/* Experiment 6: show the logged-in student's username */}
              <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                👤 {user.name}
              </NavLink>
              <button
                type="button"
                className="nav-link"
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  font: "inherit",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={closeMenu}>
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
