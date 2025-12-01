import React from 'react';
import ScrollAnimation from './ScrollAnimation';
import './HowItWorks.css';

const steps = [
  {
    number: 1,
    icon: '👤',
    label: 'Step 1',
    title: 'Choose Your AI Employee',
    description: 'Pick from ready-made AI employees or build a custom one for any role.',
  },
  {
    number: 2,
    icon: '📚',
    label: 'Step 2',
    title: 'Build the Knowledge Base',
    description: 'Upload documents, connect tools, and train your AI with your company\'s expertise.',
  },
  {
    number: 3,
    icon: '⚙️',
    label: 'Step 3',
    title: 'Customize Intelligence',
    description: 'Define personality, tone, rules, and model settings to match your workflow.',
  },
  {
    number: 4,
    icon: '💬',
    label: 'Step 4',
    title: 'Collaborate in Real Time',
    description: 'Chat, delegate tasks, and solve problems together—like a real teammate.',
  },
  {
    number: 5,
    icon: '🎯',
    label: 'Step 5',
    title: 'Add Skills & Automations',
    description: 'Supercharge your AI employees with meeting assistance, tasks, integrations, and more.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="how-it-works-container">
        <ScrollAnimation>
          <h2 className="section-title">How It Works</h2>
        </ScrollAnimation>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <ScrollAnimation key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="step-item">
                <div className="step-connector"></div>
                <div className="step-content">
                  <div className="step-icon-container">
                    <div className="step-icon">{step.icon}</div>
                  </div>
                  <div className="step-label">{step.label}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

