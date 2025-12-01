import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeById } from '../../data/employees';
import Card from '../Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import './ActivityLogPage.css';

const CHAT_STORAGE_PREFIX = 'chat_messages_';

function ActivityLogPage() {
  const { employeeId } = useParams();
  const employee = getEmployeeById(employeeId);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'conversations', 'uploads', 'skills', 'settings'

  useEffect(() => {
    loadActivities();
  }, [employeeId, filter]);

  const loadActivities = () => {
    const loadedActivities = [];

    // Load conversation activities
    if (filter === 'all' || filter === 'conversations') {
      try {
        const stored = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${employeeId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.length > 1) {
            parsed.slice(1).forEach((msg, index) => {
              loadedActivities.push({
                id: `conv-${msg.id}`,
                type: 'conversation',
                title: msg.sender === 'user' ? 'User message sent' : 'AI response generated',
                description: msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''),
                timestamp: new Date(msg.timestamp),
                icon: '💬',
              });
            });
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }

    // Mock other activities (in real app, these would come from a proper activity log service)
    if (filter === 'all' || filter === 'uploads') {
      loadedActivities.push({
        id: 'upload-1',
        type: 'upload',
        title: 'Document uploaded',
        description: 'document.pdf added to knowledge base',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        icon: '📄',
      });
    }

    if (filter === 'all' || filter === 'skills') {
      loadedActivities.push({
        id: 'skill-1',
        type: 'skill',
        title: 'Skill enabled',
        description: 'Meeting Assistant skill activated',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: '🎯',
      });
    }

    if (filter === 'all' || filter === 'settings') {
      loadedActivities.push({
        id: 'settings-1',
        type: 'settings',
        title: 'Settings updated',
        description: 'System prompt modified',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: '⚙️',
      });
    }

    // Sort by timestamp (newest first)
    loadedActivities.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(loadedActivities);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getActivityBadgeVariant = (type) => {
    switch (type) {
      case 'conversation':
        return 'primary';
      case 'upload':
        return 'success';
      case 'skill':
        return 'warning';
      case 'settings':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filters = [
    { id: 'all', label: 'All Activities' },
    { id: 'conversations', label: 'Conversations' },
    { id: 'uploads', label: 'Uploads' },
    { id: 'skills', label: 'Skills' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="activity-log-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">Track all activities and changes for {employee.name}.</p>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <div className="filters-list">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                className={`filter-btn ${filter === filterOption.id ? 'active' : ''}`}
                onClick={() => setFilter(filterOption.id)}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No activities found"
            description={`No ${filter === 'all' ? '' : filter + ' '}activities recorded yet.`}
          />
        ) : (
          <div className="activities-timeline">
            {activities.map((activity) => (
              <Card key={activity.id} className="activity-item">
                <div className="activity-icon-wrapper">
                  <div className="activity-icon">{activity.icon}</div>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <h3 className="activity-title">{activity.title}</h3>
                    <Badge variant={getActivityBadgeVariant(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-footer">
                    <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                    <span className="activity-date">
                      {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogPage;

