import React from 'react';
import './PreviewModal.css';

function PreviewModal({ employee, onSelect, onClose }) {
  if (!employee) return null;

  const skillBadges = employee.skills || ['Knowledgeable', 'Fast', 'Multilingual', 'Domain Expert'];
  const capabilities = employee.capabilities || [
    'Customer support and troubleshooting',
    'Technical issue resolution',
    'Product knowledge assistance',
    'Documentation and guidance'
  ];

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div className="preview-header-content">
            <div className="preview-avatar" style={{ backgroundColor: `${employee.color}15` }}>
              <span className="preview-icon">{employee.icon}</span>
            </div>
            <div>
              <h2 className="preview-name">{employee.name}</h2>
              <p className="preview-role">{employee.role}</p>
            </div>
          </div>
          <button className="preview-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="preview-modal-body">
          <div className="preview-section">
            <h3 className="preview-section-title">Role Overview</h3>
            <p className="preview-description">{employee.description}</p>
            <div className="preview-capabilities">
              <h4 className="preview-capabilities-title">Key Capabilities:</h4>
              <ul className="preview-capabilities-list">
                {capabilities.map((capability, index) => (
                  <li key={index}>{capability}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="preview-section">
            <h3 className="preview-section-title">Skills</h3>
            <div className="preview-skills">
              {skillBadges.map((skill, index) => (
                <span key={index} className="preview-skill-badge">{skill}</span>
              ))}
            </div>
          </div>

          <div className="preview-section">
            <h3 className="preview-section-title">Sample Conversation</h3>
            <div className="preview-conversation">
              <div className="conversation-message user">
                <div className="message-avatar">👤</div>
                <div className="message-content">
                  <div className="message-author">You</div>
                  <div className="message-text">How can you help me with customer support?</div>
                </div>
              </div>
              <div className="conversation-message ai">
                <div className="message-avatar">{employee.icon}</div>
                <div className="message-content">
                  <div className="message-author">{employee.name}</div>
                  <div className="message-text">
                    I can help you with customer inquiries, troubleshoot technical issues, 
                    provide product information, and guide users through our documentation. 
                    What specific support do you need?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-modal-footer">
          <button className="preview-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="preview-btn-primary" onClick={() => onSelect(employee.id)}>
            Select Employee
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;

