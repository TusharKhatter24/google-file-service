import React from 'react';
import './Card.css';

function Card({ 
  children, 
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  onClick,
  ...props 
}) {
  const classNames = [
    'card-modern',
    `card-modern-${variant}`,
    `card-modern-padding-${padding}`,
    hoverable && 'card-modern-hoverable',
    onClick && 'card-modern-clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;

