import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../../data/employees';
import { getEmployeeSkills } from '../../services/skillAssignmentService';
import { getEmployeeConfig } from '../../services/employeeConfigService';
import Card from '../Card';
import StatsCard from '../ui/StatsCard';
import Badge from '../ui/Badge';
import './OverviewPage.css';

const CHAT_STORAGE_PREFIX = 'chat_messages_';

function OverviewPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  const [stats, setStats] = useState({
    conversations: 0,
    documents: 0,
    skills: 0,
    lastActivity: null,
  });

  useEffect(() => {
    // Load conversation count
    try {
      const stored = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${employeeId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setStats(prev => ({ ...prev, conversations: parsed.length - 1 })); // Exclude default message
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }

    // Load skills count
    try {
      const assignment = getEmployeeSkills(employeeId);
      setStats(prev => ({ ...prev, skills: assignment.enabledSkills?.length || 0 }));
    } catch (error) {
      console.error('Error loading skills:', error);
    }

    // Load documents count (mock for now)
    setStats(prev => ({ ...prev, documents: 0 }));
  }, [employeeId]);

  const quickActions = [
    {
      title: 'Start Conversation',
      description: 'Chat with your AI employee',
      icon: '💬',
      action: () => navigate(`/employees/${employeeId}/conversations`),
      color: '#4f46e5',
    },
    {
      title: 'Upload Documents',
      description: 'Add knowledge to the base',
      icon: '📤',
      action: () => navigate(`/employees/${employeeId}/knowledge-base`),
      color: '#10b981',
    },
    {
      title: 'Manage Skills',
      description: 'Configure capabilities',
      icon: '🎯',
      action: () => navigate(`/employees/${employeeId}/skills`),
      color: '#f59e0b',
    },
    {
      title: 'View Settings',
      description: 'Customize configuration',
      icon: '⚙️',
      action: () => navigate(`/employees/${employeeId}/settings`),
      color: '#6366f1',
    },
  ];

  return (
    <div className="overview-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with {employee.name}.</p>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-grid">
          <StatsCard
            title="Total Conversations"
            value={stats.conversations}
            trend={{ positive: true, value: '+12%' }}
            icon="💬"
            description="This month"
          />
          <StatsCard
            title="Documents"
            value={stats.documents}
            trend={{ positive: true, value: '+3' }}
            icon="📚"
            description="In knowledge base"
          />
          <StatsCard
            title="Active Skills"
            value={stats.skills}
            icon="🎯"
            description="Enabled capabilities"
          />
          <StatsCard
            title="Uptime"
            value="99.9%"
            icon="⚡"
            description="Last 30 days"
          />
        </div>

        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="quick-action-card"
                hoverable
                onClick={action.action}
              >
                <div className="quick-action-icon" style={{ backgroundColor: `${action.color}15` }}>
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <div className="quick-action-content">
                  <h3 className="quick-action-title">{action.title}</h3>
                  <p className="quick-action-description">{action.description}</p>
                </div>
                <div className="quick-action-arrow">→</div>
              </Card>
            ))}
          </div>
        </div>

        <div className="recent-activity-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate(`/employees/${employeeId}/activity-log`)}
            >
              View All →
            </button>
          </div>
          <Card className="activity-card">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">💬</div>
                <div className="activity-content">
                  <div className="activity-text">Started a new conversation</div>
                  <div className="activity-time">2 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📄</div>
                <div className="activity-content">
                  <div className="activity-text">Document uploaded to knowledge base</div>
                  <div className="activity-time">15 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">⚙️</div>
                <div className="activity-content">
                  <div className="activity-text">Settings updated</div>
                  <div className="activity-time">1 hour ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;



