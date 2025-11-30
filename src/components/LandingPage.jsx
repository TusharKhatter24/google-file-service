import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employees } from '../data/employees';
import './LandingPage.css';

function LandingPage() {
  const [allEmployees, setAllEmployees] = useState(employees);

  useEffect(() => {
    // Load custom employees from localStorage
    const customEmployeesJson = localStorage.getItem('customEmployees');
    if (customEmployeesJson) {
      try {
        const customEmployees = JSON.parse(customEmployeesJson);
        setAllEmployees([...employees, ...customEmployees]);
      } catch (e) {
        console.error('Failed to parse custom employees:', e);
      }
    }
  }, []);

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
            AI Concierges: Accelerate, Optimize, and Streamline Your Internal Workflow
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
            {allEmployees.map((employee) => (
              <div 
                key={employee.id} 
                className="feature-card"
                style={{ '--employee-color': employee.color }}
              >
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{employee.icon}</div>
                </div>
                <h3 className="feature-name">{employee.name}</h3>
                <p className="feature-role">{employee.role}</p>
                <p className="feature-description">{employee.description}</p>
              </div>
            ))}
            <Link 
              to="/login"
              className="feature-card create-employee-card"
            >
              <div className="feature-icon-wrapper">
                <div className="feature-icon">➕</div>
              </div>
              <h3 className="feature-name">Build a New Team Member</h3>
              <p className="feature-role">Create Custom AI Employee</p>
              <p className="feature-description">
                Design your own AI team member with custom role, personality, and expertise
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-steps">
        <div className="steps-container">
          <h2 className="steps-title">How It Works</h2>
          <p className="steps-subtitle">Get started with your AI team in just a few simple steps</p>
          <div className="steps-grid">
            <div className="step-card" data-step="1">
              <div className="step-number">1</div>
              <div className="step-icon">👤</div>
              <h3 className="step-title">Choose Your AI Employee</h3>
              <p className="step-description">
                Select from pre-built AI employees or create custom ones tailored to your needs
              </p>
            </div>
            <div className="step-card" data-step="2">
              <div className="step-number">2</div>
              <div className="step-icon">📚</div>
              <h3 className="step-title">Configure Knowledge Base</h3>
              <p className="step-description">
                Upload documents and train your AI with your company's knowledge and information
              </p>
            </div>
            <div className="step-card" data-step="3">
              <div className="step-number">3</div>
              <div className="step-icon">⚙️</div>
              <h3 className="step-title">Customize Settings</h3>
              <p className="step-description">
                Set system prompts, model parameters, and preferences to match your requirements
              </p>
            </div>
            <div className="step-card" data-step="4">
              <div className="step-number">4</div>
              <div className="step-icon">💬</div>
              <h3 className="step-title">Begin Collaboration</h3>
              <p className="step-description">
                Work alongside your AI employee to accelerate productivity and streamline workflows
              </p>
            </div>
            <div className="step-card" data-step="5">
              <div className="step-number">5</div>
              <div className="step-icon">🎯</div>
              <h3 className="step-title">Give Skills to AI Team</h3>
              <p className="step-description">
                Empower your AI employees with skills like meeting assistance, task management, and integrations
              </p>
            </div>
          </div>
          <div className="steps-cta">
            <Link to="/login" className="steps-cta-button">
              Get Started Now
            </Link>
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

