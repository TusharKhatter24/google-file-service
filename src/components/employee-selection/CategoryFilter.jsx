import React from 'react';
import './CategoryFilter.css';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'support', label: 'Support' },
  { id: 'sales', label: 'Sales' },
  { id: 'hr', label: 'HR' },
  { id: 'developer', label: 'Developer' },
  { id: 'analyst', label: 'Analyst' },
  { id: 'custom', label: 'Custom' },
];

function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;



