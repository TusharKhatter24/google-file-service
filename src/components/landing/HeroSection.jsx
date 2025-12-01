import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  const floatingShapesRef = useRef(null);

  useEffect(() => {
    // Create floating animation for decorative shapes
    const shapes = floatingShapesRef.current?.querySelectorAll('.floating-shape');
    if (shapes) {
      shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 0.5}s`;
      });
    }
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="floating-shapes" ref={floatingShapesRef}>
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        <div className="glow-effect"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">
              Hire AI Employees That Work For You
            </h1>
            <p className="hero-subheadline">
              Build, train, and collaborate with AI employees tailored to your business.
            </p>
            
            <div className="hero-ctas">
              <Link to="/login" className="hero-cta-primary">
                Get Started
              </Link>
              <Link to="/employees" className="hero-cta-secondary">
                See AI Employees
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">AI Employee Workspace</div>
              </div>
              <div className="preview-content">
                <div className="preview-sidebar">
                  <div className="preview-sidebar-header">
                    <div className="preview-avatar-large">👤</div>
                    <div className="preview-employee-info">
                      <div className="preview-employee-name">Donna</div>
                      <div className="preview-employee-role">Support Engineer</div>
                    </div>
                  </div>
                  <div className="preview-nav-item active">
                    <span className="preview-nav-icon">📊</span>
                    <span className="preview-nav-text">Overview</span>
                  </div>
                  <div className="preview-nav-item">
                    <span className="preview-nav-icon">📚</span>
                    <span className="preview-nav-text">Knowledge Base</span>
                  </div>
                  <div className="preview-nav-item">
                    <span className="preview-nav-icon">💬</span>
                    <span className="preview-nav-text">Conversations</span>
                  </div>
                  <div className="preview-nav-item">
                    <span className="preview-nav-icon">⚙️</span>
                    <span className="preview-nav-text">Settings</span>
                  </div>
                </div>
                <div className="preview-main">
                  <div className="preview-stats-row">
                    <div className="preview-stat-card">
                      <div className="preview-stat-value">247</div>
                      <div className="preview-stat-label">Conversations</div>
                    </div>
                    <div className="preview-stat-card">
                      <div className="preview-stat-value">98%</div>
                      <div className="preview-stat-label">Accuracy</div>
                    </div>
                    <div className="preview-stat-card">
                      <div className="preview-stat-value">2.3m</div>
                      <div className="preview-stat-label">Avg Response</div>
                    </div>
                  </div>
                  <div className="preview-chat-preview">
                    <div className="preview-chat-header">Recent Conversation</div>
                    <div className="preview-message user-msg">
                      <div className="preview-msg-avatar">U</div>
                      <div className="preview-msg-content">
                        <div className="preview-msg-text">How do I reset my password?</div>
                      </div>
                    </div>
                    <div className="preview-message ai-msg">
                      <div className="preview-msg-avatar">D</div>
                      <div className="preview-msg-content">
                        <div className="preview-msg-text">I can help you reset your password. Let me guide you through the steps...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

