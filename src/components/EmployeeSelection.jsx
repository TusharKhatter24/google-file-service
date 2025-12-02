import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employees } from '../data/employees';
import { logout } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import GuidedTour from './GuidedTour';
import { employeeSelectionTour } from '../data/tourSteps';
import ProfileCard from './ProfileCard';
import './EmployeeSelection.css';

function EmployeeSelection() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [customEmployees, setCustomEmployees] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    description: '',
    icon: '🦸',
    color: '#667eea'
  });
  const [showTour, setShowTour] = useState(false);

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

  // Auto-start tour on page load (only if not completed before)
  useEffect(() => {
    // Check if tour was already completed
    const tourCompleted = localStorage.getItem('tour_completed_employee-selection');
    if (tourCompleted === 'true') {
      // Tour was already completed, don't show it
      return;
    }
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/')}
              className="home-icon-button"
              title="Go to home page"
            >
              🏠
            </button>
            <h1 
              className="selection-title"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              AI Concierges
            </h1>
          </div>
          <div className="selection-nav-actions">
            <button 
              onClick={() => setShowTour(true)} 
              className="help-button"
              title="How to use this platform"
            >
              ❓ Help
            </button>
            <button 
              onClick={() => navigate('/organization/settings')} 
              className="org-settings-button"
            >
              ⚙️ Organization Settings
            </button>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
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

          <div className="employees-grid" data-tour-target="employees-grid">
            {allEmployees.map((employee) => (
              <div key={employee.id} className="employee-card-wrapper" style={{ position: 'relative' }}>
                <ProfileCard
                  name={employee.name}
                  title={employee.role}
                  role={employee.role}
                  handle={employee.id}
                  status={employee.id === 'donna' ? 'Default' : 'Online'}
                  contactText="Select"
                  icon={employee.icon}
                  color={employee.color}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={false}
                  isSelected={employee.id === 'donna'}
                  isCustom={employee.isCustom}
                  onCardClick={() => handleEmployeeClick(employee.id)}
                  onContactClick={() => handleEmployeeClick(employee.id)}
                  onDeleteClick={(e) => handleDeleteEmployee(employee.id, e)}
                />
              </div>
            ))}
            
            {/* Create New Employee Card */}
            <div className="employee-card-wrapper" data-tour-target="create-card">
              <ProfileCard
                name="Create Custom"
                title="Custom Employee"
                role="Custom Employee"
                handle="custom"
                status="New"
                contactText="+ Create"
                icon="➕"
                color="#9333ea"
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() => setShowCreateModal(true)}
              />
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

      {/* Guided Tour */}
      <GuidedTour
        steps={employeeSelectionTour}
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        storageKey="employee-selection"
      />
    </div>
  );
}

export default EmployeeSelection;

