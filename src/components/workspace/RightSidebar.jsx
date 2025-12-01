import React from 'react';
import { useLocation } from 'react-router-dom';
import './RightSidebar.css';

function RightSidebar({ employee, employeeId, collapsed, onToggleCollapse }) {
  const location = useLocation();

  // Context-aware quick actions based on current page
  const getQuickActions = () => {
    const path = location.pathname;
    if (path.includes('knowledge-base')) {
      return [
        { label: 'Upload Document', icon: '📤', action: () => {} },
        { label: 'Create Folder', icon: '📁', action: () => {} },
      ];
    }
    if (path.includes('conversations')) {
      return [
        { label: 'New Conversation', icon: '➕', action: () => {} },
        { label: 'Clear History', icon: '🗑️', action: () => {} },
      ];
    }
    if (path.includes('skills')) {
      return [
        { label: 'Browse Marketplace', icon: '🛒', action: () => {} },
        { label: 'Install Skill', icon: '⚡', action: () => {} },
      ];
    }
    return [
      { label: 'Quick Start', icon: '🚀', action: () => {} },
      { label: 'Help', icon: '❓', action: () => {} },
    ];
  };

  const quickActions = getQuickActions();

  // Mock stats - in real app, these would come from props or API
  const stats = [
    { label: 'Total Conversations', value: '142', trend: '+12%' },
    { label: 'Documents', value: '28', trend: '+3' },
    { label: 'Active Skills', value: '8', trend: null },
    { label: 'Uptime', value: '99.9%', trend: null },
  ];

  if (collapsed) {
    return (
      <div className="right-sidebar collapsed">
        <button className="sidebar-toggle" onClick={onToggleCollapse}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <aside className="right-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Quick Actions</h3>
        <button className="sidebar-toggle" onClick={onToggleCollapse}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        <div className="quick-actions-section">
          <h4 className="section-title">Actions</h4>
          <div className="quick-actions-list">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={action.action}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h4 className="section-title">Stats</h4>
          <div className="stats-list">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                {stat.trend && (
                  <div className="stat-trend positive">{stat.trend}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity-section">
          <h4 className="section-title">Recent Activity</h4>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">💬</span>
              <div className="activity-content">
                <div className="activity-text">New conversation started</div>
                <div className="activity-time">2m ago</div>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📄</span>
              <div className="activity-content">
                <div className="activity-text">Document uploaded</div>
                <div className="activity-time">15m ago</div>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">⚙️</span>
              <div className="activity-content">
                <div className="activity-text">Settings updated</div>
                <div className="activity-time">1h ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;



