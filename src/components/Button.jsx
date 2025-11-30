import React from 'react';
import './Button.css';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const classNames = [
    'btn-modern',
    `btn-modern-${variant}`,
    `btn-modern-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

