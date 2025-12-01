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
      {/* Navigation */}
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">A</div>
            <span className="logo-text">AI Concierges</span>
          </div>
          
          <div className="nav-links">
            <a href="#agents">Agents</a>
            <a href="#workflow">Workflow</a>
            <a href="#pricing">Pricing</a>
          </div>
          
          <div className="nav-actions">
            <Link to="/login" className="nav-login">
              Log in
            </Link>
            <Link to="/login" className="nav-button">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="glow-blob"></div>
        <div className="hero-container">
          <div className="badge">
            <span className="badge-dot">
              <span className="badge-ping"></span>
              <span className="badge-dot-inner"></span>
            </span>
            AI Agents 2.0 is live
          </div>
          
          <h1 className="hero-title">
            Scale your business with <br />
            <span className="text-gradient-primary">Digital Employees.</span>
          </h1>
          
          <p className="hero-subtitle">
            Hire specialized AI agents to handle your support, sales, and operations. 
            They work 24/7, never sleep, and cost less than your coffee budget.
          </p>
          
          <div className="hero-buttons">
            <Link to="/login" className="hero-button-primary">
              Deploy Your First Agent
            </Link>
            <button className="hero-button-secondary">
              View Demo
            </button>
          </div>
        </div>
      </header>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <div className="trusted-container">
          <p className="trusted-label">Trusted by innovative teams</p>
          <div className="trusted-logos">
            <div className="trusted-logo" style={{ fontFamily: 'serif' }}>Acme Corp</div>
            <div className="trusted-logo" style={{ fontFamily: 'monospace' }}>Globex</div>
            <div className="trusted-logo" style={{ fontStyle: 'italic' }}>Soylent</div>
            <div className="trusted-logo" style={{ letterSpacing: '0.1em' }}>MASSIVE</div>
            <div className="trusted-logo">Umbrella</div>
          </div>
        </div>
      </section>

      {/* Chat Interface Demo */}
      <section className="chat-section">
        <div className="chat-container">
          <div className="chat-header">
            <h2 className="chat-title">It feels like magic. <br />Because it is.</h2>
            <p className="chat-subtitle">Interact with your agents via a simple chat interface.</p>
          </div>
          
          <div className="glass-panel">
            <div className="chat-window-header">
              <div className="chat-dots">
                <div className="chat-dot chat-dot-red"></div>
                <div className="chat-dot chat-dot-yellow"></div>
                <div className="chat-dot chat-dot-green"></div>
              </div>
              <div className="chat-url">dashboard.concierge.ai</div>
            </div>
            
            <div className="chat-content">
              <div className="chat-sidebar">
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Your Agents</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 500 }}>
                  <span className="badge-ping" style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#4ade80' }}></span>
                  Researcher
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.25rem', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#475569' }}></span>
                  Scheduler
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '0.25rem', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#475569' }}></span>
                  Email Draft
                </div>
              </div>
              
              <div className="chat-main">
                <div className="chat-message-user">
                  <div className="chat-message-bubble-user">
                    Find the top 5 competitors for "AI Project Management" and summarize their pricing.
                  </div>
                </div>
                
                <div className="chat-message-ai">
                  <div className="chat-message-bubble-ai">
                    <div className="chat-message-header">
                      <div className="chat-avatar"></div>
                      <span className="chat-agent-name">Researcher Agent</span>
                      <span className="chat-time">Just now</span>
                    </div>
                    <p style={{ marginBottom: '0.75rem' }}>I've analyzed the market. Here are the top 5 competitors:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1rem', marginBottom: '0.75rem', color: '#94a3b8' }}>
                      <li style={{ marginBottom: '0.25rem' }}><strong style={{ color: 'white' }}>ClickUp:</strong> Free tier, then $7/user</li>
                      <li style={{ marginBottom: '0.25rem' }}><strong style={{ color: 'white' }}>Monday.com:</strong> Starts at $9/user</li>
                      <li style={{ marginBottom: '0.25rem' }}><strong style={{ color: 'white' }}>Asana:</strong> Premium is $10.99/user</li>
                    </ul>
                    <button style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.375rem 0.75rem', borderRadius: '0.25rem', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s', cursor: 'pointer', color: 'inherit' }}>
                      View Full Report
                    </button>
                  </div>
                </div>
                
                <div className="chat-input-container">
                  <input 
                    type="text" 
                    placeholder="Reply to Researcher..." 
                    className="chat-input"
                  />
                  <div className="chat-send-button">
                    <svg className="chat-send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="workflow" className="features-section">
        <div className="features-container">
          <h2 className="features-title">
            Built for <span className="text-gradient-primary">Every Workflow</span>
          </h2>
          
          <div className="features-grid">
            <div className="glass-panel feature-card-large">
              <div className="feature-glow"></div>
              <div className="feature-content">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Autonomous Execution</h3>
                <p className="feature-description">
                  Unlike simple chatbots, our agents can browse the web, access your database, and execute complex multi-step tasks without supervision.
                </p>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <span>Analyze incoming email</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <span>Check calendar availability</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <span>Draft and send reply</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-panel feature-card">
              <div className="feature-card-icon">🔒</div>
              <h3 className="feature-card-title">Enterprise Secure</h3>
              <p className="feature-card-description">SOC-2 Compliant. Your data never trains our models.</p>
            </div>
            
            <div className="glass-panel feature-card">
              <div className="feature-card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>🔌</div>
              <h3 className="feature-card-title">100+ Integrations</h3>
              <p className="feature-card-description">Connects with Notion, Slack, Gmail, and HubSpot instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="agents-section">
        <div className="agents-container">
          <h2 className="agents-title">
            Meet Your <span className="text-gradient-primary">AI Team</span>
          </h2>
          
          <div className="agents-grid">
            {allEmployees.map((employee) => (
              <div key={employee.id} className="glass-panel agent-card">
                <div className="agent-glow"></div>
                <div className="agent-content">
                  <div className="agent-icon">{employee.icon}</div>
                  <h3 className="agent-name">{employee.name}</h3>
                  <p className="agent-role">{employee.role}</p>
                  <p className="agent-description">{employee.description}</p>
                </div>
              </div>
            ))}
            
            <Link to="/login" className="glass-panel agent-card agent-card-create">
              <div className="agent-glow"></div>
              <div className="agent-content">
                <div className="agent-icon">➕</div>
                <h3 className="agent-name">Build a New Team Member</h3>
                <p className="agent-role">Create Custom AI Employee</p>
                <p className="agent-description">
                  Design your own AI team member with custom role, personality, and expertise
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <h2 className="pricing-title">
            Simple pricing for <span style={{ color: 'white' }}>serious growth</span>
          </h2>
          
          <div className="pricing-grid">
            <div className="glass-panel pricing-card">
              <h3 className="pricing-plan pricing-plan-starter">Starter</h3>
              <div className="pricing-price">
                $49<span className="pricing-period pricing-period-starter">/mo</span>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature pricing-feature-starter">
                  <span className="pricing-check">✓</span> 1 AI Agent
                </li>
                <li className="pricing-feature pricing-feature-starter">
                  <span className="pricing-check">✓</span> 100 Tasks / mo
                </li>
                <li className="pricing-feature pricing-feature-starter">
                  <span className="pricing-check">✓</span> Basic Integrations
                </li>
              </ul>
              <Link to="/login" className="pricing-button pricing-button-starter">
                Get Started
              </Link>
            </div>
            
            <div className="glass-panel pricing-card pricing-card-popular">
              <div className="pricing-badge">Most Popular</div>
              <h3 className="pricing-plan pricing-plan-popular">Pro</h3>
              <div className="pricing-price pricing-price-popular">
                $149<span className="pricing-period pricing-period-popular">/mo</span>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature pricing-feature-popular">
                  <span className="pricing-check pricing-check-popular">✓</span> 5 AI Agents
                </li>
                <li className="pricing-feature pricing-feature-popular">
                  <span className="pricing-check pricing-check-popular">✓</span> Unlimited Tasks
                </li>
                <li className="pricing-feature pricing-feature-popular">
                  <span className="pricing-check pricing-check-popular">✓</span> Advanced Memory
                </li>
              </ul>
              <Link to="/login" className="pricing-button pricing-button-popular">
                Start Free Trial
              </Link>
            </div>
            
            <div className="glass-panel pricing-card">
              <h3 className="pricing-plan pricing-plan-starter">Business</h3>
              <div className="pricing-price">
                $499<span className="pricing-period pricing-period-starter">/mo</span>
              </div>
              <ul className="pricing-features">
                <li className="pricing-feature pricing-feature-starter">
                  <span className="pricing-check">✓</span> Unlimited Agents
                </li>
                <li className="pricing-feature pricing-feature-starter">
                  <span className="pricing-check">✓</span> Custom Fine-tuning
                </li>
                <li className="pricing-feature pricing-feature-starter">
                  <span className="pricing-check">✓</span> API Access
                </li>
              </ul>
              <button className="pricing-button pricing-button-business">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-brand-title">AI Concierges</div>
            <p className="footer-brand-description">Automating the boring stuff so you can focus on the big stuff.</p>
            <div className="footer-links">
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-column-title">Product</h4>
            <div className="footer-column-links">
              <a href="#agents">Agents</a>
              <a href="#workflow">Workflow</a>
              <a href="#pricing">Pricing</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-column-title">Company</h4>
            <div className="footer-column-links">
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-column-title">Legal</h4>
            <div className="footer-column-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
