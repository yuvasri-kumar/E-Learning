import React, { useCallback } from "react";

export default function FilterPanel({
  categories,
  levels,
  selectedCategory,
  selectedLevel,
  onCategoryChange,
  onLevelChange,
  onReset
}) {
  const handleCategory = useCallback(
    (e) => onCategoryChange(e.target.value),
    [onCategoryChange]
  );

  const handleLevel = useCallback(
    (e) => onLevelChange(e.target.value),
    [onLevelChange]
  );

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label htmlFor="category-select">Category</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategory}
        >
          <option value="All">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="level-select">Level</label>
        <select id="level-select" value={selectedLevel} onChange={handleLevel}>
          <option value="All">All</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-secondary" onClick={onReset}>
        Reset Filters
      </button>
    </div>
  );
}
