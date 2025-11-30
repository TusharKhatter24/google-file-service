import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import { getEmployeeConfig } from '../services/employeeConfigService';
import ChatInterface from './ChatInterface';
import DocumentUpload from './DocumentUpload';
import SmartNoteMaker from './SmartNoteMaker';
import './EmployeeDetail.css';

function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  const [activeTab, setActiveTab] = useState('chat');
  const [educateSubTab, setEducateSubTab] = useState('notes'); // 'notes' or 'upload'
  const [n8nWorkflowUrl, setN8nWorkflowUrl] = useState('');

  useEffect(() => {
    // Load n8n workflow URL from configuration
    const config = getEmployeeConfig(employeeId);
    const workflowUrl = config.n8n?.workflowUrl || '';
    setN8nWorkflowUrl(workflowUrl);
  }, [employeeId]);

  // Check if we have a valid workflow URL configured
  const hasValidWorkflowUrl = !!n8nWorkflowUrl && n8nWorkflowUrl.trim() !== '';

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'educate', label: 'Educate/Train', icon: '📚' },
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
                <div className="educate-subtabs">
                  <button
                    className={`subtab-button ${educateSubTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setEducateSubTab('notes')}
                  >
                    ✍️ Smart Note Maker
                  </button>
                  <button
                    className={`subtab-button ${educateSubTab === 'upload' ? 'active' : ''}`}
                    onClick={() => setEducateSubTab('upload')}
                  >
                    📤 Upload Documents
                  </button>
                </div>
                <div className="educate-content">
                  {educateSubTab === 'notes' && (
                    <SmartNoteMaker employeeName={employee.name} employeeId={employeeId} />
                  )}
                  {educateSubTab === 'upload' && (
                    <DocumentUpload employeeName={employee.name} employeeId={employeeId} />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'action' && (
              <div className="tab-panel action-panel">
                <div className="n8n-container">
                  <div className="n8n-header">
                    <h3>n8n Workflow</h3>
                    <p>Access workflow automation for {employee.name}</p>
                  </div>
                  {hasValidWorkflowUrl ? (
                    <div className="n8n-workflow-card">
                      <div className="workflow-card-content">
                        <div className="workflow-icon">⚡</div>
                        <div className="workflow-info">
                          <h4>Workflow Ready</h4>
                          <p>Click the button below to open the n8n workflow in a new tab.</p>
                          <p className="workflow-url-hint">Workflow URL: {n8nWorkflowUrl}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(n8nWorkflowUrl, '_blank', 'noopener,noreferrer')}
                        className="btn-open-workflow"
                      >
                        Open Workflow →
                      </button>
                    </div>
                  ) : (
                    <div className="n8n-placeholder">
                      <div className="placeholder-content">
                        <div className="placeholder-icon">⚙️</div>
                        <h4>n8n Workflow Not Configured</h4>
                        <p>Configure your n8n instance URL in the component to display workflows here.</p>
                        <p className="placeholder-url">Current URL: {n8nWorkflowUrl}</p>
                      </div>
                    </div>
                  )}
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

