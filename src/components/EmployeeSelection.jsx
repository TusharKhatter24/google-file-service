import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employees } from '../data/employees';
import { logout } from '../utils/auth';
import './EmployeeSelection.css';

function EmployeeSelection() {
  const navigate = useNavigate();
  const [customEmployees, setCustomEmployees] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    description: '',
    icon: '🦸',
    color: '#667eea'
  });

  // Load custom employees from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customEmployees');
    if (saved) {
      try {
        setCustomEmployees(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom employees:', e);
      }
    }
  }, []);

  // Save custom employees to localStorage whenever they change
  useEffect(() => {
    if (customEmployees.length > 0) {
      localStorage.setItem('customEmployees', JSON.stringify(customEmployees));
    }
  }, [customEmployees]);

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.role.trim()) {
      alert('Please fill in at least the name and role fields');
      return;
    }

    const customEmployee = {
      ...newEmployee,
      id: `custom-${Date.now()}`,
      isCustom: true
    };

    setCustomEmployees(prev => [...prev, customEmployee]);
    setShowCreateModal(false);
    setNewEmployee({
      name: '',
      role: '',
      description: '',
      icon: '🦸',
      color: '#667eea'
    });
  };

  const handleDeleteEmployee = (employeeId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this custom employee?')) {
      setCustomEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      // Also remove from localStorage
      const updated = customEmployees.filter(emp => emp.id !== employeeId);
      if (updated.length === 0) {
        localStorage.removeItem('customEmployees');
      } else {
        localStorage.setItem('customEmployees', JSON.stringify(updated));
      }
    }
  };

  const defaultEmployees = employees.filter(emp => emp.id !== 'custom');
  const allEmployees = [...defaultEmployees, ...customEmployees];

  const iconOptions = ['🦸', '🦸‍♀️', '🦸‍♂️', '👨‍💼', '👩‍💼', '🤖', '👾', '🌟', '⭐', '🔥', '💡', '🚀', '⚡', '💪', '🎯'];
  const colorOptions = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffecd2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

  return (
    <div className="employee-selection-page">
      <header className="selection-header">
        <div className="selection-nav">
          <h1 className="selection-title">AI Concierges</h1>
          <div className="selection-nav-actions">
            <button 
              onClick={() => navigate('/organization/settings')} 
              className="org-settings-button"
            >
              ⚙️ Organization Settings
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="selection-main">
        <div className="selection-container">
          <h2 className="page-title">Choose your employee</h2>
          <p className="page-subtitle">Select an AI employee to start working with</p>

          <div className="employees-grid">
            {allEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`employee-card ${employee.id === 'donna' ? 'default-selected' : ''}`}
                onClick={() => handleEmployeeClick(employee.id)}
                style={{ '--employee-color': employee.color }}
              >
                <div className="employee-icon-wrapper">
                  <div className="employee-icon">{employee.icon}</div>
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">{employee.name}</h3>
                  <p className="employee-role">{employee.role}</p>
                  <p className="employee-description">{employee.description}</p>
                </div>
                {employee.id === 'donna' && (
                  <div className="default-badge">Default</div>
                )}
                {employee.isCustom && (
                  <button
                    className="delete-employee-btn"
                    onClick={(e) => handleDeleteEmployee(employee.id, e)}
                    title="Delete employee"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {/* Create New Employee Card */}
            <div
              className="employee-card create-card"
              onClick={() => setShowCreateModal(true)}
              style={{ '--employee-color': '#9333ea' }}
            >
              <div className="employee-icon-wrapper">
                <div className="employee-icon create-icon">+</div>
              </div>
              <div className="employee-info">
                <h3 className="employee-name">Create Custom</h3>
                <p className="employee-role">Custom Employee</p>
                <p className="employee-description">Build your own AI employee tailored to your exact needs</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Custom Employee</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="employee-name">Name *</label>
                <input
                  id="employee-name"
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="e.g., Alex"
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="employee-role">Role *</label>
                <input
                  id="employee-role"
                  type="text"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  placeholder="e.g., AI Sales Manager"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="employee-description">Description</label>
                <textarea
                  id="employee-description"
                  value={newEmployee.description}
                  onChange={(e) => setNewEmployee({ ...newEmployee, description: e.target.value })}
                  placeholder="Describe what this employee does..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Icon</label>
                <div className="icon-selector">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${newEmployee.icon === icon ? 'selected' : ''}`}
                      onClick={() => setNewEmployee({ ...newEmployee, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Color Theme</label>
                <div className="color-selector">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newEmployee.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewEmployee({ ...newEmployee, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateEmployee}
              >
                Create Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeSelection;

