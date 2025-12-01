import React from 'react';
import ScrollAnimation from './ScrollAnimation';
import './Integrations.css';

const integrations = [
  {
    name: 'Slack',
    icon: '💬',
    description: 'Collaborate with your AI team where your conversations already happen.',
  },
  {
    name: 'Gmail',
    icon: '📧',
    description: 'Draft, analyze, and automate emails effortlessly.',
  },
  {
    name: 'HubSpot',
    icon: '🎯',
    description: 'Update CRM records and automate follow-ups.',
  },
  {
    name: 'Notion',
    icon: '📝',
    description: 'Search, summarize, and write across your workspace.',
  },
  {
    name: 'Zendesk',
    icon: '🎫',
    description: 'Resolve tickets faster with AI-powered context.',
  },
  {
    name: 'Google Drive',
    icon: '📁',
    description: 'Train your AI using the documents you already store.',
  },
  {
    name: 'Jira',
    icon: '🔧',
    description: 'Generate updates, track issues, and automate workflows.',
  },
  {
    name: 'Confluence',
    icon: '📖',
    description: 'Build and maintain your knowledge base automatically.',
  },
];

function Integrations() {
  return (
    <section className="integrations-section">
      <div className="integrations-container">
        <ScrollAnimation>
          <div className="integrations-header">
            <h2 className="section-title">Connected With the Tools You Already Use</h2>
            <p className="section-subtitle">
              Integrate your AI employees seamlessly with your existing workflows.
            </p>
          </div>
        </ScrollAnimation>
        
        <div className="integrations-grid">
          {integrations.map((integration, index) => (
            <ScrollAnimation key={index} style={{ transitionDelay: `${index * 0.05}s` }}>
              <div className="integration-card">
                <div className="integration-icon-container">
                  <div className="integration-icon">{integration.icon}</div>
                </div>
                <h3 className="integration-name">{integration.name}</h3>
                <p className="integration-description">{integration.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Integrations;
