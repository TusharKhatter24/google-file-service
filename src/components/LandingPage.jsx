import React from 'react';
import { Link } from 'react-router-dom';
import { employees } from '../data/employees';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-logo">AI Concierges</div>
          <Link to="/login" className="landing-login-btn">Log In</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            AI Concierges to faster/optimise/productive your internal workflow
          </h1>
          <p className="hero-subtitle">
            Get an AI Team who run your inbox, integrations, onboarding, implementation, and support
          </p>
          <Link to="/login" className="hero-cta">
            Get Started
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="features-container">
          <h2 className="features-title">Meet Your AI Team</h2>
          <div className="features-grid">
            {employees.map((employee) => (
              <div key={employee.id} className="feature-card">
                <div className="feature-icon">{employee.icon}</div>
                <h3 className="feature-name">{employee.name}</h3>
                <p className="feature-role">{employee.role}</p>
                <p className="feature-description">{employee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-benefits">
        <div className="benefits-container">
          <h2 className="benefits-title">Stop juggling. Start scaling.</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>Automate Your Workflow</h3>
              <p>Let AI handle repetitive tasks so you can focus on what matters</p>
            </div>
            <div className="benefit-item">
              <h3>24/7 Availability</h3>
              <p>Your AI team never sleeps, ensuring continuous support and operations</p>
            </div>
            <div className="benefit-item">
              <h3>Customizable & Scalable</h3>
              <p>Train and configure your AI employees to match your exact needs</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2025 AI Concierges. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

