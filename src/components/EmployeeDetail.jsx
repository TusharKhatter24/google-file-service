import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import ChatInterface from './ChatInterface';
import DocumentUpload from './DocumentUpload';
import './EmployeeDetail.css';

function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  const [activeTab, setActiveTab] = useState('chat');

  // Placeholder n8n workflow URL - can be configured later
  const n8nWorkflowUrl = `https://your-n8n-instance.com/workflow/${employeeId}`;

  const tabs = [
    { id: 'chat', label: 'Chat with her', icon: '💬' },
    { id: 'educate', label: 'Educate/Train her', icon: '📚' },
    { id: 'action', label: 'Perform Action', icon: '⚡' }
  ];

  return (
    <div className="employee-detail-page">
      <header className="detail-header">
        <div className="detail-nav">
          <button onClick={() => navigate('/employees')} className="back-button">
            ← Back to Employees
          </button>
          <div className="employee-header-info">
            <div className="employee-header-icon">{employee.icon}</div>
            <div>
              <h1 className="employee-header-name">{employee.name}</h1>
              <p className="employee-header-role">{employee.role}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/employees/${employeeId}/settings`)} 
            className="settings-button"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main className="detail-main">
        <div className="detail-container">
          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'chat' && (
              <div className="tab-panel">
                <ChatInterface employeeName={employee.name} employeeId={employeeId} />
              </div>
            )}

            {activeTab === 'educate' && (
              <div className="tab-panel">
                <DocumentUpload employeeName={employee.name} employeeId={employeeId} />
              </div>
            )}

            {activeTab === 'action' && (
              <div className="tab-panel action-panel">
                <div className="n8n-container">
                  <div className="n8n-header">
                    <h3>n8n Workflow</h3>
                    <p>Embedded workflow interface for {employee.name}</p>
                  </div>
                  <div className="n8n-iframe-wrapper">
                    <iframe
                      src={n8nWorkflowUrl}
                      title={`n8n Workflow for ${employee.name}`}
                      className="n8n-iframe"
                      frameBorder="0"
                    />
                    <div className="n8n-placeholder">
                      <div className="placeholder-content">
                        <div className="placeholder-icon">⚙️</div>
                        <h4>n8n Workflow Placeholder</h4>
                        <p>Configure your n8n instance URL in the component to display workflows here.</p>
                        <p className="placeholder-url">Current URL: {n8nWorkflowUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDetail;

