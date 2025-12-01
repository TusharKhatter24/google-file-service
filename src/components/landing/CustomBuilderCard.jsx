import React from 'react';
import { Link } from 'react-router-dom';
import './CustomBuilderCard.css';

function CustomBuilderCard() {
  return (
    <div className="custom-builder-card">
      <div className="builder-icon-wrapper">
        <div className="builder-icon">✨</div>
      </div>
      <h3 className="builder-title">Create Your Own AI Employee</h3>
      <p className="builder-description">
        Design a fully custom AI employee—define role, skills, personality, and knowledge.
      </p>
      <Link to="/employees" className="builder-cta">
        Build Custom AI Employee
      </Link>
    </div>
  );
}

export default CustomBuilderCard;

