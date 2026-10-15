const TOKEN_KEY = "edusphere_auth_token_v1";
const EXPIRES_KEY = "edusphere_auth_expires_v1";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error("Failed to read auth token:", err);
    return null;
  }
}

export function getTokenExpiry() {
  try {
    const raw = window.localStorage.getItem(EXPIRES_KEY);
    const time = raw ? Date.parse(raw) : NaN;
    return Number.isNaN(time) ? null : time;
  } catch (err) {
    return null;
  }
}

export function saveToken(token, expiresAt) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    if (expiresAt) window.localStorage.setItem(EXPIRES_KEY, expiresAt);
  } catch (err) {
    console.error("Failed to save auth token:", err);
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(EXPIRES_KEY);
  } catch (err) {
    console.error("Failed to remove auth token:", err);
  }
}
