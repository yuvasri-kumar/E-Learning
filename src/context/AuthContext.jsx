import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef
} from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  fetchCurrentUser
} from "../api/authApi";
import { UNAUTHORIZED_EVENT } from "../api/client";
import {
  getToken,
  getTokenExpiry,
  saveToken,
  clearToken
} from "../utils/tokenStore";
import { clearQuizDrafts } from "../utils/quizDraftStore";

const AUTH_KEY = "edusphere_auth_user_v1";
const LEGACY_STUDENTS_KEY = "edusphere_students_v1";
const AuthContext = createContext(null);

function loadUser() {
  try {
    if (!getToken()) return null;
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to load saved login:", err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [authNotice, setAuthNotice] = useState("");
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STUDENTS_KEY);
    } catch (err) {
      // storage unavailable, nothing to clean up
    }
  }, []);

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

  const endSession = useCallback((notice = "") => {
    clearToken();
    clearQuizDrafts();
    setUser(null);
    setAuthNotice(notice);
  }, []);

  // Any protected API call that comes back 401 (expired / invalid / revoked token)
  useEffect(() => {
    const onUnauthorized = (event) => {
      if (!userRef.current) return;
      const detail = event.detail || {};
      endSession(detail.message || "Your session has expired. Please log in again.");
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [endSession]);

  // Check the saved token with the server when the app loads
  useEffect(() => {
    if (!user || !getToken()) return;
    const expiry = getTokenExpiry();
    if (expiry && expiry <= Date.now()) {
      endSession("Your session has expired. Please log in again.");
      return;
    }
    const controller = new AbortController();
    fetchCurrentUser(controller.signal)
      .then((fresh) => {
        setUser((prev) => (prev ? { ...prev, ...fresh } : prev));
      })
      .catch(() => {
        // 401 is handled by the interceptor; network errors keep the session
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user]);

  // Log the student out as soon as the token runs out, even if they are idle
  useEffect(() => {
    if (!user) return;
    const expiry = getTokenExpiry();
    if (!expiry) return;
    const delay = Math.min(Math.max(expiry - Date.now(), 0), 2 ** 31 - 1);
    const timer = setTimeout(() => {
      endSession("Your session has expired. Please log in again.");
    }, delay);
    return () => clearTimeout(timer);
  }, [user, endSession]);

  const signup = useCallback(async ({ name, email, studentId, password }) => {
    try {
      await registerRequest({
        name: (name || "").trim(),
        email: (email || "").trim(),
        studentId: (studentId || "").trim(),
        password
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const data = await loginRequest((identifier || "").trim(), password);
      saveToken(data.token, data.expiresAt);
      setAuthNotice("");
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    endSession("");
    if (token) {
      try {
        await logoutRequest(token);
      } catch (err) {
        // the local token is already gone; an expired token needs no revoking
      }
    }
  }, [endSession]);

  const clearNotice = useCallback(() => setAuthNotice(""), []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      authNotice,
      clearNotice,
      signup,
      login,
      logout
    }),
    [user, authNotice, clearNotice, signup, login, logout]
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
