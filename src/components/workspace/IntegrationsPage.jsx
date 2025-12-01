import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeById } from '../../data/employees';
import { getEmployeeSkills } from '../../services/skillAssignmentService';
import Card from '../Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import EmptyState from '../ui/EmptyState';
import './IntegrationsPage.css';

const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect to Slack channels and monitor conversations',
    icon: '💬',
    category: 'Communication',
    enabled: false,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage tickets and track project workflows',
    icon: '🎫',
    category: 'Project Management',
    enabled: false,
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Access and search Confluence pages',
    icon: '📖',
    category: 'Documentation',
    enabled: false,
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send and receive emails',
    icon: '📧',
    category: 'Communication',
    enabled: false,
  },
];

function IntegrationsPage() {
  const { employeeId } = useParams();
  const employee = getEmployeeById(employeeId);
  const [integrationsState, setIntegrationsState] = useState(integrations);
  const [enabledSkills, setEnabledSkills] = useState(new Set());

  useEffect(() => {
    if (employeeId) {
      const assignment = getEmployeeSkills(employeeId);
      const enabled = new Set(assignment.enabledSkills || []);
      setEnabledSkills(enabled);
      
      // Map skills to integrations
      setIntegrationsState(prev => prev.map(integration => {
        const skillIdMap = {
          'slack': 'slack-integration',
          'jira': 'jira-integration',
          'confluence': 'confluence-integration',
          'email': 'email-assistant',
        };
        return {
          ...integration,
          enabled: enabled.has(skillIdMap[integration.id] || ''),
        };
      }));
    }
  }, [employeeId]);

  const handleToggleIntegration = (integrationId) => {
    setIntegrationsState(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        return { ...integration, enabled: !integration.enabled };
      }
      return integration;
    }));
    // In a real app, this would call an API to enable/disable the integration
    alert(`${integrationsState.find(i => i.id === integrationId)?.name} ${integrationsState.find(i => i.id === integrationId)?.enabled ? 'disconnected' : 'connected'}`);
  };

  const enabledIntegrations = integrationsState.filter(i => i.enabled);
  const availableIntegrations = integrationsState.filter(i => !i.enabled);

  return (
    <div className="integrations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect {employee.name} to external services and tools.</p>
        </div>
      </div>

      <div className="page-content">
        {enabledIntegrations.length > 0 && (
          <div className="integrations-section">
            <h2 className="section-title">Connected Integrations</h2>
            <div className="integrations-grid">
              {enabledIntegrations.map((integration) => (
                <Card key={integration.id} className="integration-card connected">
                  <div className="integration-header">
                    <div className="integration-icon">{integration.icon}</div>
                    <div className="integration-info">
                      <h3 className="integration-name">{integration.name}</h3>
                      <Badge variant="success">Connected</Badge>
                    </div>
                  </div>
                  <p className="integration-description">{integration.description}</p>
                  <div className="integration-actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleToggleIntegration(integration.id)}
                    >
                      Disconnect
                    </Button>
                    <Button variant="primary">
                      Configure
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="integrations-section">
          <h2 className="section-title">
            {enabledIntegrations.length > 0 ? 'Available Integrations' : 'Integrations'}
          </h2>
          {availableIntegrations.length === 0 ? (
            <EmptyState
              icon="✨"
              title="All integrations connected"
              description="You've connected all available integrations."
            />
          ) : (
            <div className="integrations-grid">
              {availableIntegrations.map((integration) => (
                <Card key={integration.id} className="integration-card">
                  <div className="integration-header">
                    <div className="integration-icon">{integration.icon}</div>
                    <div className="integration-info">
                      <h3 className="integration-name">{integration.name}</h3>
                      <Badge variant="default">{integration.category}</Badge>
                    </div>
                  </div>
                  <p className="integration-description">{integration.description}</p>
                  <div className="integration-actions">
                    <Button
                      variant="primary"
                      onClick={() => handleToggleIntegration(integration.id)}
                    >
                      Connect
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntegrationsPage;

