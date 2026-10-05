// Experiment 1: reusable loading / error messages for API calls.
// Reuses the existing .empty-state and .error-text styles (no new CSS).
import React from "react";

export default function DataStatus({ loading, error, onRetry, loadingText }) {
  if (loading) {
    return (
      <p className="empty-state" role="status">
        {loadingText || "Loading..."}
      </p>
    );
  }
  if (error) {
    return (
      <div className="empty-state" role="alert">
        <p className="error-text">⚠ {error}</p>
        {onRetry && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }
  return null;
}
