import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} EduSphere. All rights reserved.</p>
        <p className="footer-note">Built with React &amp; React Router</p>
      </div>
    </footer>
  );
}
