import axios from "axios";
import { getToken, clearToken } from "../utils/tokenStore";

export const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
export const UNAUTHORIZED_EVENT = "edusphere:unauthorized";

// Endpoints where a 401 means "wrong credentials", not "session expired".
const CREDENTIAL_URLS = ["/auth/login", "/auth/register", "/auth/logout"];

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  constructor(message, { status = 0, code = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      const aborted = new Error("Request cancelled");
      aborted.name = "AbortError";
      return Promise.reject(aborted);
    }
    if (!error.response) {
      const message =
        error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Cannot reach the course server. Make sure the API is running (npm run api).";
      return Promise.reject(new ApiError(message));
    }
    const { status, data } = error.response;
    const message =
      (data && data.message) || `Request failed (${status})`;
    const code = (data && data.code) || "";
    const url = (error.config && error.config.url) || "";

    if (status === 401 && !CREDENTIAL_URLS.some((u) => url.startsWith(u))) {
      clearToken();
      window.dispatchEvent(
        new CustomEvent(UNAUTHORIZED_EVENT, { detail: { message, code } })
      );
    }
    return Promise.reject(new ApiError(message, { status, code }));
  }
);

export default client;
