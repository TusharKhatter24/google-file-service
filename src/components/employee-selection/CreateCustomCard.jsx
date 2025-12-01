import React from 'react';
import './CreateCustomCard.css';

function CreateCustomCard({ onClick }) {
  return (
    <div className="create-custom-card" onClick={onClick}>
      <div className="create-custom-icon-wrapper">
        <div className="create-custom-icon">✨</div>
      </div>
      <div className="create-custom-content">
        <h3 className="create-custom-title">Create Your Own AI Employee</h3>
        <p className="create-custom-description">
          Design a custom AI employee with your own role, skills, and knowledge.
        </p>
        <button className="create-custom-btn">
          Build Custom AI Employee
        </button>
      </div>
    </div>
  );
}

export default CreateCustomCard;
