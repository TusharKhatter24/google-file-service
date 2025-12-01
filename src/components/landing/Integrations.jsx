import React from 'react';
import ScrollAnimation from './ScrollAnimation';
import './Integrations.css';

const integrations = [
  { name: 'Slack', logo: '💬' },
  { name: 'Gmail', logo: '📧' },
  { name: 'HubSpot', logo: '🎯' },
  { name: 'Notion', logo: '📝' },
  { name: 'Zendesk', logo: '🎫' },
  { name: 'Google Drive', logo: '📁' },
  { name: 'Jira', logo: '🔧' },
  { name: 'Confluence', logo: '📖' },
];

function Integrations() {
  return (
    <section className="integrations-section">
      <div className="integrations-container">
        <ScrollAnimation>
          <h2 className="section-title">Connected With Tools You Already Use</h2>
          <p className="section-subtitle">
            Seamlessly integrate with your existing workflow and tools
          </p>
        </ScrollAnimation>
        
        <div className="integrations-grid">
          {integrations.map((integration, index) => (
            <ScrollAnimation key={index} style={{ transitionDelay: `${index * 0.05}s` }}>
              <div className="integration-logo">
                <div className="logo-icon">{integration.logo}</div>
                <div className="logo-name">{integration.name}</div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Integrations;

