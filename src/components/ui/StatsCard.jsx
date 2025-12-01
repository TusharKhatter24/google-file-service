import React from 'react';
import Card from '../Card';
import './StatsCard.css';

function StatsCard({ 
  title, 
  value, 
  trend, 
  icon,
  description,
  className = '',
  ...props 
}) {
  return (
    <Card className={`stats-card ${className}`} hoverable {...props}>
      <div className="stats-card-header">
        {icon && <div className="stats-card-icon">{icon}</div>}
        <div className="stats-card-content">
          <div className="stats-card-title">{title}</div>
          <div className="stats-card-value">{value}</div>
          {trend && (
            <div className={`stats-card-trend ${trend.positive ? 'positive' : 'negative'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
          {description && (
            <div className="stats-card-description">{description}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default StatsCard;

