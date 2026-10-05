import React, { useState, useEffect, useRef, useCallback } from "react";

export default function SearchBar({ onSearch, placeholder }) {
  const [term, setTerm] = useState("");
  const debounceRef = useRef(null);

  // useEffect + useRef: debounce user typing before triggering search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(term.trim());
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [term, onSearch]);

  const handleChange = useCallback((e) => {
    setTerm(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setTerm("");
  }, []);

  return (
    <div className="search-bar">
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder={placeholder || "Search courses..."}
        aria-label="Search courses"
      />
      {term && (
        <button className="clear-btn" onClick={handleClear} type="button">
          ✕
        </button>
      )}
    </div>
  );
}
