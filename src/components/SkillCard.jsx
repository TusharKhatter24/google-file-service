import React from 'react';
import './SkillCard.css';

function SkillCard({ skill, onClick }) {
  return (
    <div
      className="skill-card"
      onClick={() => onClick(skill)}
      style={{ '--skill-color': skill.color }}
    >
      <div className="skill-icon-wrapper">
        <div className="skill-icon">{skill.icon}</div>
      </div>
      <div className="skill-info">
        <h3 className="skill-name">{skill.name}</h3>
        <p className="skill-description">{skill.description}</p>
        <div className="skill-footer">
          <span className="skill-category-badge">{skill.category}</span>
          {!skill.isGlobal && (
            <span className="skill-config-badge" title="Configurable per employee">⚙️</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SkillCard;

