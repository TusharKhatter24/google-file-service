import React, { useState } from 'react';

function EmailAssistant({ employeeName, employeeId }) {
  const [showCompose, setShowCompose] = useState(false);

  const emailTemplates = [
    { id: 1, name: 'Follow-up', usage: 45 },
    { id: 2, name: 'Meeting Request', usage: 32 },
    { id: 3, name: 'Thank You', usage: 28 }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Email Assistant</h2>
        <p>{employeeName} can help you draft and manage emails</p>
      </div>

      <div className="integration-status">
        <div className="status-indicator">
          <span className="status-dot status-inactive"></span>
          <span>Not Connected</span>
        </div>
        <button className="btn-connect" disabled>
          Connect Email Account
        </button>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">✉️</div>
          <h3>Smart Compose</h3>
          <p>AI-powered email drafting and replies</p>
          <button className="btn-feature" onClick={() => setShowCompose(true)}>
            Compose Email
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📥</div>
          <h3>Inbox Management</h3>
          <p>Organize and prioritize your emails</p>
          <button className="btn-feature" disabled>View Inbox</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⏰</div>
          <h3>Scheduled Sending</h3>
          <p>Schedule emails for optimal timing</p>
          <button className="btn-feature" disabled>Schedule</button>
        </div>
      </div>

      <div className="templates-section">
        <h3>Email Templates</h3>
        <div className="templates-list">
          {emailTemplates.map(template => (
            <div key={template.id} className="template-item">
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>Used {template.usage} times</p>
              </div>
              <button className="btn-use-template" disabled>
                Use Template
              </button>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Connect your email account to access templates
        </p>
      </div>

      {showCompose && (
        <div className="modal" onClick={() => setShowCompose(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Compose Email</h3>
              <button className="close-btn" onClick={() => setShowCompose(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="placeholder-note">
                This feature will be available once you connect your email account
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailAssistant;

