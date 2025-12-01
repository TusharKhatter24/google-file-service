import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeById } from '../../data/employees';
import { 
  getEmployeeConfig,
  updateEmployeeConfigSection,
  resetEmployeeConfig,
  getDefaultConfig,
} from '../../services/employeeConfigService';
import { 
  createFileStore, 
  listFileStores, 
  deleteFileStore 
} from '../../services/fileStoreService';
import Card from '../Card';
import Button from '../Button';
import Badge from '../ui/Badge';
import './SettingsPage.css';

function SettingsPage() {
  const { employeeId } = useParams();
  const employee = getEmployeeById(employeeId);
  const [config, setConfig] = useState(getDefaultConfig());
  const [savingConfig, setSavingConfig] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [creatingStore, setCreatingStore] = useState(false);
  const [activeSection, setActiveSection] = useState('system-prompt');

  useEffect(() => {
    loadConfig();
    loadStores();
  }, [employeeId]);

  const loadConfig = () => {
    const employeeConfig = getEmployeeConfig(employeeId);
    setConfig(employeeConfig);
    setSelectedStores(employeeConfig.chat?.selectedStores || []);
  };

  const loadStores = async () => {
    try {
      const response = await listFileStores(20);
      setStores(response.fileSearchStores || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
    }
  };

  const handleSaveConfig = (section) => {
    setSavingConfig(true);
    try {
      updateEmployeeConfigSection(employeeId, section, config[section]);
      setTimeout(() => {
        setSavingConfig(false);
        alert('Settings saved successfully!');
      }, 500);
    } catch (error) {
      console.error('Error saving config:', error);
      setSavingConfig(false);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleStoreToggle = (storeName) => {
    const newSelected = selectedStores.includes(storeName)
      ? selectedStores.filter(s => s !== storeName)
      : [...selectedStores, storeName];
    
    setSelectedStores(newSelected);
    updateEmployeeConfigSection(employeeId, 'chat', {
      ...config.chat,
      selectedStores: newSelected
    });
  };

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) {
      alert('Please enter a store name');
      return;
    }

    setCreatingStore(true);
    try {
      await createFileStore(newStoreName.trim());
      setNewStoreName('');
      await loadStores();
      alert('Knowledge source created successfully!');
    } catch (error) {
      console.error('Error creating store:', error);
      alert('Failed to create knowledge source. Please try again.');
    } finally {
      setCreatingStore(false);
    }
  };

  const handleDeleteStore = async (storeName) => {
    if (!window.confirm('Are you sure you want to delete this knowledge source?')) {
      return;
    }

    try {
      await deleteFileStore(storeName);
      await loadStores();
      // Remove from selected stores if it was selected
      if (selectedStores.includes(storeName)) {
        const newSelected = selectedStores.filter(s => s !== storeName);
        setSelectedStores(newSelected);
        updateEmployeeConfigSection(employeeId, 'chat', {
          ...config.chat,
          selectedStores: newSelected
        });
      }
      alert('Knowledge source deleted successfully!');
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Failed to delete knowledge source. Please try again.');
    }
  };

  const sections = [
    { id: 'system-prompt', label: 'System Prompt', icon: '📝' },
    { id: 'model-config', label: 'Model Config', icon: '⚙️' },
    { id: 'knowledge-sources', label: 'Knowledge Sources', icon: '📚' },
    { id: 'access', label: 'Access Control', icon: '🔒' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure {employee.name}'s behavior, model, and knowledge sources.</p>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-main">
          {activeSection === 'system-prompt' && (
            <Card className="settings-section">
              <h2 className="section-title">System Prompt</h2>
              <p className="section-description">
                Define how {employee.name} behaves and responds. This prompt sets the personality and guidelines.
              </p>
              <div className="form-group">
                <label htmlFor="system-prompt">System Prompt</label>
                <textarea
                  id="system-prompt"
                  value={config.chat?.systemPrompt || employee.defaultSystemPrompt || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    chat: { ...config.chat, systemPrompt: e.target.value }
                  })}
                  rows={12}
                  placeholder="Enter system prompt..."
                />
              </div>
              <Button
                onClick={() => handleSaveConfig('chat')}
                disabled={savingConfig}
              >
                {savingConfig ? 'Saving...' : 'Save System Prompt'}
              </Button>
            </Card>
          )}

          {activeSection === 'model-config' && (
            <Card className="settings-section">
              <h2 className="section-title">Model Configuration</h2>
              <p className="section-description">
                Configure the AI model parameters for {employee.name}.
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="model">Model</label>
                  <select
                    id="model"
                    value={config.chat?.model || 'gemini-2.5-flash'}
                    onChange={(e) => setConfig({
                      ...config,
                      chat: { ...config.chat, model: e.target.value }
                    })}
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="temperature">Temperature</label>
                  <input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.chat?.temperature ?? 0.7}
                    onChange={(e) => setConfig({
                      ...config,
                      chat: { ...config.chat, temperature: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="topP">Top P</label>
                  <input
                    id="topP"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.chat?.topP ?? 0.95}
                    onChange={(e) => setConfig({
                      ...config,
                      chat: { ...config.chat, topP: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="topK">Top K</label>
                  <input
                    id="topK"
                    type="number"
                    min="1"
                    max="40"
                    value={config.chat?.topK ?? 40}
                    onChange={(e) => setConfig({
                      ...config,
                      chat: { ...config.chat, topK: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maxOutputTokens">Max Output Tokens</label>
                  <input
                    id="maxOutputTokens"
                    type="number"
                    min="1"
                    max="8192"
                    value={config.chat?.maxOutputTokens ?? 8192}
                    onChange={(e) => setConfig({
                      ...config,
                      chat: { ...config.chat, maxOutputTokens: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSaveConfig('chat')}
                disabled={savingConfig}
              >
                {savingConfig ? 'Saving...' : 'Save Model Config'}
              </Button>
            </Card>
          )}

          {activeSection === 'knowledge-sources' && (
            <Card className="settings-section">
              <h2 className="section-title">Knowledge Sources</h2>
              <p className="section-description">
                Manage knowledge sources that {employee.name} can access.
              </p>
              
              <div className="create-store-section">
                <h3>Create New Knowledge Source</h3>
                <div className="create-store-form">
                  <input
                    type="text"
                    placeholder="Enter knowledge source name..."
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateStore()}
                  />
                  <Button
                    onClick={handleCreateStore}
                    disabled={creatingStore || !newStoreName.trim()}
                  >
                    {creatingStore ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>

              <div className="stores-list">
                <h3>Available Knowledge Sources</h3>
                {stores.length === 0 ? (
                  <p className="empty-message">No knowledge sources available. Create one above.</p>
                ) : (
                  <div className="stores-grid">
                    {stores.map((store) => {
                      const isSelected = selectedStores.includes(store.name);
                      return (
                        <div key={store.name} className={`store-card ${isSelected ? 'selected' : ''}`}>
                          <div className="store-header">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleStoreToggle(store.name)}
                            />
                            <div className="store-info">
                              <div className="store-name">{store.displayName || store.name.split('/').pop()}</div>
                              <div className="store-meta">
                                {store.activeDocumentsCount || 0} documents
                              </div>
                            </div>
                          </div>
                          <button
                            className="delete-store-btn"
                            onClick={() => handleDeleteStore(store.name)}
                            title="Delete knowledge source"
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeSection === 'access' && (
            <Card className="settings-section">
              <h2 className="section-title">Access Control</h2>
              <p className="section-description">
                Manage who can access and interact with {employee.name}.
              </p>
              <div className="form-group">
                <label>Access Level</label>
                <div className="access-options">
                  <label className="access-option">
                    <input type="radio" name="access" value="public" defaultChecked />
                    <div>
                      <div className="option-title">Public</div>
                      <div className="option-description">Anyone in your organization can access</div>
                    </div>
                  </label>
                  <label className="access-option">
                    <input type="radio" name="access" value="private" />
                    <div>
                      <div className="option-title">Private</div>
                      <div className="option-description">Only you can access</div>
                    </div>
                  </label>
                </div>
              </div>
              <Button
                onClick={() => handleSaveConfig('access')}
                disabled={savingConfig}
              >
                {savingConfig ? 'Saving...' : 'Save Access Settings'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;



