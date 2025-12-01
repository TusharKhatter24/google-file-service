import React from 'react';
import './EmptyState.css';

function EmptyState({ 
  icon = '📭',
  title,
  description,
  action,
  actionLabel,
  className = '',
  ...props 
}) {
  return (
    <div className={`empty-state ${className}`} {...props}>
      <div className="empty-state-icon">{icon}</div>
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && actionLabel && (
        <button className="empty-state-action" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

