import React from 'react';
import FeaturedEmployeeCard from './FeaturedEmployeeCard';
import './RecommendedSection.css';

function RecommendedSection({ employees, onSelect, onPreview }) {
  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="recommended-section">
      <div className="recommended-header">
        <div className="recommended-ribbon">
          <span className="ribbon-text">Recommended for You</span>
        </div>
        <h2 className="recommended-title">Recommended Employees</h2>
        <p className="recommended-subtitle">Based on your activity and preferences</p>
      </div>
      <div className="recommended-grid">
        {employees.map((employee) => (
          <FeaturedEmployeeCard
            key={employee.id}
            employee={employee}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}

export default RecommendedSection;

