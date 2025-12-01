import React from 'react';
import './EmployeeCard.css';

function EmployeeCard({ employee, onSelect, onPreview, isFeatured = false }) {
  const skillBadges = employee.skills || ['Knowledgeable', 'Fast', 'Domain Expert'];

  return (
    <div className={`employee-card ${isFeatured ? 'featured' : ''}`}>
      <div className="employee-card-header">
        <div className="employee-avatar" style={{ backgroundColor: `${employee.color}15` }}>
          <span className="employee-icon">{employee.icon}</span>
        </div>
        {employee.isRecommended && (
          <div className="recommended-badge">Recommended</div>
        )}
      </div>
      
      <div className="employee-card-body">
        <h3 className="employee-card-name">{employee.name}</h3>
        <p className="employee-card-role">{employee.role}</p>
        <p className="employee-card-description">{employee.description}</p>
        
        <div className="employee-card-skills">
          {skillBadges.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-badge">{skill}</span>
          ))}
        </div>
      </div>

      <div className="employee-card-actions">
        <button 
          className="btn-primary"
          onClick={() => onSelect(employee.id)}
        >
          See Details
        </button>
      </div>
    </div>
  );
}

export default EmployeeCard;

