import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { loadLearning } from "../store/learningSlice";
import { selectLearningStatus, selectLearningError } from "../store/selectors";
import DataStatus from "./DataStatus";

export default function LearningGate({ children }) {
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();
  const status = useSelector(selectLearningStatus);
  const error = useSelector(selectLearningError);

  if (!isLoggedIn) return children;

  if (status === "idle" || status === "loading") {
    return (
      <div className="container">
        <DataStatus loading loadingText="Loading your learning data..." />
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="container">
        <DataStatus error={error} onRetry={() => dispatch(loadLearning())} />
      </div>
    );
  }
  return children;
}
