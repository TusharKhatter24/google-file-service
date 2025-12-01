import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={`landing-navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">AI Employees</Link>
        </div>
        
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollToSection('features')}>
            Features
          </button>
          <button className="nav-link" onClick={() => scrollToSection('how-it-works')}>
            How It Works
          </button>
          <button className="nav-link" onClick={() => scrollToSection('ai-employees')}>
            AI Employees
          </button>
          <button className="nav-link" onClick={() => scrollToSection('pricing')}>
            Pricing
          </button>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="nav-btn-secondary">Log In</Link>
          <Link to="/login" className="nav-btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;



