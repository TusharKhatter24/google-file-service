import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import { 
  createFileStore, 
  listFileStores, 
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
  toggleSkill,
} from '../services/skillAssignmentService';
import { skills } from '../data/skills';
import { getIconComponent } from '../utils/iconHelper';
import './EmployeeSettings.css';

// Tab configuration
const TABS = [
  { id: 'profile', label: 'Profile & Prompt', icon: '👤', category: 'GENERAL' },
  { id: 'model', label: 'Model', icon: '🤖', category: 'GENERAL' },
  { id: 'sources', label: 'Knowledge Sources', icon: '📚', category: 'KNOWLEDGE' },
  { id: 'upload', label: 'Upload Settings', icon: '📤', category: 'KNOWLEDGE' },
  { id: 'generation', label: 'Generation', icon: '⚡', category: 'AI BEHAVIOR' },
  { id: 'reranking', label: 'Re-ranking', icon: '🎯', category: 'AI BEHAVIOR' },
  { id: 'skills', label: 'Skills', icon: '🛠️', category: 'CAPABILITIES' },
  { id: 'n8n', label: 'n8n Workflow', icon: '🔗', category: 'INTEGRATIONS' },
];

function EmployeeSettings() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // Data state
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
  
  // Track original state for dirty checking
  const [originalConfig, setOriginalConfig] = useState(null);
  const [originalN8nUrl, setOriginalN8nUrl] = useState('');
  const [originalSelectedStores, setOriginalSelectedStores] = useState([]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!originalConfig) return false;
    return (
      JSON.stringify(config) !== JSON.stringify(originalConfig) ||
      n8nWorkflowUrl !== originalN8nUrl ||
      JSON.stringify(selectedStores) !== JSON.stringify(originalSelectedStores)
    );
  }, [config, originalConfig, n8nWorkflowUrl, originalN8nUrl, selectedStores, originalSelectedStores]);

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
    loadSkills();
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
    setOriginalConfig(JSON.parse(JSON.stringify(employeeConfig)));
    setN8nWorkflowUrl(employeeConfig.n8n?.workflowUrl || '');
    setOriginalN8nUrl(employeeConfig.n8n?.workflowUrl || '');
    setSelectedStores(employeeConfig.chat?.selectedStores || []);
    setOriginalSelectedStores(employeeConfig.chat?.selectedStores || []);
  };

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFileStores(20);
      const availableStores = response.fileSearchStores || [];
      setStores(availableStores);
      
      const currentConfig = getEmployeeConfig(employeeId);
      const currentSelectedStores = currentConfig.chat?.selectedStores || [];
      
      if (currentSelectedStores.length === 0 && availableStores.length > 0) {
        const maxStores = Math.min(5, availableStores.length);
        const storeNames = availableStores.slice(0, maxStores).map(store => store.name);
        setSelectedStores(storeNames);
        setOriginalSelectedStores(storeNames);
        updateEmployeeConfigSection(employeeId, 'chat', { 
          ...currentConfig.chat, 
          selectedStores: storeNames 
        });
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
      
      const currentConfig = getEmployeeConfig(employeeId);
      const currentSelectedStores = currentConfig.chat?.selectedStores || [];
      
      if (currentSelectedStores.length === 0) {
        setSelectedStores([createdStoreName]);
        updateEmployeeConfigSection(employeeId, 'chat', { 
          ...currentConfig.chat, 
          selectedStores: [createdStoreName] 
        });
        setSuccess(`Knowledge source "${newStoreName}" created and auto-selected!`);
      } else {
        setSuccess(`Knowledge source "${newStoreName}" created successfully!`);
      }
      
      setNewStoreName('');
      await loadStores();
    } catch (err) {
      setError(err.message || 'Failed to create knowledge source');
    } finally {
      setCreatingStore(false);
    }
  };

  const handleDeleteStore = async (storeName) => {
    if (!window.confirm(`Are you sure you want to delete this knowledge source? This will also delete all documents.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteFileStore(storeName, true);
      setSuccess('Knowledge source deleted successfully');
      
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
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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

  const handleSaveAllChanges = async () => {
    try {
      setSavingConfig(true);
      setError(null);
      updateEmployeeConfigSection(employeeId, 'chat', { ...config.chat, selectedStores });
      updateEmployeeConfigSection(employeeId, 'upload', config.upload);
      updateEmployeeConfigSection(employeeId, 'n8n', { workflowUrl: n8nWorkflowUrl });
      
      // Update original state after save
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setOriginalN8nUrl(n8nWorkflowUrl);
      setOriginalSelectedStores([...selectedStores]);
      
      setSuccess('All changes saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Discard all unsaved changes?')) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)));
      setN8nWorkflowUrl(originalN8nUrl);
      setSelectedStores([...originalSelectedStores]);
      setError(null);
    }
  };

  const handleStoreToggle = (storeName) => {
    setSelectedStores(prev => {
      if (prev.includes(storeName)) {
        return prev.filter(name => name !== storeName);
      } else {
        if (prev.length >= 5) {
          setError('Maximum 5 knowledge bases can be selected.');
          return prev;
        }
        setError(null);
        return [...prev, storeName];
      }
    });
  };

  const handleResetConfig = () => {
    if (window.confirm('Reset all configuration to defaults?')) {
      resetEmployeeConfig(employeeId);
      loadConfig();
      setSuccess('Configuration reset to defaults');
    }
  };

  // Group tabs by category
  const tabsByCategory = TABS.reduce((acc, tab) => {
    if (!acc[tab.category]) acc[tab.category] = [];
    acc[tab.category].push(tab);
    return acc;
  }, {});

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Profile & System Prompt</h2>
              <p>Define how {employee.name} should behave and respond.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">💡</span>
              <div>
                <strong>How to use</strong>
                <p>The system prompt shapes your AI's personality and expertise. Be specific about the role, tone, and any constraints. Example: "You are a friendly support agent. Always be helpful and concise. If you don't know something, say so."</p>
              </div>
            </div>
            
            <div className="settings-card">
              <div className="employee-profile-display">
                {(() => {
                  const IconComponent = getIconComponent(employee.icon);
                  return IconComponent ? (
                    <IconComponent className="profile-icon heroicon-profile" style={{ width: '3rem', height: '3rem', color: employee.color }} />
                  ) : (
                    <span className="profile-icon">{employee.icon}</span>
                  );
                })()}
                <div className="profile-info">
                  <h3>{employee.name}</h3>
                  <span className="profile-role">{employee.role}</span>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                System Prompt
                <span className="label-hint">Instructions that define the AI's behavior and personality</span>
              </label>
              <textarea
                value={config.chat.systemPrompt}
                onChange={(e) => handleChatConfigChange('systemPrompt', e.target.value)}
                placeholder="You are a helpful assistant that..."
                className="settings-textarea"
                rows={8}
              />
              <div className="prompt-tips">
                <strong>Tips for better prompts:</strong>
                <ul>
                  <li>Define the role: "You are a [role]..."</li>
                  <li>Set constraints: "Only answer based on provided knowledge"</li>
                  <li>Specify tone: "Be professional and concise"</li>
                  <li>Add examples of ideal responses</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'model':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Model Configuration</h2>
              <p>Choose the AI model and output limits.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">⚡</span>
              <div>
                <strong>How to use</strong>
                <p>Choose <strong>Flash models</strong> for fast responses (chat, simple Q&A). Choose <strong>Pro models</strong> for complex reasoning or detailed analysis. Adjust max tokens based on expected response length.</p>
              </div>
            </div>

            <div className="settings-card">
              <label className="settings-label">Model</label>
              <select
                value={config.chat.model}
                onChange={(e) => handleChatConfigChange('model', e.target.value)}
                className="settings-select"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Most capable)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
              <span className="settings-hint">Flash = faster & cheaper • Pro = smarter & more detailed</span>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                Max Output Tokens
                <span className="settings-value">{config.chat.maxOutputTokens}</span>
              </label>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={config.chat.maxOutputTokens}
                onChange={(e) => handleChatConfigChange('maxOutputTokens', parseInt(e.target.value))}
                className="settings-range"
              />
              <div className="range-labels">
                <span>256 (Short)</span>
                <span>8192 (Long)</span>
              </div>
              <span className="settings-hint">~750 words = 1000 tokens. Use lower values for quick answers, higher for detailed explanations.</span>
            </div>
          </div>
        );

      case 'sources':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Knowledge Sources</h2>
              <p>Select up to 5 knowledge bases to use for answering questions.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">📚</span>
              <div>
                <strong>How to use</strong>
                <p>Knowledge sources contain documents the AI uses to answer questions. Select relevant sources for this employee's role. Upload documents to sources from the main Files tab. More sources = broader knowledge but slower searches.</p>
              </div>
            </div>

            {/* Create new store */}
            <div className="settings-card">
              <label className="settings-label">Create New Knowledge Source</label>
              <form onSubmit={handleCreateStore} className="create-store-inline">
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Enter name..."
                  className="settings-input"
                  disabled={creatingStore}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={creatingStore || !newStoreName.trim()}
                >
                  {creatingStore ? 'Creating...' : 'Create'}
                </button>
              </form>
              <span className="settings-hint">Use descriptive names like "Product Docs", "HR Policies", "Technical Guides"</span>
            </div>

            {/* Store selection */}
            <div className="settings-card">
              <div className="card-header-row">
                <label className="settings-label">
                  Available Sources
                  <span className="badge">{selectedStores.length}/5 selected</span>
                </label>
              </div>
              
              {loading && <div className="loading-state">Loading...</div>}
              
              {!loading && stores.length === 0 && (
                <div className="empty-state-inline">
                  <p>No knowledge sources yet. Create one above to get started.</p>
                </div>
              )}

              {stores.length > 0 && (
                <div className="stores-list">
                  {stores.map((store) => {
                    const isSelected = selectedStores.includes(store.name);
                    return (
                      <div 
                        key={store.name} 
                        className={`store-list-item ${isSelected ? 'selected' : ''}`}
                      >
                        <label className="store-select-row">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleStoreToggle(store.name)}
                            className="store-checkbox-input"
                          />
                          <div className="store-info">
                            <span className="store-name-text">
                              {store.displayName || store.name.split('/').pop()}
                            </span>
                            <span className="store-meta">
                              {store.activeDocumentsCount || 0} docs • {formatBytes(store.sizeBytes)}
                            </span>
                          </div>
                        </label>
                        <button
                          onClick={() => handleDeleteStore(store.name)}
                          className="btn btn-ghost btn-danger btn-sm"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Upload Settings</h2>
              <p>Configure how documents are processed when uploaded.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">📤</span>
              <div>
                <strong>How to use</strong>
                <p>When you upload documents, they're split into "chunks" for searching. <strong>Chunk size</strong> controls how big each piece is. <strong>Overlap</strong> ensures context isn't lost between pieces. Default settings work well for most documents.</p>
              </div>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                Chunk Size
                <span className="settings-value">{config.upload.chunkingConfig.chunkSize} chars</span>
              </label>
              <input
                type="range"
                min="200"
                max="4000"
                step="100"
                value={config.upload.chunkingConfig.chunkSize}
                onChange={(e) => handleUploadConfigChange('chunkSize', parseInt(e.target.value))}
                className="settings-range"
              />
              <div className="range-labels">
                <span>200 (Precise)</span>
                <span>4000 (Context-rich)</span>
              </div>
              <span className="settings-hint">Smaller = better for FAQs & short answers • Larger = better for complex topics</span>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                Chunk Overlap
                <span className="settings-value">{config.upload.chunkingConfig.chunkOverlap} chars</span>
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={config.upload.chunkingConfig.chunkOverlap}
                onChange={(e) => handleUploadConfigChange('chunkOverlap', parseInt(e.target.value))}
                className="settings-range"
              />
              <div className="range-labels">
                <span>0 (No overlap)</span>
                <span>500 (High overlap)</span>
              </div>
              <span className="settings-hint">Recommended: 10-20% of chunk size. Helps when answers span chunk boundaries.</span>
            </div>
          </div>
        );

      case 'generation':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Generation Settings</h2>
              <p>Fine-tune how the AI generates responses.</p>
            </div>

            <div className="info-banner warning">
              <span className="info-icon">⚠️</span>
              <div>
                <strong>Advanced Settings</strong>
                <p>These settings affect response quality and creativity. Default values work well for most use cases. Only adjust if you understand how they work.</p>
              </div>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                Temperature
                <span className="settings-value">{config.chat.temperature}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.chat.temperature}
                onChange={(e) => handleChatConfigChange('temperature', parseFloat(e.target.value))}
                className="settings-range"
              />
              <div className="range-labels">
                <span>0 (Focused)</span>
                <span>2 (Creative)</span>
              </div>
              <span className="settings-hint">Low (0-0.3) = factual, consistent • Medium (0.5-0.7) = balanced • High (1+) = creative, varied</span>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                Top P (Nucleus Sampling)
                <span className="settings-value">{config.chat.topP}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.chat.topP}
                onChange={(e) => handleChatConfigChange('topP', parseFloat(e.target.value))}
                className="settings-range"
              />
              <div className="range-labels">
                <span>0 (Narrow)</span>
                <span>1 (Wide)</span>
              </div>
              <span className="settings-hint">Controls diversity. Lower = more focused on likely words. Keep at 0.9-1 unless you need precision.</span>
            </div>

            <div className="settings-card">
              <label className="settings-label">
                Top K
                <span className="settings-value">{config.chat.topK}</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={config.chat.topK}
                onChange={(e) => handleChatConfigChange('topK', parseInt(e.target.value))}
                className="settings-range"
              />
              <div className="range-labels">
                <span>1 (Most likely)</span>
                <span>100 (Diverse)</span>
              </div>
              <span className="settings-hint">Limits word choices. Lower = more predictable. Keep at 40 for balanced results.</span>
            </div>
          </div>
        );

      case 'reranking':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Source Re-ranking</h2>
              <p>Improve response quality by re-ranking retrieved sources by relevance.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">🎯</span>
              <div>
                <strong>How to use</strong>
                <p>Re-ranking uses AI to score how relevant each retrieved document chunk is to your question. Enable this when you have <strong>many documents</strong> and want better answer quality. It adds a small latency (~200ms) but significantly improves relevance.</p>
              </div>
            </div>

            <div className="settings-card">
              <label className="settings-label toggle-row">
                <span>Enable Source Re-ranking</span>
                <div className="toggle-switch-new">
                  <input
                    type="checkbox"
                    checked={config.chat.enableReranking || false}
                    onChange={(e) => handleChatConfigChange('enableReranking', e.target.checked)}
                  />
                  <span className="toggle-slider-new"></span>
                </div>
              </label>
              <span className="settings-hint">Recommended for knowledge bases with 10+ documents</span>
            </div>

            {config.chat.enableReranking && (
              <>
                <div className="settings-card">
                  <label className="settings-label">
                    Top K Sources
                    <span className="settings-value">{config.chat.rerankingTopK || 5}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={config.chat.rerankingTopK || 5}
                    onChange={(e) => handleChatConfigChange('rerankingTopK', parseInt(e.target.value))}
                    className="settings-range"
                  />
                  <div className="range-labels">
                    <span>1 (Focused)</span>
                    <span>10 (Comprehensive)</span>
                  </div>
                  <span className="settings-hint">How many best sources to use. 3-5 is ideal for most cases.</span>
                </div>

                <div className="settings-card">
                  <label className="settings-label">
                    Minimum Relevance Score
                    <span className="settings-value">{((config.chat.minRelevanceScore || 0.3) * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.9"
                    step="0.05"
                    value={config.chat.minRelevanceScore || 0.3}
                    onChange={(e) => handleChatConfigChange('minRelevanceScore', parseFloat(e.target.value))}
                    className="settings-range"
                  />
                  <div className="range-labels">
                    <span>0% (All sources)</span>
                    <span>90% (Only best)</span>
                  </div>
                  <span className="settings-hint">Filter out low-quality matches. 30-50% works well for most content.</span>
                </div>
              </>
            )}
          </div>
        );

      case 'skills':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Skills</h2>
              <p>Enable or disable capabilities for {employee.name}.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">🛠️</span>
              <div>
                <strong>How to use</strong>
                <p>Skills are specialized capabilities you can enable for this AI employee. Click any skill card to toggle it on/off. Enabled skills appear in the "Skillset" tab when chatting with {employee.name}.</p>
              </div>
            </div>

            <div className="skills-summary">
              <span className="skills-count">{enabledCount} of {skills.length} skills enabled</span>
            </div>

            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category} className="skills-category">
                <h4 className="category-title">{category}</h4>
                <div className="skills-grid">
                  {categorySkills.map((skill) => {
                    const isEnabled = enabledSkills.has(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className={`skill-card ${isEnabled ? 'enabled' : ''}`}
                        onClick={() => handleSkillToggle(skill.id)}
                      >
                        <div className="skill-card-header">
                          <span className="skill-icon">{skill.icon}</span>
                          <div className="toggle-switch-new small">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => {}}
                            />
                            <span className="toggle-slider-new"></span>
                          </div>
                        </div>
                        <h5 className="skill-name">{skill.name}</h5>
                        <p className="skill-description">{skill.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'n8n':
        return (
          <div className="tab-content">
            <div className="tab-header">
              <h2>n8n Workflow</h2>
              <p>Connect an n8n workflow for automation.</p>
            </div>

            <div className="info-banner">
              <span className="info-icon">🔗</span>
              <div>
                <strong>How to use</strong>
                <p>n8n is a workflow automation tool. Add a workflow URL here to embed it in the "Perform Action" tab. This lets {employee.name} trigger automated workflows like sending emails, creating tickets, or updating databases.</p>
              </div>
            </div>

            <div className="settings-card">
              <label className="settings-label">Workflow URL</label>
              <input
                type="url"
                value={n8nWorkflowUrl}
                onChange={(e) => setN8nWorkflowUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com/workflow/..."
                className="settings-input"
              />
              <span className="settings-hint">Paste the full URL to your n8n workflow or form trigger</span>
            </div>

            {n8nWorkflowUrl && (
              <div className="settings-card">
                <div className="preview-link">
                  <span className="preview-label">Preview:</span>
                  <a href={n8nWorkflowUrl} target="_blank" rel="noopener noreferrer" className="link">
                    {n8nWorkflowUrl}
                  </a>
                </div>
              </div>
            )}

            {!n8nWorkflowUrl && (
              <div className="settings-card empty-state-card">
                <p>No workflow connected yet. Add a URL above to enable the "Perform Action" feature.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page-new">
      {/* Header */}
      <header className="settings-header-new">
        <button onClick={() => navigate(`/employees/${employeeId}`)} className="back-btn">
          <span>←</span>
          Back to {employee.name}
        </button>
        <div className="header-title">
          {(() => {
            const IconComponent = getIconComponent(employee.icon);
            return IconComponent ? (
              <IconComponent className="header-icon heroicon-header" style={{ width: '2rem', height: '2rem', color: employee.color }} />
            ) : (
              <span className="header-icon">{employee.icon}</span>
            );
          })()}
          <div>
            <h1>Settings</h1>
            <span className="header-subtitle">{employee.name}</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="settings-layout">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <nav className="sidebar-nav">
            {Object.entries(tabsByCategory).map(([category, tabs]) => (
              <div key={category} className="nav-group">
                <span className="nav-category">{category}</span>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="nav-icon">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleResetConfig} className="btn btn-ghost btn-sm">
              Reset All to Defaults
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="settings-content">
          {/* Messages */}
          {error && (
            <div className="message message-error">
              <span>⚠️</span>
              {error}
              <button onClick={() => setError(null)} className="message-close">×</button>
            </div>
          )}
          {success && (
            <div className="message message-success">
              <span>✓</span>
              {success}
              <button onClick={() => setSuccess(null)} className="message-close">×</button>
            </div>
          )}

          {renderTabContent()}
        </main>
      </div>

      {/* Sticky footer with save */}
      {hasUnsavedChanges && (
        <footer className="settings-footer">
          <div className="footer-content">
            <span className="unsaved-indicator">
              <span className="dot"></span>
              Unsaved changes
            </span>
            <div className="footer-actions">
              <button onClick={handleDiscardChanges} className="btn btn-ghost">
                Discard
              </button>
              <button 
                onClick={handleSaveAllChanges} 
                className="btn btn-primary"
                disabled={savingConfig}
              >
                {savingConfig ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default EmployeeSettings;
