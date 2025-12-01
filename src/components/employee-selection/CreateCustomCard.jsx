import React from 'react';
import './CreateCustomCard.css';

function CreateCustomCard({ onClick }) {
  return (
    <div className="create-custom-card" onClick={onClick}>
      <div className="create-custom-content">
        <div className="create-custom-icon">🔧</div>
        <div className="create-custom-text">
          <h3 className="create-custom-title">Build Your Own AI Employee</h3>
          <p className="create-custom-subtitle">
            Define role, personality, skills, and knowledge.
          </p>
        </div>
        <button className="create-custom-btn">
          Create Custom
        </button>
      </div>
      <div className="create-custom-visual">
        <div className="blueprint-icon">📐</div>
      </div>
    </div>
  );
}

export default CreateCustomCard;

