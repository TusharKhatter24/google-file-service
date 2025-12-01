import React from 'react';
import { Link } from 'react-router-dom';
import ScrollAnimation from './ScrollAnimation';
import './ProductPreview.css';

function ProductPreview() {
  return (
    <section className="product-preview-section">
      <div className="product-preview-container">
        <ScrollAnimation>
          <div className="product-preview-visual">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-nav">
                  <div className="mockup-nav-item"></div>
                  <div className="mockup-nav-item"></div>
                  <div className="mockup-nav-item active"></div>
                  <div className="mockup-nav-item"></div>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-chat-container">
                  <div className="mockup-chat-header">
                    <div className="mockup-chat-title">
                      <div className="mockup-chat-avatar">👤</div>
                      <div>
                        <div className="mockup-chat-name">Donna - AI Support Engineer</div>
                        <div className="mockup-chat-status">Online • Responds in seconds</div>
                      </div>
                    </div>
                  </div>
                  <div className="mockup-chat-messages">
                    <div className="mockup-message user">
                      <div className="mockup-avatar">U</div>
                      <div className="mockup-bubble">
                        <div className="mockup-bubble-text">I need help with my account settings</div>
                        <div className="mockup-bubble-time">2:34 PM</div>
                      </div>
                    </div>
                    <div className="mockup-message ai">
                      <div className="mockup-avatar ai-avatar">D</div>
                      <div className="mockup-bubble ai-bubble">
                        <div className="mockup-bubble-text">I'd be happy to help! What specific account settings would you like to change? I can guide you through updating your profile, password, notifications, or privacy settings.</div>
                        <div className="mockup-bubble-time">2:34 PM</div>
                      </div>
                    </div>
                    <div className="mockup-message user">
                      <div className="mockup-avatar">U</div>
                      <div className="mockup-bubble">
                        <div className="mockup-bubble-text">Can you update my email address?</div>
                        <div className="mockup-bubble-time">2:35 PM</div>
                      </div>
                    </div>
                    <div className="mockup-message ai">
                      <div className="mockup-avatar ai-avatar">D</div>
                      <div className="mockup-bubble ai-bubble">
                        <div className="mockup-bubble-text">Absolutely! I'll help you update your email. Based on your account, here's how to do it: [Provides step-by-step instructions from knowledge base]</div>
                        <div className="mockup-bubble-time">2:35 PM</div>
                      </div>
                    </div>
                  </div>
                  <div className="mockup-chat-input">
                    <div className="mockup-input-placeholder">Type your message...</div>
                    <div className="mockup-input-actions">
                      <span className="mockup-input-icon">📎</span>
                      <span className="mockup-input-icon">🎤</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation>
          <div className="product-preview-content">
            <h2 className="preview-section-title">Work With AI Employees, Not Chatbots</h2>
          
          <ul className="preview-features">
            <li className="preview-feature">
              <div className="feature-icon">✓</div>
              <div>
                <div className="feature-title">Specialized roles</div>
                <div className="feature-description">Each AI employee has a specific role and expertise</div>
              </div>
            </li>
            <li className="preview-feature">
              <div className="feature-icon">✓</div>
              <div>
                <div className="feature-title">Trained with your knowledge</div>
                <div className="feature-description">Learn from your documents, processes, and data</div>
              </div>
            </li>
            <li className="preview-feature">
              <div className="feature-icon">✓</div>
              <div>
                <div className="feature-title">Multi-modal input/output</div>
                <div className="feature-description">Text, voice, and visual interactions supported</div>
              </div>
            </li>
            <li className="preview-feature">
              <div className="feature-icon">✓</div>
              <div>
                <div className="feature-title">Understands context across departments</div>
                <div className="feature-description">Shares knowledge and context seamlessly</div>
              </div>
            </li>
          </ul>

            <Link to="/login" className="preview-cta">
              Explore Features
            </Link>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}

export default ProductPreview;

