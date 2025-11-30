import React from 'react';
import { useNavigate } from 'react-router-dom';
import { employees } from '../data/employees';
import { logout } from '../utils/auth';
import './EmployeeSelection.css';

function EmployeeSelection() {
  const navigate = useNavigate();

  const handleEmployeeClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="employee-selection-page">
      <header className="selection-header">
        <div className="selection-nav">
          <h1 className="selection-title">AI Concierges</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="selection-main">
        <div className="selection-container">
          <h2 className="page-title">Choose your employee</h2>
          <p className="page-subtitle">Select an AI employee to start working with</p>

          <div className="employees-grid">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`employee-card ${employee.id === 'donna' ? 'default-selected' : ''}`}
                onClick={() => handleEmployeeClick(employee.id)}
              >
                <div className="employee-icon">{employee.icon}</div>
                <div className="employee-info">
                  <h3 className="employee-name">{employee.name}</h3>
                  <p className="employee-role">{employee.role}</p>
                  <p className="employee-description">{employee.description}</p>
                </div>
                {employee.id === 'donna' && (
                  <div className="default-badge">Default</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeSelection;

