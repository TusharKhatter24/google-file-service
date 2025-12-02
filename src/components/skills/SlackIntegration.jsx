import React, { useState } from 'react';
import './SkillsShared.css';

function SlackIntegration({ employeeName, employeeId }) {
  const [selectedChannel, setSelectedChannel] = useState(null);

  const channels = [
    { id: 1, name: '#general', unread: 12 },
    { id: 2, name: '#engineering', unread: 5 },
    { id: 3, name: '#support', unread: 23 }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Slack Integration</h2>
        <p>{employeeName} can monitor and respond to Slack messages</p>
      </div>

      <div className="integration-status">
        <div className="status-indicator">
          <span className="status-dot status-inactive"></span>
          <span>Not Connected</span>
        </div>
        <button className="btn-connect" disabled>
          Connect Slack Workspace
        </button>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>Auto-Reply</h3>
          <p>AI-powered responses to common questions</p>
          <button className="btn-feature" disabled>Configure</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👀</div>
          <h3>Channel Monitoring</h3>
          <p>Monitor specific channels for keywords</p>
          <button className="btn-feature" disabled>Set Up</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Message Analytics</h3>
          <p>Track response times and engagement</p>
          <button className="btn-feature" disabled>View Stats</button>
        </div>
      </div>

      <div className="channels-preview">
        <h3>Channels (Preview)</h3>
        <div className="channels-list">
          {channels.map(channel => (
            <div key={channel.id} className="channel-item">
              <span className="channel-name">{channel.name}</span>
              <span className="unread-badge">{channel.unread} unread</span>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Connect your Slack workspace to enable this feature
        </p>
      </div>
    </div>
  );
}

export default SlackIntegration;

