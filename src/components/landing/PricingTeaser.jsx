import React from 'react';
import { Link } from 'react-router-dom';
import ScrollAnimation from './ScrollAnimation';
import './PricingTeaser.css';

function PricingTeaser() {
  return (
    <section id="pricing" className="pricing-teaser-section">
      <div className="pricing-teaser-container">
        <ScrollAnimation>
          <h2 className="pricing-title">Start Free. No Credit Card Required.</h2>
          <p className="pricing-subtitle">
            Build and deploy your AI employees today. Upgrade when you're ready to scale.
          </p>
          <Link to="/login" className="pricing-cta">
            View Pricing
          </Link>
        </ScrollAnimation>
      </div>
    </section>
  );
}

export default PricingTeaser;

