import React from 'react';
import ScrollAnimation from './ScrollAnimation';
import './ValueProposition.css';

const valueProps = [
  {
    icon: '👤',
    title: 'Choose Your AI Employee',
    description: 'Select from pre-built AI employees or create custom ones for any department.',
  },
  {
    icon: '📚',
    title: 'Train With Your Knowledge',
    description: 'Upload files, connect tools, and teach your AI team your company\'s knowledge.',
  },
  {
    icon: '⚙️',
    title: 'Customize Behavior',
    description: 'Set tone, role, rules, and personality the way you want.',
  },
  {
    icon: '🎯',
    title: 'Add Skills',
    description: 'Give your AI team abilities like meeting assistance, CRM updates, task management.',
  },
];

function ValueProposition() {
  return (
    <section id="features" className="value-proposition-section">
      <div className="value-proposition-container">
        <ScrollAnimation>
          <h2 className="section-title">Your AI Team, Built for Real Work</h2>
        </ScrollAnimation>
        
        <div className="value-proposition-grid">
          {valueProps.map((prop, index) => (
            <ScrollAnimation key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
              <div className="value-prop-card">
                <div className="value-prop-icon">{prop.icon}</div>
                <h3 className="value-prop-title">{prop.title}</h3>
                <p className="value-prop-description">{prop.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValueProposition;

