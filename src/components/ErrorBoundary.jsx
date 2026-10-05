// Experiment 4: Error boundary.
// Catches render errors anywhere below it and shows a simple message
// instead of a blank screen.

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Something went wrong:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="card success-card">
            <h2>⚠️ Something went wrong</h2>
            <p>Sorry, this page could not be displayed. Please try again.</p>
            <button className="btn btn-primary" onClick={this.handleReload}>
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
