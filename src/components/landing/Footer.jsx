import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-links">
              <li><Link to="#features">Features</Link></li>
              <li><Link to="#ai-employees">AI Employees</Link></li>
              <li><Link to="#pricing">Pricing</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><a href="#docs">Docs</a></li>
              <li><a href="#api">API</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          <div className="footer-section footer-cta-section">
            <h4 className="footer-title">Get Started</h4>
            <p className="footer-cta-text">
              Create your first AI employee today
            </p>
            <Link to="/login" className="footer-cta-button">
              Create Your First AI Employee
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2025 AI Employees. All rights reserved.</p>
          </div>
          <div className="footer-legal">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Twitter">🐦</a>
            <a href="#" className="social-icon" aria-label="LinkedIn">💼</a>
            <a href="#" className="social-icon" aria-label="GitHub">💻</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

