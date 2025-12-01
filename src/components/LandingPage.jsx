import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { employees } from '../data/employees';
import './LandingPage.css';

function LandingPage() {
  const [allEmployees, setAllEmployees] = useState(employees);
  const stepsRailRef = useRef(null);
  const powerfulFeaturesRailRef = useRef(null);

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

  useEffect(() => {
    // Auto-scroll the steps rail
    const rail = stepsRailRef.current;
    if (!rail) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrameId;
    let isPaused = false;
    let isScrolling = false;

    const autoScroll = () => {
      if (!isPaused && isScrolling) {
        const track = rail.querySelector('.steps-rail-track');
        if (!track) return;

        scrollPosition += scrollSpeed;
        const maxScroll = track.scrollWidth / 2; // Half because we duplicated the cards
        
        // Reset scroll position when reaching the end (seamless loop)
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        rail.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    // Check if rail is ready and start scrolling
    const checkAndStart = () => {
      const track = rail.querySelector('.steps-rail-track');
      if (track && track.scrollWidth > rail.clientWidth) {
        isScrolling = true;
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(autoScroll);
        }
      } else {
        // Retry after a short delay
        setTimeout(checkAndStart, 100);
      }
    };

    rail.addEventListener('mouseenter', handleMouseEnter);
    rail.addEventListener('mouseleave', handleMouseLeave);

    // Start checking after content loads
    const startTimeout = setTimeout(() => {
      checkAndStart();
    }, 1000);

    // Recalculate on resize
    const handleResize = () => {
      isScrolling = false;
      scrollPosition = 0;
      rail.scrollLeft = 0;
      setTimeout(checkAndStart, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(startTimeout);
      window.removeEventListener('resize', handleResize);
      rail.removeEventListener('mouseenter', handleMouseEnter);
      rail.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll the powerful features rail
    const rail = powerfulFeaturesRailRef.current;
    if (!rail) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrameId;
    let isPaused = false;
    let isScrolling = false;

    const autoScroll = () => {
      if (!isPaused && isScrolling) {
        const track = rail.querySelector('.powerful-features-rail-track');
        if (!track) return;

        scrollPosition += scrollSpeed;
        const maxScroll = track.scrollWidth / 2; // Half because we duplicated the cards
        
        // Reset scroll position when reaching the end (seamless loop)
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        rail.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    // Check if rail is ready and start scrolling
    const checkAndStart = () => {
      const track = rail.querySelector('.powerful-features-rail-track');
      if (track && track.scrollWidth > rail.clientWidth) {
        isScrolling = true;
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(autoScroll);
        }
      } else {
        // Retry after a short delay
        setTimeout(checkAndStart, 100);
      }
    };

    rail.addEventListener('mouseenter', handleMouseEnter);
    rail.addEventListener('mouseleave', handleMouseLeave);

    // Start checking after content loads
    const startTimeout = setTimeout(() => {
      checkAndStart();
    }, 1000);

    // Recalculate on resize
    const handleResize = () => {
      isScrolling = false;
      scrollPosition = 0;
      rail.scrollLeft = 0;
      setTimeout(checkAndStart, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(startTimeout);
      window.removeEventListener('resize', handleResize);
      rail.removeEventListener('mouseenter', handleMouseEnter);
      rail.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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
          <div className="steps-rail-wrapper">
            <div className="steps-rail" ref={stepsRailRef}>
              <div className="steps-rail-track">
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
                {/* Spacer between sets for visual separation */}
                <div className="steps-rail-spacer"></div>
                {/* Duplicate cards for seamless infinite scroll */}
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
            </div>
          </div>
          <div className="steps-cta">
            <Link to="/login" className="steps-cta-button">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-powerful-features">
        <div className="powerful-features-container">
          <div className="powerful-features-header">
            <h2 className="powerful-features-title">Powerful Skillsets</h2>
            <p className="powerful-features-subtitle">
              Equip your AI team with advanced capabilities for research, note-taking, and seamless integrations
            </p>
          </div>
          
          <div className="powerful-features-rail-wrapper">
            <div className="powerful-features-rail" ref={powerfulFeaturesRailRef}>
              <div className="powerful-features-rail-track">
                <div className="powerful-feature-card research-feature">
                  <div className="powerful-feature-icon-wrapper">
                    <div className="powerful-feature-icon">🔍</div>
                    <div className="powerful-feature-badge">NEW</div>
                  </div>
                  <h3 className="powerful-feature-name">AI Research Tool</h3>
                  <p className="powerful-feature-tagline">Powered by Research API</p>
                  <p className="powerful-feature-description">
                    Instantly research any topic, API documentation, error codes, or technical information. 
                    Get comprehensive research reports with citations and sources. Perfect for developers, 
                    researchers, and knowledge workers who need accurate, up-to-date information fast.
                  </p>
                  <div className="powerful-feature-benefits">
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🌐</span>
                      <span>Research external tools & APIs</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">📚</span>
                      <span>Access technical documentation</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">⚡</span>
                      <span>Get instant, accurate answers</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🔗</span>
                      <span>Citations and sources included</span>
                    </div>
                  </div>
                </div>

                <div className="powerful-feature-card notes-feature">
                  <div className="powerful-feature-icon-wrapper">
                    <div className="powerful-feature-icon">✍️</div>
                    <div className="powerful-feature-badge">ENHANCED</div>
                  </div>
                  <h3 className="powerful-feature-name">Smart Notes Taker</h3>
                  <p className="powerful-feature-tagline">AI-Powered Note Creation & Enhancement</p>
                  <p className="powerful-feature-description">
                    Create intelligent notes with AI assistance. Summarize, rewrite, extract key points, 
                    and enhance your content. Extract text from documents, use voice transcription, and 
                    leverage AI tools to transform raw content into polished, structured knowledge that 
                    powers your AI assistant's responses.
                  </p>
                  <div className="powerful-feature-benefits">
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🤖</span>
                      <span>AI-powered writing assistance</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">📄</span>
                      <span>Extract content from documents</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🎤</span>
                      <span>Voice transcription support</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">💾</span>
                      <span>Save directly to knowledge base</span>
                    </div>
                  </div>
                </div>

                <div className="powerful-feature-card slack-feature">
                  <div className="powerful-feature-icon-wrapper">
                    <div className="powerful-feature-icon">💬</div>
                    <div className="powerful-feature-badge">INTEGRATION</div>
                  </div>
                  <h3 className="powerful-feature-name">Slack Integration</h3>
                  <p className="powerful-feature-tagline">Seamless Team Communication</p>
                  <p className="powerful-feature-description">
                    Connect your AI team directly to Slack channels. Monitor conversations, draft intelligent 
                    replies, and stay connected with your team. Your AI employee can read messages, understand 
                    context, and respond appropriately, ensuring seamless communication across your organization.
                  </p>
                  <div className="powerful-feature-benefits">
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">📢</span>
                      <span>Monitor Slack channels</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">✍️</span>
                      <span>Draft intelligent replies</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🔔</span>
                      <span>Real-time notifications</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🤝</span>
                      <span>Team collaboration support</span>
                    </div>
                  </div>
                </div>

                <div className="powerful-feature-card jira-feature">
                  <div className="powerful-feature-icon-wrapper">
                    <div className="powerful-feature-icon">🎫</div>
                    <div className="powerful-feature-badge">INTEGRATION</div>
                  </div>
                  <h3 className="powerful-feature-name">Jira Integration</h3>
                  <p className="powerful-feature-tagline">Project Management Made Easy</p>
                  <p className="powerful-feature-description">
                    Empower your AI team to manage Jira tickets, update statuses, and track project workflows. 
                    Create tickets automatically, update progress, and keep your team aligned. Perfect for 
                    project managers and development teams who need intelligent task and issue management.
                  </p>
                  <div className="powerful-feature-benefits">
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🎯</span>
                      <span>Create & manage tickets</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">📊</span>
                      <span>Update ticket status</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🔄</span>
                      <span>Track project workflows</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">⚡</span>
                      <span>Automate task management</span>
                    </div>
                  </div>
                </div>
                {/* Spacer between sets for visual separation */}
                <div className="powerful-features-rail-spacer"></div>
                {/* Duplicate cards for seamless infinite scroll */}
            <div className="powerful-feature-card research-feature">
              <div className="powerful-feature-icon-wrapper">
                <div className="powerful-feature-icon">🔍</div>
                <div className="powerful-feature-badge">NEW</div>
              </div>
              <h3 className="powerful-feature-name">AI Research Tool</h3>
              <p className="powerful-feature-tagline">Powered by Research API</p>
              <p className="powerful-feature-description">
                Instantly research any topic, API documentation, error codes, or technical information. 
                Get comprehensive research reports with citations and sources. Perfect for developers, 
                researchers, and knowledge workers who need accurate, up-to-date information fast.
              </p>
              <div className="powerful-feature-benefits">
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🌐</span>
                  <span>Research external tools & APIs</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">📚</span>
                  <span>Access technical documentation</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">⚡</span>
                  <span>Get instant, accurate answers</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🔗</span>
                  <span>Citations and sources included</span>
                </div>
              </div>
            </div>

            <div className="powerful-feature-card notes-feature">
              <div className="powerful-feature-icon-wrapper">
                <div className="powerful-feature-icon">✍️</div>
                <div className="powerful-feature-badge">ENHANCED</div>
              </div>
              <h3 className="powerful-feature-name">Smart Notes Taker</h3>
              <p className="powerful-feature-tagline">AI-Powered Note Creation & Enhancement</p>
              <p className="powerful-feature-description">
                Create intelligent notes with AI assistance. Summarize, rewrite, extract key points, 
                and enhance your content. Extract text from documents, use voice transcription, and 
                leverage AI tools to transform raw content into polished, structured knowledge that 
                powers your AI assistant's responses.
              </p>
              <div className="powerful-feature-benefits">
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🤖</span>
                  <span>AI-powered writing assistance</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">📄</span>
                  <span>Extract content from documents</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🎤</span>
                  <span>Voice transcription support</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">💾</span>
                  <span>Save directly to knowledge base</span>
                </div>
              </div>
            </div>

            <div className="powerful-feature-card slack-feature">
              <div className="powerful-feature-icon-wrapper">
                <div className="powerful-feature-icon">💬</div>
                <div className="powerful-feature-badge">INTEGRATION</div>
              </div>
              <h3 className="powerful-feature-name">Slack Integration</h3>
              <p className="powerful-feature-tagline">Seamless Team Communication</p>
              <p className="powerful-feature-description">
                Connect your AI team directly to Slack channels. Monitor conversations, draft intelligent 
                replies, and stay connected with your team. Your AI employee can read messages, understand 
                context, and respond appropriately, ensuring seamless communication across your organization.
              </p>
              <div className="powerful-feature-benefits">
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">📢</span>
                  <span>Monitor Slack channels</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">✍️</span>
                  <span>Draft intelligent replies</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🔔</span>
                  <span>Real-time notifications</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🤝</span>
                  <span>Team collaboration support</span>
                </div>
              </div>
            </div>

            <div className="powerful-feature-card jira-feature">
              <div className="powerful-feature-icon-wrapper">
                <div className="powerful-feature-icon">🎫</div>
                <div className="powerful-feature-badge">INTEGRATION</div>
              </div>
              <h3 className="powerful-feature-name">Jira Integration</h3>
              <p className="powerful-feature-tagline">Project Management Made Easy</p>
              <p className="powerful-feature-description">
                Empower your AI team to manage Jira tickets, update statuses, and track project workflows. 
                Create tickets automatically, update progress, and keep your team aligned. Perfect for 
                project managers and development teams who need intelligent task and issue management.
              </p>
              <div className="powerful-feature-benefits">
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🎯</span>
                  <span>Create & manage tickets</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">📊</span>
                  <span>Update ticket status</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🔄</span>
                  <span>Track project workflows</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">⚡</span>
                  <span>Automate task management</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

