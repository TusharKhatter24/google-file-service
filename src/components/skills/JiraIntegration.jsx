import React, { useState } from 'react';

function JiraIntegration({ employeeName, employeeId }) {
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const recentTickets = [
    { id: 'PROJ-123', title: 'Fix login bug', status: 'In Progress', priority: 'High' },
    { id: 'PROJ-124', title: 'Update documentation', status: 'To Do', priority: 'Medium' },
    { id: 'PROJ-125', title: 'Performance optimization', status: 'Review', priority: 'Low' }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Jira Integration</h2>
        <p>{employeeName} can create and manage Jira tickets</p>
      </div>

      <div className="integration-status">
        <div className="status-indicator">
          <span className="status-dot status-inactive"></span>
          <span>Not Connected</span>
        </div>
        <button className="btn-connect" disabled>
          Connect Jira Workspace
        </button>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎫</div>
          <h3>Create Tickets</h3>
          <p>Create tickets from conversations or notes</p>
          <button className="btn-feature" onClick={() => setShowCreateTicket(true)}>
            Create Ticket
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3>Status Updates</h3>
          <p>Automatic status updates and transitions</p>
          <button className="btn-feature" disabled>Configure</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>Sprint Analytics</h3>
          <p>Track sprint progress and velocity</p>
          <button className="btn-feature" disabled>View Reports</button>
        </div>
      </div>

      <div className="tickets-preview">
        <h3>Recent Tickets (Preview)</h3>
        <div className="tickets-list">
          {recentTickets.map(ticket => (
            <div key={ticket.id} className="ticket-item">
              <div className="ticket-info">
                <span className="ticket-id">{ticket.id}</span>
                <span className="ticket-title">{ticket.title}</span>
              </div>
              <div className="ticket-meta">
                <span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                  {ticket.status}
                </span>
                <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Connect your Jira workspace to manage real tickets
        </p>
      </div>

      {showCreateTicket && (
        <div className="modal" onClick={() => setShowCreateTicket(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Jira Ticket</h3>
              <button className="close-btn" onClick={() => setShowCreateTicket(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="placeholder-note">
                This feature will be available once you connect your Jira workspace
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JiraIntegration;

