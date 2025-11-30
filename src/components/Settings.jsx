import React, { useState, useEffect } from 'react';
import './Settings.css';
import { getSystemPrompt, saveSystemPrompt, getDefaultSystemPrompt, resetSystemPrompt } from '../services/settingsService';

function Settings() {
  const [integrations, setIntegrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Automatically sync messages, channels, and files from Slack to your knowledge segments',
      icon: '💬',
      connected: false,
      color: '#4A154B'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Import emails and attachments to keep your knowledge base up to date',
      icon: '📧',
      connected: false,
      color: '#EA4335'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync tickets, conversations, and knowledge base articles from HubSpot',
      icon: '🎯',
      connected: false,
      color: '#FF7A59'
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Import pages, spaces, and documentation from Confluence',
      icon: '📚',
      connected: false,
      color: '#172B4D'
    }
  ]);

  const [systemPrompt, setSystemPrompt] = useState('');
  const [systemPromptChanged, setSystemPromptChanged] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    // Load system prompt on component mount
    const currentPrompt = getSystemPrompt();
    setSystemPrompt(currentPrompt);
  }, []);

  const handleConnect = (integrationId) => {
    // In a real implementation, this would open OAuth flow or configuration
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, connected: !integration.connected }
        : integration
    ));
  };

  const handleSystemPromptChange = (e) => {
    setSystemPrompt(e.target.value);
    setSystemPromptChanged(true);
    setSaveStatus(null);
  };

  const handleSaveSystemPrompt = () => {
    try {
      saveSystemPrompt(systemPrompt);
      setSystemPromptChanged(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleResetSystemPrompt = () => {
    const defaultPrompt = getDefaultSystemPrompt();
    setSystemPrompt(defaultPrompt);
    resetSystemPrompt();
    setSystemPromptChanged(false);
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p className="settings-subtitle">Configure integrations and manage Donna</p>
        </div>
      </div>

      <div className="settings-section">
        <h2>Integrations</h2>
        <p className="section-description">
          Connect your tools to automatically sync knowledge to your segments. Enable auto-sync to keep your knowledge base up to date.
        </p>

        <div className="integrations-grid">
          {integrations.map(integration => (
            <div key={integration.id} className="integration-card">
              <div className="integration-header">
                <div className="integration-icon" style={{ backgroundColor: `${integration.color}15` }}>
                  <span style={{ fontSize: '2rem' }}>{integration.icon}</span>
                </div>
                <div className="integration-status">
                  {integration.connected ? (
                    <span className="status-badge connected">Connected</span>
                  ) : (
                    <span className="status-badge disconnected">Not Connected</span>
                  )}
                </div>
              </div>
              <div className="integration-content">
                <h3>{integration.name}</h3>
                <p>{integration.description}</p>
              </div>
              <div className="integration-actions">
                <button
                  className={`btn-integration ${integration.connected ? 'btn-disconnect' : 'btn-connect'}`}
                  onClick={() => handleConnect(integration.id)}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
                {integration.connected && (
                  <button className="btn-integration btn-configure">
                    Configure
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>Auto-Sync Settings</h2>
        <p className="section-description">
          Configure how often integrations should sync data to your knowledge segments.
        </p>
        <div className="sync-settings">
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Enable auto-sync for connected integrations</span>
            </label>
          </div>
          <div className="setting-item">
            <label>
              Sync Frequency
              <select className="setting-select">
                <option>Real-time</option>
                <option>Every 15 minutes</option>
                <option>Every hour</option>
                <option>Every 6 hours</option>
                <option>Daily</option>
              </select>
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              <span>Notify on sync failures</span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>AI Assistant Settings</h2>
        <p className="section-description">
          Customize the system prompt that guides the AI assistant's behavior. This prompt is applied to all AI interactions throughout the application, helping to ensure consistent and contextually appropriate responses.
        </p>
        <div className="system-prompt-section">
          <div className="setting-item">
            <label htmlFor="system-prompt-textarea">
              System Prompt
            </label>
            <textarea
              id="system-prompt-textarea"
              className="system-prompt-textarea"
              value={systemPrompt}
              onChange={handleSystemPromptChange}
              rows={10}
              placeholder="Enter system prompt..."
            />
            <div className="system-prompt-footer">
              <span className="char-count">
                {systemPrompt.length} characters
              </span>
              {saveStatus === 'saved' && (
                <span className="save-status success">Saved successfully</span>
              )}
              {saveStatus === 'reset' && (
                <span className="save-status success">Reset to default</span>
              )}
              {saveStatus === 'error' && (
                <span className="save-status error">Failed to save</span>
              )}
            </div>
          </div>
          <div className="system-prompt-actions">
            <button
              className="btn-secondary"
              onClick={handleResetSystemPrompt}
            >
              Reset to Default
            </button>
            <button
              className={`btn btn-primary ${!systemPromptChanged ? 'btn-disabled' : ''}`}
              onClick={handleSaveSystemPrompt}
              disabled={!systemPromptChanged}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Segment Assignment Rules</h2>
        <p className="section-description">
          Automatically assign synced content to knowledge segments based on rules.
        </p>
        <div className="rules-list">
          <div className="rule-item">
            <div className="rule-content">
              <h4>Slack → Support Team Segment</h4>
              <p>Messages from #support channel → Support Team segment</p>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>
              Edit
            </button>
          </div>
          <div className="rule-item">
            <div className="rule-content">
              <h4>Gmail → Client Communications</h4>
              <p>Emails from client domain → Client Communications segment</p>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>
              Edit
            </button>
          </div>
          <div className="empty-state" style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
              + Add New Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

