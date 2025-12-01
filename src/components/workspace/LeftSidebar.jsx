import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import './LeftSidebar.css';

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: '📊', path: 'overview' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: '📚', path: 'knowledge-base' },
  { id: 'conversations', label: 'Conversations', icon: '💬', path: 'conversations' },
  { id: 'notes', label: 'Notes', icon: '📝', path: 'notes' },
  { id: 'skills', label: 'Skills', icon: '🎯', path: 'skills' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: 'settings' },
  { id: 'activity-log', label: 'Activity Log', icon: '📋', path: 'activity-log' },
  { id: 'integrations', label: 'Integrations', icon: '🔌', path: 'integrations' },
];

function LeftSidebar({ employee, employeeId }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToEmployees = () => {
    navigate('/employees');
  };

  return (
    <aside className="left-sidebar">
      <div className="sidebar-header">
        <button 
          className="back-to-employees-btn"
          onClick={handleBackToEmployees}
          title="Back to Employees"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="employee-header">
          <div className="employee-avatar">{employee.icon}</div>
          <div className="employee-info">
            <h3 className="employee-name">{employee.name}</h3>
            <p className="employee-role">{employee.role}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/employees/${employeeId}/${item.path}`}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default LeftSidebar;

