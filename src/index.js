import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <Provider store={store}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);

if (
  process.env.NODE_ENV === "production" &&
  "serviceWorker" in navigator
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL || ""}/service-worker.js`)
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}