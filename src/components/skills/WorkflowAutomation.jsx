import React, { useState, useEffect } from 'react';
import { getEmployeeConfig } from '../../services/employeeConfigService';

function WorkflowAutomation({ employeeName, employeeId }) {
  const [n8nWorkflowUrl, setN8nWorkflowUrl] = useState('');

  useEffect(() => {
    const config = getEmployeeConfig(employeeId);
    const workflowUrl = config.n8n?.workflowUrl || '';
    setN8nWorkflowUrl(workflowUrl);
  }, [employeeId]);

  const hasValidWorkflowUrl = !!n8nWorkflowUrl && n8nWorkflowUrl.trim() !== '';

  const workflowExamples = [
    { id: 1, name: 'Slack to Jira', description: 'Create Jira tickets from Slack messages' },
    { id: 2, name: 'Email Automation', description: 'Auto-respond to common email queries' },
    { id: 3, name: 'Meeting Scheduler', description: 'Automatically schedule meetings' }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Workflow Automation</h2>
        <p>{employeeName} can execute n8n workflows to automate tasks</p>
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
            <p>Configure your n8n instance URL in Settings to enable workflows.</p>
          </div>
        </div>
      )}

      <div className="workflow-examples-section">
        <h3>Workflow Examples</h3>
        <div className="workflows-list">
          {workflowExamples.map(workflow => (
            <div key={workflow.id} className="workflow-example-item">
              <div className="workflow-example-info">
                <h4>{workflow.name}</h4>
                <p>{workflow.description}</p>
              </div>
              <button className="btn-create-workflow" disabled>
                Create
              </button>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Configure n8n in Settings to create custom workflows
        </p>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔗</div>
          <h3>Connect Apps</h3>
          <p>Integrate with 300+ apps and services</p>
          <button className="btn-feature" disabled>Browse Apps</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⏱️</div>
          <h3>Schedule Workflows</h3>
          <p>Run automations on a schedule</p>
          <button className="btn-feature" disabled>Schedule</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Execution History</h3>
          <p>View workflow runs and logs</p>
          <button className="btn-feature" disabled>View History</button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowAutomation;

