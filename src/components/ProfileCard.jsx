import React, { useState, useRef } from 'react';
import { getIconComponent } from '../utils/iconHelper';
import './ProfileCard.css';

const ProfileCard = ({
  name,
  title,
  role,
  handle,
  status = 'Online',
  contactText = 'Select',
  avatarUrl,
  icon,
  color,
  backgroundImage,
  showUserInfo = true,
  enableTilt = true,
  enableMobileTilt = false,
  onContactClick,
  onCardClick,
  onDeleteClick,
  isSelected = false,
  isCustom = false
}) => {
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!enableTilt) return;
    if (!enableMobileTilt && window.innerWidth < 768) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.3s ease-out'
    });
  };

  return (
    <div
      ref={cardRef}
      className={`profile-card ${isSelected ? 'profile-card-selected' : ''} ${backgroundImage ? 'profile-card-with-bg' : ''}`}
      style={{
        ...tiltStyle,
        '--card-color': color || '#667eea',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick || onContactClick}
    >
      <div className="profile-card-inner">
        {/* Delete button for custom employees */}
        {isCustom && onDeleteClick && (
          <button
            className="profile-card-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(e);
            }}
            title="Delete custom employee"
          >
            🗑️
          </button>
        )}

        {/* Background Gradient */}
        <div 
          className="profile-card-gradient"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`
          }}
        ></div>

        {/* Avatar Section */}
        <div className="profile-card-avatar-section">
          <div className="profile-card-avatar-wrapper">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="profile-card-avatar" />
            ) : (
              <div 
                className="profile-card-avatar-icon"
                style={{ background: 'transparent', border: `3px solid ${color}` }}
              >
                {(() => {
                  const IconComponent = getIconComponent(icon);
                  return IconComponent ? (
                    <IconComponent className="profile-card-icon-heroicon" style={{ width: '2.5rem', height: '2.5rem', color: color }} />
                  ) : (
                    <span className="profile-card-icon-emoji">{icon || '🤖'}</span>
                  );
                })()}
              </div>
            )}
            {status && (
              <div className={`profile-card-status ${status.toLowerCase()}`}>
                <div className="profile-card-status-dot"></div>
                <span className="profile-card-status-text">{status}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        {showUserInfo && (
          <div className="profile-card-info">
            <h3 className="profile-card-name">{name}</h3>
            <p className="profile-card-title">{title || role}</p>
            {handle && (
              <p className="profile-card-handle">@{handle}</p>
            )}
          </div>
        )}

        {/* Action Button */}
        <button 
          className="profile-card-button"
          onClick={(e) => {
            e.stopPropagation();
            if (onContactClick) onContactClick();
          }}
          style={{
            background: isSelected 
              ? `linear-gradient(135deg, ${color}, ${color}dd)`
              : 'transparent'
          }}
        >
          <span>{isSelected ? '✓ Selected' : contactText}</span>
          {!isSelected && <span className="profile-card-button-arrow">→</span>}
        </button>

        {/* Decorative Elements */}
        <div className="profile-card-decoration">
          <div className="profile-card-circle" style={{ borderColor: `${color}30` }}></div>
          <div className="profile-card-circle" style={{ borderColor: `${color}20` }}></div>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="profile-card-shine"></div>
    </div>
  );
};

export default ProfileCard;


