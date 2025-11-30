import React from 'react';
import './SkillCard.css';

function SkillCard({ skill, onClick, isEnabled = false, hasConfig = false, onToggle, employeeId }) {
  const handleToggleClick = (e) => {
    e.stopPropagation(); // Prevent card click when toggling
    e.preventDefault(); // Prevent default behavior
    if (onToggle) {
      onToggle(skill.id);
    }
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on toggle
    if (e.target.closest('.skill-toggle-wrapper') || e.target.closest('.skill-toggle')) {
      return;
    }
    if (onClick) {
      onClick(skill);
    }
  };

  return (
    <div
      className={`skill-card ${isEnabled ? 'skill-enabled' : 'skill-disabled'}`}
      onClick={handleCardClick}
      style={{ '--skill-color': skill.color }}
    >
      <div className="skill-header">
        <div className="skill-status-badge">
          {isEnabled ? (
            <span className="skill-enabled-badge" title="Enabled">✓</span>
          ) : (
            <span className="skill-disabled-badge" title="Disabled">○</span>
          )}
        </div>
        {hasConfig && (
          <span className="skill-config-indicator" title="Has custom configuration">⚙️</span>
        )}
      </div>
      
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
      
      {onToggle && (
        <div className="skill-toggle-wrapper" onClick={handleToggleClick} onMouseDown={(e) => e.stopPropagation()}>
          <label className="skill-toggle" onClick={handleToggleClick} onMouseDown={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={handleToggleClick}
              onClick={handleToggleClick}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <span className="skill-toggle-slider"></span>
          </label>
        </div>
      )}
    </div>
  );
}

export default SkillCard;

