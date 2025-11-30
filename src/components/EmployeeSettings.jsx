import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import { 
  createFileStore, 
  listFileStores, 
  getFileStore, 
  deleteFileStore 
} from '../services/fileStoreService';
import {
  getEmployeeConfig,
  updateEmployeeConfigSection,
  resetEmployeeConfig,
  getDefaultConfig,
} from '../services/employeeConfigService';
import {
  getEmployeeSkills,
  isSkillEnabled,
  toggleSkill,
  getSkillConfig,
} from '../services/skillAssignmentService';
import { skills, skillCategories } from '../data/skills';
import './EmployeeSettings.css';

function EmployeeSettings() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newStoreName, setNewStoreName] = useState('');
  const [creatingStore, setCreatingStore] = useState(false);
  const [config, setConfig] = useState(getDefaultConfig());
  const [savingConfig, setSavingConfig] = useState(false);
  const [n8nWorkflowUrl, setN8nWorkflowUrl] = useState('');
  const [selectedStores, setSelectedStores] = useState([]);
  const [enabledSkills, setEnabledSkills] = useState(new Set());
  const [skillConfigs, setSkillConfigs] = useState({});

  useEffect(() => {
    loadStores();
    loadConfig();
    loadSkills();
  }, [employeeId]);

  const loadSkills = () => {
    const assignment = getEmployeeSkills(employeeId);
    setEnabledSkills(new Set(assignment.enabledSkills || []));
    setSkillConfigs(assignment.skillConfigs || {});
  };

  const handleSkillToggle = (skillId) => {
    toggleSkill(employeeId, skillId);
    loadSkills(); // Reload to update state
  };

  const getSkillsByCategory = () => {
    const grouped = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  };

  const skillsByCategory = getSkillsByCategory();
  const enabledCount = enabledSkills.size;

  const loadConfig = () => {
    const employeeConfig = getEmployeeConfig(employeeId);
    setConfig(employeeConfig);
    setN8nWorkflowUrl(employeeConfig.n8n?.workflowUrl || '');
    setSelectedStores(employeeConfig.chat?.selectedStores || []);
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFileStores(20);
      const availableStores = response.fileSearchStores || [];
      setStores(availableStores);
      
      // Auto-select stores if none are selected and stores are available
      const currentConfig = getEmployeeConfig(employeeId);
      const currentSelectedStores = currentConfig.chat?.selectedStores || [];
      
      if (currentSelectedStores.length === 0 && availableStores.length > 0) {
        // Auto-select max 5 stores from the top
        const maxStores = Math.min(5, availableStores.length);
        const storeNames = availableStores.slice(0, maxStores).map(store => store.name);
        setSelectedStores(storeNames);
        // Save to localStorage immediately
        updateEmployeeConfigSection(employeeId, 'chat', { 
          ...currentConfig.chat, 
          selectedStores: storeNames 
        });
        setSuccess(`Auto-selected ${storeNames.length} knowledge base${storeNames.length > 1 ? 's' : ''} (max 5). You can change this selection anytime.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load file stores');
    } finally {
      setLoading(false);
    }
  };


  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      setError('Please enter a store name');
      return;
    }

    try {
      setCreatingStore(true);
      setError(null);
      setSuccess(null);
      
      const response = await createFileStore(newStoreName.trim());
      const createdStoreName = response.name;
      
      // Auto-select the newly created store if no stores are currently selected
      const currentConfig = getEmployeeConfig(employeeId);
      const currentSelectedStores = currentConfig.chat?.selectedStores || [];
      
      if (currentSelectedStores.length === 0) {
        setSelectedStores([createdStoreName]);
        updateEmployeeConfigSection(employeeId, 'chat', { 
          ...currentConfig.chat, 
          selectedStores: [createdStoreName] 
        });
        setSuccess(`Knowledge source "${newStoreName}" created and auto-selected successfully!`);
      } else {
        setSuccess(`Knowledge source "${newStoreName}" created successfully!`);
      }
      
      setNewStoreName('');
      
      // Reload stores list
      await loadStores();
    } catch (err) {
      setError(err.message || 'Failed to create knowledge source');
    } finally {
      setCreatingStore(false);
    }
  };


  const handleDeleteStore = async (storeName, force = false) => {
    if (!window.confirm(`Are you sure you want to delete "${storeName}"?${force ? ' This will also delete all documents.' : ''}`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteFileStore(storeName, force);
      setSuccess('Knowledge source deleted successfully');
      
      // Remove from selected stores if it was selected
      if (selectedStores.includes(storeName)) {
        setSelectedStores(prev => prev.filter(name => name !== storeName));
      }
      
      await loadStores();
    } catch (err) {
      setError(err.message || 'Failed to delete knowledge source');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === '0') return '0 Bytes';
    const b = parseInt(bytes);
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return Math.round(b / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleChatConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      chat: {
        ...prev.chat,
        [field]: value,
      },
    }));
  };

  const handleUploadConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      upload: {
        ...prev.upload,
        chunkingConfig: {
          ...prev.upload.chunkingConfig,
          [field]: value,
        },
      },
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      setError(null);
      updateEmployeeConfigSection(employeeId, 'chat', { ...config.chat, selectedStores });
      updateEmployeeConfigSection(employeeId, 'upload', config.upload);
      updateEmployeeConfigSection(employeeId, 'n8n', { workflowUrl: n8nWorkflowUrl });
      setSuccess('Configuration saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleStoreToggle = (storeName) => {
    setSelectedStores(prev => {
      if (prev.includes(storeName)) {
        // Remove store
        setError(null);
        return prev.filter(name => name !== storeName);
      } else {
        // Add store (max 5)
        if (prev.length >= 5) {
          setError('Maximum 5 knowledge bases can be selected at once.');
          return prev;
        }
        setError(null);
        return [...prev, storeName];
      }
    });
  };

  const handleResetConfig = () => {
    if (window.confirm('Are you sure you want to reset all configuration to defaults?')) {
      resetEmployeeConfig(employeeId);
      setConfig(getDefaultConfig());
      setSuccess('Configuration reset to defaults');
    }
  };

  return (
    <div className="employee-settings-page">
      <header className="settings-header">
        <div className="settings-nav">
          <button onClick={() => navigate(`/employees/${employeeId}`)} className="back-button">
            ← Back to {employee.name}
          </button>
          <div className="settings-header-info">
            <div className="settings-header-icon">{employee.icon}</div>
            <div>
              <h1 className="settings-header-title">Settings</h1>
              <p className="settings-header-subtitle">{employee.name} - {employee.role}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-container">
          <section className="settings-section">
            <h2 className="section-title">Knowledge Source Management</h2>
            <p className="section-description">
              Create and manage Google FileSearchStores (Knowledge Sources) for {employee.name}. 
              These stores will be used as the knowledge base for chat and document training.
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="create-store-section">
              <h3 className="subsection-title">Create New Knowledge Source</h3>
              <form onSubmit={handleCreateStore} className="create-store-form">
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Enter knowledge source name..."
                  className="store-name-input"
                  disabled={creatingStore}
                />
                <button 
                  type="submit" 
                  className="create-store-button"
                  disabled={creatingStore || !newStoreName.trim()}
                >
                  {creatingStore ? 'Creating...' : 'Create Knowledge Source'}
                </button>
              </form>
            </div>

            <div className="stores-list-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="subsection-title" style={{ margin: 0 }}>Available Knowledge Sources</h3>
                {selectedStores.length > 0 && (
                  <button
                    onClick={handleSaveConfig}
                    className="save-config-button"
                    disabled={savingConfig}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {savingConfig ? 'Saving...' : `Save Selection (${selectedStores.length} selected)`}
                  </button>
                )}
              </div>
              {loading && <div className="loading">Loading knowledge sources...</div>}
              
              {!loading && stores.length === 0 && (
                <div className="empty-state">
                  <p>No knowledge sources found. Create one above to get started.</p>
                </div>
              )}

              {stores.length > 0 && (
                <>
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0f4ff', borderRadius: '6px', fontSize: '0.875rem', color: '#667eea' }}>
                    <strong>Select knowledge bases to use:</strong> Check the boxes below to select which knowledge bases should be used for chat queries. You can select up to 5 knowledge bases (currently {selectedStores.length}/5 selected). Don't forget to click "Save Selection" after making your choices.
                  </div>
                  <div className="stores-grid">
                    {stores.map((store) => {
                      const isSelected = selectedStores.includes(store.name);
                      return (
                        <div 
                          key={store.name} 
                          className={`store-card ${isSelected ? 'selected' : ''}`}
                          style={{
                            border: isSelected ? '2px solid #667eea' : '1px solid #e5e7eb',
                            backgroundColor: isSelected ? '#f0f4ff' : 'white'
                          }}
                        >
                          <div className="store-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleStoreToggle(store.name)}
                              style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer'
                              }}
                            />
                            <h4 className="store-name" style={{ flex: 1, margin: 0 }}>
                              {store.displayName || store.name.split('/').pop()}
                            </h4>
                          </div>
                          
                          <div className="store-details">
                            <div className="store-detail-item">
                              <span className="detail-label">Store ID:</span>
                              <span className="detail-value">{store.name}</span>
                            </div>
                            <div className="store-detail-item">
                              <span className="detail-label">Active Documents:</span>
                              <span className="detail-value">{store.activeDocumentsCount || '0'}</span>
                            </div>
                            <div className="store-detail-item">
                              <span className="detail-label">Pending:</span>
                              <span className="detail-value">{store.pendingDocumentsCount || '0'}</span>
                            </div>
                            <div className="store-detail-item">
                              <span className="detail-label">Failed:</span>
                              <span className="detail-value">{store.failedDocumentsCount || '0'}</span>
                            </div>
                            <div className="store-detail-item">
                              <span className="detail-label">Size:</span>
                              <span className="detail-value">{formatBytes(store.sizeBytes)}</span>
                            </div>
                          </div>

                          <div className="store-actions">
                            <button
                              onClick={() => handleDeleteStore(store.name, false)}
                              className="delete-store-button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">Chat Configuration</h2>
            <p className="section-description">
              Configure chat parameters for {employee.name}. These settings control how the AI responds to user queries.
            </p>

            <div className="config-form">
              <div className="config-group">
                <label htmlFor="systemPrompt" className="config-label">
                  <span className="label-text">
                    System Prompt
                    <span className="info-icon-wrapper">
                      <span className="info-icon">i</span>
                      <span className="info-tooltip">
                        Instructions that define the AI's behavior, role, and personality. 
                        This helps the AI understand how to respond in context.
                      </span>
                    </span>
                  </span>
                </label>
                <textarea
                  id="systemPrompt"
                  value={config.chat.systemPrompt}
                  onChange={(e) => handleChatConfigChange('systemPrompt', e.target.value)}
                  placeholder="Enter system instructions (e.g., 'You are a helpful support engineer...')"
                  className="config-textarea"
                  rows={4}
                />
              </div>

              <div className="config-row">
                <div className="config-group">
                  <label htmlFor="model" className="config-label">
                    <span className="label-text">
                      Model
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          The Gemini model to use for generating responses. 
                          Flash models are faster, Pro models are more capable.
                        </span>
                      </span>
                    </span>
                  </label>
                  <select
                    id="model"
                    value={config.chat.model}
                    onChange={(e) => handleChatConfigChange('model', e.target.value)}
                    className="config-select"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  </select>
                </div>

                <div className="config-group">
                  <label htmlFor="temperature" className="config-label">
                    <span className="label-text">
                      Temperature: {config.chat.temperature}
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          Controls the randomness of responses. Lower values (0.0-0.5) make responses more focused and deterministic. 
                          Higher values (1.0-2.0) make responses more creative and diverse. Default: 0.7
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.chat.temperature}
                    onChange={(e) => handleChatConfigChange('temperature', parseFloat(e.target.value))}
                    className="config-range"
                  />
                </div>
              </div>

              <div className="config-row">
                <div className="config-group">
                  <label htmlFor="topP" className="config-label">
                    <span className="label-text">
                      Top P: {config.chat.topP}
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          Nucleus sampling: considers tokens with top-p probability mass. 
                          Lower values (0.1-0.5) focus on most likely tokens. Higher values (0.8-1.0) consider more diverse tokens. 
                          Works together with temperature. Default: 0.95
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    id="topP"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.chat.topP}
                    onChange={(e) => handleChatConfigChange('topP', parseFloat(e.target.value))}
                    className="config-range"
                  />
                </div>

                <div className="config-group">
                  <label htmlFor="topK" className="config-label">
                    <span className="label-text">
                      Top K: {config.chat.topK}
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          Limits sampling to the top K most likely tokens. Lower values (1-20) make responses more predictable. 
                          Higher values (40-100) allow more diversity. Default: 40
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    id="topK"
                    type="number"
                    min="1"
                    max="100"
                    value={config.chat.topK}
                    onChange={(e) => handleChatConfigChange('topK', parseInt(e.target.value))}
                    className="config-input"
                  />
                </div>
              </div>

              <div className="config-row">
                <div className="config-group">
                  <label htmlFor="maxOutputTokens" className="config-label">
                    <span className="label-text">
                      Max Output Tokens
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          Maximum number of tokens the model can generate in a single response. 
                          Higher values allow longer responses but may increase cost and latency. 
                          Range: 1-8192. Default: 8192
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    id="maxOutputTokens"
                    type="number"
                    min="1"
                    max="8192"
                    value={config.chat.maxOutputTokens}
                    onChange={(e) => handleChatConfigChange('maxOutputTokens', parseInt(e.target.value))}
                    className="config-input"
                  />
                </div>
              </div>

              <div className="config-actions">
                <button
                  onClick={handleSaveConfig}
                  className="save-config-button"
                  disabled={savingConfig}
                >
                  {savingConfig ? 'Saving...' : 'Save Chat Configuration'}
                </button>
                <button
                  onClick={handleResetConfig}
                  className="reset-config-button"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">Upload Configuration</h2>
            <p className="section-description">
              Configure how documents are processed when uploaded to the knowledge source.
            </p>

            <div className="config-form">
              <div className="config-row">
                <div className="config-group">
                  <label htmlFor="chunkSize" className="config-label">
                    <span className="label-text">
                      Chunk Size
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          The size of text chunks when processing documents. Larger chunks preserve more context 
                          but may be harder to search. Smaller chunks are more precise but may lose context. 
                          Range: 100-10000 characters. Default: 1000
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    id="chunkSize"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={config.upload.chunkingConfig.chunkSize}
                    onChange={(e) => handleUploadConfigChange('chunkSize', parseInt(e.target.value))}
                    className="config-input"
                  />
                </div>

                <div className="config-group">
                  <label htmlFor="chunkOverlap" className="config-label">
                    <span className="label-text">
                      Chunk Overlap
                      <span className="info-icon-wrapper">
                        <span className="info-icon">i</span>
                        <span className="info-tooltip">
                          Number of characters that overlap between consecutive chunks. 
                          Overlap helps preserve context across chunk boundaries and improves retrieval quality. 
                          Typically 10-20% of chunk size. Range: 0-1000. Default: 200
                        </span>
                      </span>
                    </span>
                  </label>
                  <input
                    id="chunkOverlap"
                    type="number"
                    min="0"
                    max="1000"
                    step="50"
                    value={config.upload.chunkingConfig.chunkOverlap}
                    onChange={(e) => handleUploadConfigChange('chunkOverlap', parseInt(e.target.value))}
                    className="config-input"
                  />
                </div>
              </div>

              <div className="config-actions">
                <button
                  onClick={handleSaveConfig}
                  className="save-config-button"
                  disabled={savingConfig}
                >
                  {savingConfig ? 'Saving...' : 'Save Upload Configuration'}
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">n8n Workflow Configuration</h2>
            <p className="section-description">
              Configure the n8n workflow URL for {employee.name}. This workflow will be accessible 
              in the "Perform Action" tab. The workflow will open in a new tab due to security restrictions.
            </p>

            <div className="config-form">
              <div className="config-group">
                <label htmlFor="n8nWorkflowUrl" className="config-label">
                  <span className="label-text">
                    n8n Workflow URL
                    <span className="info-icon-wrapper">
                      <span className="info-icon">i</span>
                      <span className="info-tooltip">
                        The full URL to your n8n workflow. This can be a workflow execution URL or 
                        a public workflow URL. Example: https://your-n8n-instance.com/workflow/12345
                      </span>
                    </span>
                  </span>
                </label>
                <input
                  id="n8nWorkflowUrl"
                  type="url"
                  value={n8nWorkflowUrl}
                  onChange={(e) => setN8nWorkflowUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/workflow/12345"
                  className="config-input"
                />
                {n8nWorkflowUrl && (
                  <p className="config-hint" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Workflow will be accessible at: {n8nWorkflowUrl}
                  </p>
                )}
              </div>

              <div className="config-actions">
                <button
                  onClick={handleSaveConfig}
                  className="save-config-button"
                  disabled={savingConfig}
                >
                  {savingConfig ? 'Saving...' : 'Save n8n Configuration'}
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">Skills Management</h2>
            <p className="section-description">
              Enable or disable skills for {employee.name}. Enabled skills will be available in the Skillset tab.
            </p>

            <div className="skills-management">
              <div className="skills-stats-bar">
                <span className="skills-stats-text">
                  {enabledCount} of {skills.length} skills enabled
                </span>
              </div>

              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="skills-category-group">
                  <h3 className="skills-category-title">{category}</h3>
                  <div className="skills-list">
                    {categorySkills.map((skill) => {
                      const skillEnabled = enabledSkills.has(skill.id);
                      const hasConfig = !!skillConfigs[skill.id];
                      return (
                        <div
                          key={skill.id}
                          className={`skill-item ${skillEnabled ? 'skill-item-enabled' : 'skill-item-disabled'}`}
                        >
                          <div className="skill-item-info">
                            <div className="skill-item-header">
                              <span className="skill-item-icon">{skill.icon}</span>
                              <div className="skill-item-details">
                                <h4 className="skill-item-name">{skill.name}</h4>
                                <p className="skill-item-description">{skill.description}</p>
                              </div>
                            </div>
                            {hasConfig && (
                              <span className="skill-item-config-badge" title="Has custom configuration">
                                ⚙️
                              </span>
                            )}
                          </div>
                          <label className="skill-toggle-setting">
                            <input
                              type="checkbox"
                              checked={skillEnabled}
                              onChange={() => handleSkillToggle(skill.id)}
                            />
                            <span className="skill-toggle-setting-slider"></span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default EmployeeSettings;

