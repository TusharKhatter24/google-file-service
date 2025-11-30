import React, { useState } from 'react';

function CalendarManagement({ employeeName, employeeId }) {
  const [showScheduler, setShowScheduler] = useState(false);

  const todaysEvents = [
    { id: 1, title: 'Team Standup', time: '9:00 AM - 9:30 AM', type: 'Meeting' },
    { id: 2, title: 'Code Review', time: '11:00 AM - 12:00 PM', type: 'Focus Time' },
    { id: 3, title: 'Client Call', time: '2:00 PM - 3:00 PM', type: 'Meeting' }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Calendar Management</h2>
        <p>{employeeName} helps you manage your schedule efficiently</p>
      </div>

      <div className="integration-status">
        <div className="status-indicator">
          <span className="status-dot status-inactive"></span>
          <span>Not Connected</span>
        </div>
        <button className="btn-connect" disabled>
          Connect Calendar
        </button>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Smart Scheduling</h3>
          <p>Find optimal meeting times automatically</p>
          <button className="btn-feature" onClick={() => setShowScheduler(true)}>
            Schedule Meeting
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3>Rescheduling</h3>
          <p>AI-powered conflict resolution</p>
          <button className="btn-feature" disabled>Manage Conflicts</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⏰</div>
          <h3>Time Blocking</h3>
          <p>Protect your focus time</p>
          <button className="btn-feature" disabled>Set Blocks</button>
        </div>
      </div>

      <div className="calendar-preview">
        <h3>Today's Schedule</h3>
        <div className="events-list">
          {todaysEvents.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-time">{event.time}</div>
              <div className="event-info">
                <h4>{event.title}</h4>
                <span className="event-type-badge">{event.type}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Connect your calendar to see real events
        </p>
      </div>

      {showScheduler && (
        <div className="modal" onClick={() => setShowScheduler(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Meeting</h3>
              <button className="close-btn" onClick={() => setShowScheduler(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Meeting Title</label>
                <input type="text" placeholder="Enter meeting title..." />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <select>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              <div className="form-group">
                <label>Participants</label>
                <input type="text" placeholder="Enter email addresses..." />
              </div>
              <p className="placeholder-note">
                This feature will be available once you connect your calendar
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowScheduler(false)}>Cancel</button>
              <button className="btn-primary" disabled>Find Time Slots</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarManagement;

