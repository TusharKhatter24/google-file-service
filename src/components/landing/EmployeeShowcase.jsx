import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { employees } from '../../data/employees';
import ScrollAnimation from './ScrollAnimation';
import CustomBuilderCard from './CustomBuilderCard';
import './EmployeeShowcase.css';

// Specific employees to showcase (only 3)
const showcaseEmployees = [
  {
    id: 'donna',
    name: 'Donna',
    role: 'AI Support Engineer',
    description: 'Fast, accurate frontline support specialist who resolves customer issues instantly.',
    icon: '🦸‍♀️💬',
  },
  {
    id: 'marketer',
    name: 'Maya',
    role: 'AI Marketing Strategist',
    description: 'Creates campaigns, content, and brand messaging that drives engagement.',
    icon: '🦸📢',
  },
  {
    id: 'integration',
    name: 'Iris',
    role: 'AI Integration Engineer',
    description: 'Connects APIs, tools, and workflows—keeping your systems perfectly in sync.',
    icon: '🦸‍♂️🔌',
  },
];

function EmployeeShowcase() {
  return (
    <section id="ai-employees" className="employee-showcase-section">
      <div className="employee-showcase-container">
        <ScrollAnimation>
          <div className="showcase-header">
            <h2 className="section-title">Meet Your AI Team</h2>
            <p className="section-subtitle">
              Specialized AI employees ready to join your workflow.
            </p>
          </div>
        </ScrollAnimation>

        <div className="employees-grid">
          {showcaseEmployees.map((employee, index) => (
            <ScrollAnimation key={employee.id} style={{ transitionDelay: `${index * 0.05}s` }}>
              <div className={`employee-showcase-card ${index === 0 ? 'recommended' : ''}`}>
                {index === 0 && (
                  <div className="recommended-badge">Recommended for You</div>
                )}
                <div className="employee-avatar-wrapper">
                  <div className="employee-avatar">{employee.icon}</div>
                </div>
                <h3 className="employee-name">{employee.name}</h3>
                <p className="employee-role">{employee.role}</p>
                <p className="employee-description">{employee.description}</p>
                <Link to={`/employees/${employee.id}`} className="employee-cta">
                  See Details
                </Link>
              </div>
            </ScrollAnimation>
          ))}
          
          <ScrollAnimation style={{ transitionDelay: '0.3s' }}>
            <CustomBuilderCard />
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}

export default EmployeeShowcase;
