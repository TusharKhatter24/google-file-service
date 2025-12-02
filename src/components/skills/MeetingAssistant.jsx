import React, { useState } from 'react';
import './SkillsShared.css';

function MeetingAssistant({ employeeName, employeeId }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const upcomingMeetings = [
    { id: 1, title: 'Team Standup', time: '10:00 AM', participants: 5, platform: 'Zoom' },
    { id: 2, title: 'Client Review', time: '2:00 PM', participants: 8, platform: 'Google Meet' },
    { id: 3, title: 'Planning Session', time: '4:00 PM', participants: 3, platform: 'Teams' }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Meeting Assistant</h2>
        <p>{employeeName} can help you manage and attend meetings</p>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎥</div>
          <h3>Join Meetings</h3>
          <p>Let your AI join meetings and take notes for you</p>
          <button className="btn-feature" disabled>Coming Soon</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Meeting Notes</h3>
          <p>Automatic transcription and summarization</p>
          <button className="btn-feature" disabled>Coming Soon</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔔</div>
          <h3>Meeting Reminders</h3>
          <p>Get reminded before important meetings</p>
          <button className="btn-feature" disabled>Coming Soon</button>
        </div>
      </div>

      <div className="upcoming-meetings-section">
        <h3>Upcoming Meetings</h3>
        <div className="meetings-list">
          {upcomingMeetings.map(meeting => (
            <div key={meeting.id} className="meeting-item">
              <div className="meeting-info">
                <h4>{meeting.title}</h4>
                <p>{meeting.time} • {meeting.participants} participants • {meeting.platform}</p>
              </div>
              <button className="btn-join-meeting" disabled>
                Join with AI
              </button>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Connect your calendar to see real meetings
        </p>
      </div>
    </div>
  );
}

export default MeetingAssistant;

