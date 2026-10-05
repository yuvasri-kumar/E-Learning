// Experiment 4 + 5: Authentication context.
// Holds the logged-in user, the list of registered students,
// and exposes signup / login / logout to the whole app.

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from "react";

const AUTH_KEY = "edusphere_auth_user_v1";
const STUDENTS_KEY = "edusphere_students_v1";

const AuthContext = createContext(null);

function loadUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to load saved login:", err);
    return null;
  }
}

function loadStudents() {
  try {
    const raw = window.localStorage.getItem(STUDENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load registered students:", err);
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [students, setStudents] = useState(loadStudents);

  // Keep the session in localStorage so a refresh does not log the user out
  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_KEY);
      }
    } catch (err) {
      console.error("Failed to save login:", err);
    }
  }, [user]);

  // Save the registered student list
  useEffect(() => {
    try {
      window.localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (err) {
      console.error("Failed to save registered students:", err);
    }
  }, [students]);

  // Register a new student and store the details in localStorage
  const signup = useCallback(
    ({ name, email, studentId, password }) => {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanId = (studentId || "").trim();

      const emailTaken = students.some(
        (s) => s.email.toLowerCase() === cleanEmail
      );
      if (emailTaken) {
        return { ok: false, message: "This email is already registered" };
      }

      const idTaken = students.some(
        (s) => s.studentId.toLowerCase() === cleanId.toLowerCase()
      );
      if (idTaken) {
        return { ok: false, message: "This Student ID is already registered" };
      }

      const newStudent = {
        name: (name || "").trim(),
        email: cleanEmail,
        studentId: cleanId,
        password
      };
      setStudents((prev) => [...prev, newStudent]);
      return { ok: true };
    },
    [students]
  );

  // Log in by checking the registered student details
  const login = useCallback(
    (identifier, password) => {
      const id = (identifier || "").trim().toLowerCase();

      const student = students.find(
        (s) =>
          s.email.toLowerCase() === id || s.studentId.toLowerCase() === id
      );

      if (!student || student.password !== password) {
        return { ok: false, message: "Invalid email/ID or password" };
      }

      setUser({
        name: student.name,
        email: student.email,
        studentId: student.studentId
      });
      return { ok: true };
    },
    [students]
  );

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, students, signup, login, logout }),
    [user, students, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
