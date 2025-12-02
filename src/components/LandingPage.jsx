import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { employees } from '../data/employees';
import { useTheme } from '../contexts/ThemeContext';
import ProfileCard from './ProfileCard';
import './LandingPage.css';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
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
        // Retry after a short delay - wait for all 5 cards to load
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-nav">
          <div className="landing-logo">AI Concierges</div>
          <nav className="landing-nav-tabs">
            <motion.button 
              className="landing-nav-tab" 
              onClick={() => scrollToSection('features')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Features
            </motion.button>
            <motion.button 
              className="landing-nav-tab" 
              onClick={() => scrollToSection('how-it-works')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              How It Works
            </motion.button>
            <motion.button 
              className="landing-nav-tab" 
              onClick={() => scrollToSection('skills')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Skills
            </motion.button>
            <motion.button 
              className="landing-nav-tab" 
              onClick={() => scrollToSection('our-story')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Our Story
            </motion.button>
          </nav>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <motion.button 
              onClick={toggleTheme} 
              className="theme-toggle-landing"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/login" className="landing-login-btn">Log In</Link>
            </motion.div>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-background-animation"></div>
        <div className="hero-sliding-stripes">
          <div className="hero-stripe hero-stripe-1"></div>
          <div className="hero-stripe hero-stripe-2"></div>
          <div className="hero-stripe hero-stripe-3"></div>
          <div className="hero-stripe hero-stripe-4"></div>
        </div>
        <div className="hero-sliding-waves">
          <div className="hero-wave hero-wave-1"></div>
          <div className="hero-wave hero-wave-2"></div>
          <div className="hero-wave hero-wave-3"></div>
        </div>
        <div className="hero-geometric-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
          <div className="hero-shape hero-shape-4"></div>
          <div className="hero-shape hero-shape-5"></div>
          <div className="hero-shape hero-shape-6"></div>
          <div className="hero-shape hero-shape-7"></div>
        </div>
        <div className="hero-sliding-elements">
          <div className="hero-slide-element slide-left-1"></div>
          <div className="hero-slide-element slide-right-1"></div>
          <div className="hero-slide-element slide-left-2"></div>
          <div className="hero-slide-element slide-right-2"></div>
        </div>
        <div className="hero-particles">
          {[...Array(40)].map((_, i) => (
            <div key={i} className={`hero-particle particle-${i + 1}`}></div>
          ))}
        </div>
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="hero-title"
            variants={fadeInUp}
          >
            AI Concierges: Accelerate, Optimize, and Streamline Your Internal Workflow
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            variants={fadeInUp}
          >
            Get an AI Team who run your inbox, integrations, onboarding, implementation, and support
          </motion.p>
          <motion.div variants={scaleIn}>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/login" className="hero-cta">
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <motion.section 
        id="our-story" 
        className="landing-our-story"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="our-story-container">
          <motion.h2 
            className="our-story-title"
            variants={fadeInUp}
          >
            Our Story
          </motion.h2>
          <motion.div 
            className="our-story-content"
            variants={staggerContainer}
          >
            <motion.div 
              className="our-story-problem"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3 className="our-story-subtitle">The Problem</h3>
              <p className="our-story-text">
                Every day, organizations handle client calls, integrations, implementations, and product 
                development—all while their knowledge base expands across documents, tickets, meetings, 
                and internal discussions. Yet finding accurate answers quickly becomes increasingly difficult 
                as information fragments across multiple systems and conversations.
              </p>
              <p className="our-story-text">
                This knowledge fragmentation slows down client responses, creates inconsistencies, and 
                impacts overall team efficiency. Support and implementation teams waste valuable time 
                searching through scattered information instead of delivering fast, confident responses.
              </p>
              <p className="our-story-text">
                Critical information—integration details, product features, standard operating procedures, 
                past issue resolutions, and client context—exists but isn't instantly accessible when 
                teams need it most, within their existing workflows.
              </p>
            </motion.div>
            <motion.div 
              className="our-story-solution"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3 className="our-story-subtitle">Our Solution</h3>
              <p className="our-story-text">
                AI Concierges provides instant access to all relevant knowledge—integrations, product 
                features, SOPs, past issues, and client context—through intelligent AI employees powered 
                by your knowledge base. Each AI employee can be configured with custom system prompts, 
                selected knowledge stores, and specialized skills to match your team's needs.
              </p>
              <p className="our-story-text">
                Our platform enables you to build, customize, and deploy AI team members with skills like 
                meeting assistance, Slack and Jira integrations, email management, document analysis, 
                research capabilities, and workflow automation. They access your uploaded documents and 
                knowledge stores to provide accurate, contextual responses based on your company's information.
              </p>
              <p className="our-story-text">
                With pre-built AI employees for support, implementation, and marketing—or the ability to 
                create custom ones—teams can get started quickly. The AI concierges learn from your knowledge 
                base, answer questions with source citations, and can be extended with custom workflows. 
                The result: teams that work smarter, respond faster, and maintain consistency at scale.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        id="features" 
        className="landing-features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
      >
        <div className="features-container">
          <motion.h2 
            className="features-title"
            variants={fadeInUp}
          >
            Meet Your AI Team
          </motion.h2>
          <motion.div 
            className="features-grid"
            variants={staggerContainer}
          >
            {allEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <ProfileCard
                  name={employee.name}
                  title={employee.role}
                  role={employee.role}
                  handle={employee.id}
                  status="Online"
                  contactText="Select Employee"
                  icon={employee.icon}
                  color={employee.color}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={false}
                  onContactClick={() => navigate('/login')}
                />
              </motion.div>
            ))}
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        id="how-it-works" 
        className="landing-steps"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
      >
        <div className="steps-container">
          <motion.h2 
            className="steps-title"
            variants={fadeInUp}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="steps-subtitle"
            variants={fadeInUp}
          >
            Get started with your AI team in just a few simple steps
          </motion.p>
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
          <motion.div 
            className="steps-cta"
            variants={fadeInUp}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/login" className="steps-cta-button">
                Get Started Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        id="skills" 
        className="landing-powerful-features" 
        data-tour-target="skills-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
      >
        <div className="powerful-features-container">
          <motion.div 
            className="powerful-features-header"
            variants={staggerContainer}
          >
            <motion.h2 
              className="powerful-features-title"
              variants={fadeInUp}
            >
              Powerful Skillsets
            </motion.h2>
            <motion.p 
              className="powerful-features-subtitle"
              variants={fadeInUp}
            >
              Equip your AI team with advanced capabilities for research, note-taking, and seamless integrations
            </motion.p>
          </motion.div>
          
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

                <div className="powerful-feature-card workflow-feature">
                  <div className="powerful-feature-icon-wrapper">
                    <div className="powerful-feature-icon">⚙️</div>
                    <div className="powerful-feature-badge">POWERFUL</div>
                  </div>
                  <h3 className="powerful-feature-name">Infinite Building Capabilities</h3>
                  <p className="powerful-feature-tagline">Create Your Own Workflows</p>
                  <p className="powerful-feature-description">
                    Build unlimited custom workflows tailored to your specific needs. Design automated processes, 
                    create custom integrations, and extend your AI team's capabilities without limits. From simple 
                    task automation to complex multi-step workflows, the power to build is in your hands.
                  </p>
                  <div className="powerful-feature-benefits">
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🔧</span>
                      <span>Build custom workflows</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🔗</span>
                      <span>Connect any tool or service</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">♾️</span>
                      <span>Unlimited possibilities</span>
                    </div>
                    <div className="powerful-feature-benefit">
                      <span className="benefit-icon">🚀</span>
                      <span>Scale your automation</span>
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

            <div className="powerful-feature-card workflow-feature">
              <div className="powerful-feature-icon-wrapper">
                <div className="powerful-feature-icon">⚙️</div>
                <div className="powerful-feature-badge">POWERFUL</div>
              </div>
              <h3 className="powerful-feature-name">Infinite Building Capabilities</h3>
              <p className="powerful-feature-tagline">Create Your Own Workflows</p>
              <p className="powerful-feature-description">
                Build unlimited custom workflows tailored to your specific needs. Design automated processes, 
                create custom integrations, and extend your AI team's capabilities without limits. From simple 
                task automation to complex multi-step workflows, the power to build is in your hands.
              </p>
              <div className="powerful-feature-benefits">
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🔧</span>
                  <span>Build custom workflows</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🔗</span>
                  <span>Connect any tool or service</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">♾️</span>
                  <span>Unlimited possibilities</span>
                </div>
                <div className="powerful-feature-benefit">
                  <span className="benefit-icon">🚀</span>
                  <span>Scale your automation</span>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="landing-benefits"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="benefits-container">
          <motion.h2 
            className="benefits-title"
            variants={fadeInUp}
          >
            Stop juggling. Start scaling.
          </motion.h2>
          <motion.div 
            className="benefits-grid"
            variants={staggerContainer}
          >
            <motion.div 
              className="benefit-item"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3>Automate Your Workflow</h3>
              <p>Let AI handle repetitive tasks so you can focus on what matters</p>
            </motion.div>
            <motion.div 
              className="benefit-item"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3>24/7 Availability</h3>
              <p>Your AI team never sleeps, ensuring continuous support and operations</p>
            </motion.div>
            <motion.div 
              className="benefit-item"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3>Customizable & Scalable</h3>
              <p>Train and configure your AI employees to match your exact needs</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2025 AI Concierges. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

