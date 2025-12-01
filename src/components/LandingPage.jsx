import React from 'react';
import Navigation from './landing/Navigation';
import HeroSection from './landing/HeroSection';
import ValueProposition from './landing/ValueProposition';
import ProductPreview from './landing/ProductPreview';
import HowItWorks from './landing/HowItWorks';
import EmployeeShowcase from './landing/EmployeeShowcase';
import Integrations from './landing/Integrations';
import SocialProof from './landing/SocialProof';
import PricingTeaser from './landing/PricingTeaser';
import Footer from './landing/Footer';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <Navigation />
      <HeroSection />
      <ValueProposition />
      <ProductPreview />
      <HowItWorks />
      <EmployeeShowcase />
      <Integrations />
      <SocialProof />
      <PricingTeaser />
      <Footer />
    </div>
  );
}

export default LandingPage;
