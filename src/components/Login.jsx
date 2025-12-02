import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import './Login.css';

function Login() {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      navigate('/employees');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <button 
        onClick={toggleTheme} 
        className="theme-toggle-login"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Animated Background Graphics */}
      <div className="login-graphics">
        <div className="graphics-container">
          {/* Central AI Brain Illustration */}
          <div className="ai-brain-container">
            <div className="ai-brain">
              <div className="brain-core"></div>
              <div className="brain-pulse pulse-1"></div>
              <div className="brain-pulse pulse-2"></div>
              <div className="brain-pulse pulse-3"></div>
            </div>
          </div>

          {/* Floating Skill Icons */}
          <div className="floating-icon icon-1" data-skill="documents">
            <div className="icon-wrapper">📄</div>
            <div className="icon-label">Documents</div>
          </div>
          
          <div className="floating-icon icon-2" data-skill="chat">
            <div className="icon-wrapper">💬</div>
            <div className="icon-label">Chat</div>
          </div>
          
          <div className="floating-icon icon-3" data-skill="calendar">
            <div className="icon-wrapper">📅</div>
            <div className="icon-label">Calendar</div>
          </div>
          
          <div className="floating-icon icon-4" data-skill="research">
            <div className="icon-wrapper">🔍</div>
            <div className="icon-label">Research</div>
          </div>
          
          <div className="floating-icon icon-5" data-skill="notes">
            <div className="icon-wrapper">📝</div>
            <div className="icon-label">Notes</div>
          </div>
          
          <div className="floating-icon icon-6" data-skill="analytics">
            <div className="icon-wrapper">📊</div>
            <div className="icon-label">Analytics</div>
          </div>

          {/* Connection Lines */}
          <svg className="connection-lines" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary, #4F46E5)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--color-primary, #4F46E5)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--color-primary, #4F46E5)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="lines-group">
              <line className="connection-line line-1" x1="400" y1="300" x2="200" y2="150" stroke="url(#lineGradient)" strokeWidth="2" />
              <line className="connection-line line-2" x1="400" y1="300" x2="600" y2="150" stroke="url(#lineGradient)" strokeWidth="2" />
              <line className="connection-line line-3" x1="400" y1="300" x2="150" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line className="connection-line line-4" x1="400" y1="300" x2="650" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line className="connection-line line-5" x1="400" y1="300" x2="300" y2="500" stroke="url(#lineGradient)" strokeWidth="2" />
              <line className="connection-line line-6" x1="400" y1="300" x2="500" y2="500" stroke="url(#lineGradient)" strokeWidth="2" />
            </g>
          </svg>

          {/* Feature Highlights */}
          <div className="feature-highlights">
            <div className="highlight-item delay-1">
              <span className="highlight-icon">🤖</span>
              <span className="highlight-text">AI-Powered Assistants</span>
            </div>
            <div className="highlight-item delay-2">
              <span className="highlight-icon">⚡</span>
              <span className="highlight-text">Instant Responses</span>
            </div>
            <div className="highlight-item delay-3">
              <span className="highlight-icon">🎯</span>
              <span className="highlight-text">Smart Task Management</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">AI Concierges</h1>
          <p className="login-subtitle">Your intelligent workforce awaits</p>
          <p className="login-description">Sign in to access your team of AI employees ready to assist with documents, research, scheduling, and more.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            <span>Sign In</span>
            <span className="button-arrow">→</span>
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <span className="demo-label">Demo Access:</span>
            <code className="demo-code">admin / admin</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

