import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { employees } from '../data/employees';
import { useTheme } from '../contexts/ThemeContext';
import ProfileCard from './ProfileCard';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import FeatureSection from './FeatureSection';
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

// New cool animation variants
const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const rotateIn = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5 },
  visible: { 
    opacity: 1, 
    rotate: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const bounceIn = {
  hidden: { opacity: 0, y: -50, scale: 0.3 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6,
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const rotateAnimation = {
  animate: {
    rotate: [0, 360],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [allEmployees, setAllEmployees] = useState(employees);
  const stepsRailRef = useRef(null);
  const powerfulFeaturesRailRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Don't load custom employees on landing page - only show default employees
    setAllEmployees(employees);
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
              Why We Built This
            </motion.button>
          </nav>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* <motion.button 
              onClick={toggleTheme} 
              className="theme-toggle-landing"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </motion.button> */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            <Link to="/login" className="landing-login-btn">Log In</Link>
            </motion.div>
          </div>
        </div>
      </header>

      <motion.section 
        className="landing-hero"
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
      >
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
          <motion.div 
            className="hero-shape hero-shape-1"
            {...floatAnimation}
          ></motion.div>
          <motion.div 
            className="hero-shape hero-shape-2"
            {...floatAnimation}
            transition={{ delay: 0.5 }}
          ></motion.div>
          <motion.div 
            className="hero-shape hero-shape-3"
            {...floatAnimation}
            transition={{ delay: 1 }}
          ></motion.div>
          <motion.div 
            className="hero-shape hero-shape-4"
            {...floatAnimation}
            transition={{ delay: 1.5 }}
          ></motion.div>
          <motion.div 
            className="hero-shape hero-shape-5"
            {...floatAnimation}
            transition={{ delay: 0.3 }}
          ></motion.div>
          <motion.div 
            className="hero-shape hero-shape-6"
            {...pulseAnimation}
          ></motion.div>
          <motion.div 
            className="hero-shape hero-shape-7"
            {...floatAnimation}
            transition={{ delay: 0.8 }}
          ></motion.div>
        </div>
        <div className="hero-sliding-elements">
          <div className="hero-slide-element slide-left-1"></div>
          <div className="hero-slide-element slide-right-1"></div>
          <div className="hero-slide-element slide-left-2"></div>
          <div className="hero-slide-element slide-right-2"></div>
        </div>
        <motion.div 
          className="hero-rotating-elements"
          {...rotateAnimation}
        >
          <div className="hero-rotate-element rotate-1"></div>
          <div className="hero-rotate-element rotate-2"></div>
        </motion.div>
        <div className="hero-particles">
          {[...Array(60)].map((_, i) => (
            <motion.div 
              key={i} 
              className={`hero-particle particle-${i + 1}`}
              animate={{
                y: [0, -50, 0],
                x: [0, Math.sin(i) * 30, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.5, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 4 + (i % 4),
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut"
              }}
            ></motion.div>
          ))}
        </div>
        <div className="hero-sparkles">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className={`hero-sparkle sparkle-${i + 1}`}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2 + (i % 2),
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            ></motion.div>
          ))}
        </div>
        <div className="hero-video-background">
          <video 
            className="hero-background-video" 
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="https://d1oil5daeuar1j.cloudfront.net/vizzy_waving.mp4" type="video/mp4" />
            <source src="https://d1oil5daeuar1j.cloudfront.net/vizzy_waving.webm" type="video/webm" />
          </video>
          <div className="hero-video-overlay"></div>
        </div>

        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="hero-title"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {["AI", "Employees:", "Always", "Working,", "Always", "Ready"].map((word, i) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block', marginRight: '0.3em' }}
                variants={{
                  hidden: { opacity: 0, y: 50, rotateX: -90 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    rotateX: 0,
                    transition: {
                      duration: 0.5,
                      ease: [0.6, -0.05, 0.01, 0.99]
                    }
                  }
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            variants={fadeInUp}
          >
            Build, grow, and scale your business with a team of AI employees.
          </motion.p>
          <motion.div variants={scaleIn}>
            <motion.div
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                rotate: [0, -1, 1, -1, 0],
                transition: { duration: 0.5 }
              }}
              whileTap={{ scale: 0.95 }}
            >
          <Link to="/login" className="hero-cta">
                <motion.span
                  animate={{
                    x: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
            Get AI Concierges
                </motion.span>
          </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

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
            Why We Built This
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
              <ul className="our-story-bullets">
                <li className="our-story-bullet-item">
                  Knowledge scattered across documents, tickets, and conversations
                </li>
                <li className="our-story-bullet-item">
                  Finding accurate answers quickly becomes difficult
                </li>
                <li className="our-story-bullet-item">
                  Slows down responses and impacts team efficiency
                </li>
              </ul>
            </motion.div>
            <motion.div 
              className="our-story-solution"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <h3 className="our-story-subtitle">Our Solution</h3>
              <ul className="our-story-bullets">
                <li className="our-story-bullet-item">
                  Instant access to your knowledge base through AI employees
                </li>
                <li className="our-story-bullet-item">
                  Build custom AI team members with specialized skills
                </li>
                <li className="our-story-bullet-item">
                  Get accurate, contextual responses powered by your company's information
                </li>
              </ul>
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
          <motion.div
            variants={fadeInUp}
          >
            <h2 className="features-title">
              Meet Your AI Team
            </h2>
            <p className="features-subtitle">
              Your new team with infinite knowledge. AI for business has never been this personal—meet your new team, working hard so you don't have to.
            </p>
          </motion.div>
          <motion.div 
            className="features-grid"
            variants={staggerContainer}
          >
            {allEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                variants={staggerItem}
                className="employee-showcase-card"
                whileHover={{ 
                  y: -12,
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, rotateY: -15 }}
                whileInView={{ 
                  opacity: 1, 
                  rotateY: 0,
                  transition: { 
                    duration: 0.6,
                    delay: index * 0.1
                  }
                }}
                viewport={{ once: true }}
                style={{ 
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="employee-showcase-content">
                  <div className="employee-showcase-header">
                    <div className="employee-showcase-icon" style={{ background: `${employee.color}20` }}>
                      <span style={{ fontSize: '3rem' }}>{employee.icon}</span>
                    </div>
                    <div>
                      <h3 className="employee-showcase-name">{employee.name}</h3>
                      <p className="employee-showcase-role">{employee.role}</p>
                    </div>
                  </div>
                  <p className="employee-showcase-description">{employee.description}</p>
                  <Link 
                    to="/login" 
                    className="employee-showcase-button"
                    style={{ borderColor: employee.color, color: employee.color }}
                  >
                    Learn More →
                  </Link>
                </div>
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

      {/* Automates Work Section */}
      <FeatureSection
        title="Automates work. Even while you sleep."
        subtitle="Automate tasks with business automation tools—create social media posts, respond to comments, and more—freeing your team from repetitive tasks so they can focus on more strategic work."
        features={[
          {
            icon: '📱',
            title: 'Soshie, schedule social media posts for me',
            description: 'Automate your social media game with AI for marketing. Write, create, and post content effortlessly with AI-powered solutions.'
          },
          {
            icon: '💬',
            title: 'Cassie, check my Facebook comments',
            description: 'Engage your audience with business automation tools. Use AI for customer support to analyze comments and craft personalized responses.'
          },
          {
            icon: '📅',
            title: 'Vizzy, help me prepare for today\'s meetings',
            description: 'Boost productivity with AI. Streamline business processes with daily summaries based on your email and calendar to keep your schedule on track.'
          }
        ]}
        backgroundColor="var(--color-surface-elevated, #FFFFFF)"
      />

      {/* 24/7 Availability Section */}
      <FeatureSection
        title="A co-worker who's always on the clock."
        subtitle="Available 24/7. AI tools are always on and available around the clock to support your business. The only helpers who love overtime. Always ready to save your most valuable asset—your time."
        features={[
          {
            icon: '🌍',
            title: 'Speaks in 100+ languages',
            description: 'Go global—select, communicate, and complete your work in over 100 languages.'
          },
          {
            icon: '⏰',
            title: 'Never sleeps',
            description: 'Your AI team works around the clock, ensuring continuous support and operations.'
          },
          {
            icon: '⚡',
            title: 'Instant responses',
            description: 'Get immediate answers and assistance whenever you need it, day or night.'
          }
        ]}
        backgroundColor="var(--color-background, #FAFAFA)"
      />

      {/* Learning Section */}
      <FeatureSection
        title="They learn your business. Just like real helpers."
        subtitle="Answer questions about your brand, add files, instructions, and your website for more unique results. The more information they have, the better the outcome. AI employees are designed to complement and enhance your human capabilities by handling routine tasks, allowing you to focus on higher-level and creative work."
        features={[
          {
            icon: '📈',
            title: 'Improves over time',
            description: 'AI employees learn from interactions and continuously improve their responses and capabilities.'
          },
          {
            icon: '💾',
            title: 'Remembers files, websites, facts',
            description: 'Your AI team remembers important information, documents, and context to provide better assistance.'
          },
          {
            icon: '❓',
            title: 'Asks guided questions',
            description: 'AI employees ask thoughtful questions to better understand your needs and provide more accurate help.'
          }
        ]}
        backgroundColor="var(--color-surface-elevated, #FFFFFF)"
      />

      {/* Integrations Section */}
      <FeatureSection
        title="Integrates with your favorite tools."
        subtitle="Streamline business processes by bringing your favorite tools, systems, and AI employees together. AI for business makes working with integrations and existing systems easier than ever."
        features={[
          {
            icon: '🔗',
            title: 'Seamless integrations',
            description: 'Connect with Google Calendar, Notion, Slack, Jira, and many more popular tools.'
          },
          {
            icon: '🔄',
            title: 'Sync across platforms',
            description: 'Keep your data synchronized across all your business tools automatically.'
          },
          {
            icon: '⚙️',
            title: 'Easy setup',
            description: 'Get started with integrations in minutes with our simple setup process.'
          }
        ]}
        backgroundColor="var(--color-background, #FAFAFA)"
      />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2025 AI Concierges. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

