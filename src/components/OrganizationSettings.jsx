import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createFileStore,
  listFileStores,
  deleteFileStore
} from '../services/fileStoreService';
import {
  getOrganizationSettings,
  setOrganizationSettings,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  getIntegrations,
  addIntegration,
  removeIntegration,
  updateIntegration
} from '../services/organizationService';
import './OrganizationSettings.css';

function OrganizationSettings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  
  // Organization Profile State
  const [orgSettings, setOrgSettings] = useState({
    name: '',
    description: '',
    website: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Knowledge Stores State
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [creatingStore, setCreatingStore] = useState(false);
  const [storeError, setStoreError] = useState(null);
  const [storeSuccess, setStoreSuccess] = useState(null);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Member'
  });

  // Integrations State
  const [integrations, setIntegrations] = useState([]);
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'slack',
    config: {}
  });

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = () => {
    // Load organization settings
    const settings = getOrganizationSettings();
    setOrgSettings({
      name: settings.name || 'WizCommerce',
      description: settings.description || 'WizCommerce is a leading e-commerce platform that empowers businesses to create, manage, and scale their online stores. We provide cutting-edge solutions for digital commerce, helping merchants deliver exceptional shopping experiences to their customers worldwide.',
      website: settings.website || 'wizcommerce.com'
    });

    // Load team members
    setTeamMembers(getTeamMembers());

    // Load integrations
    setIntegrations(getIntegrations());

    // Load knowledge stores
    loadStores();
  };

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      setStoreError(null);
      const response = await listFileStores(20);
      setStores(response.fileSearchStores || []);
    } catch (err) {
      setStoreError(err.message || 'Failed to load knowledge stores');
    } finally {
      setLoadingStores(false);
    }
  };

  const handleSaveProfile = () => {
    try {
      setSavingProfile(true);
      setOrganizationSettings(orgSettings);
      alert('Organization profile saved successfully!');
    } catch (err) {
      alert('Failed to save organization profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      setStoreError('Please enter a store name');
      return;
    }

    try {
      setCreatingStore(true);
      setStoreError(null);
      setStoreSuccess(null);
      await createFileStore(newStoreName.trim());
      setStoreSuccess(`Knowledge store "${newStoreName}" created successfully!`);
      setNewStoreName('');
      await loadStores();
    } catch (err) {
      setStoreError(err.message || 'Failed to create knowledge store');
    } finally {
      setCreatingStore(false);
    }
  };

  const handleDeleteStore = async (storeName, force = false) => {
    if (!window.confirm(`Are you sure you want to delete "${storeName}"?${force ? ' This will also delete all documents.' : ''}`)) {
      return;
    }

    try {
      setLoadingStores(true);
      setStoreError(null);
      await deleteFileStore(storeName, force);
      setStoreSuccess('Knowledge store deleted successfully');
      await loadStores();
    } catch (err) {
      setStoreError(err.message || 'Failed to delete knowledge store');
    } finally {
      setLoadingStores(false);
    }
  };

  const handleAddTeamMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      alert('Please fill in name and email');
      return;
    }

    try {
      addTeamMember(newMember);
      setTeamMembers(getTeamMembers());
      setNewMember({ name: '', email: '', role: 'Member' });
      setShowAddMember(false);
    } catch (err) {
      alert('Failed to add team member');
    }
  };

  const handleRemoveTeamMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      removeTeamMember(memberId);
      setTeamMembers(getTeamMembers());
    }
  };

  const handleAddIntegration = () => {
    if (!newIntegration.name.trim()) {
      alert('Please enter integration name');
      return;
    }

    try {
      addIntegration(newIntegration);
      setIntegrations(getIntegrations());
      setNewIntegration({ name: '', type: 'slack', config: {} });
      setShowAddIntegration(false);
    } catch (err) {
      alert('Failed to add integration');
    }
  };

  const handleRemoveIntegration = (integrationId) => {
    if (window.confirm('Are you sure you want to remove this integration?')) {
      removeIntegration(integrationId);
      setIntegrations(getIntegrations());
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

  const sections = [
    { id: 'profile', label: 'Organization Profile', icon: '🏢' },
    { id: 'stores', label: 'Knowledge Stores', icon: '📚' },
    { id: 'team', label: 'Team Members', icon: '👥' },
    { id: 'integrations', label: 'Integrations', icon: '🔌' }
  ];

  return (
    <div className="organization-settings-page">
      <header className="org-settings-header">
        <div className="org-settings-nav">
          <button onClick={() => navigate('/employees')} className="back-button">
            ← Back to Employees
          </button>
          <div className="org-settings-header-info">
            <h1 className="org-settings-header-title">Organization Settings</h1>
            <p className="org-settings-header-subtitle">Manage your organization's settings and resources</p>
          </div>
        </div>
      </header>

      <main className="org-settings-main">
        <div className="org-settings-container">
          <div className="org-settings-sidebar">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`org-sidebar-button ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="org-sidebar-icon">{section.icon}</span>
                <span className="org-sidebar-label">{section.label}</span>
              </button>
            ))}
          </div>

          <div className="org-settings-content">
            {activeSection === 'profile' && (
              <section className="org-section">
                <h2 className="org-section-title">Organization Profile</h2>
                <p className="org-section-description">
                  Manage your organization's basic information and settings.
                </p>

                <div className="org-form">
                  <div className="org-form-group">
                    <label htmlFor="org-name" className="org-form-label">Organization Name</label>
                    <input
                      id="org-name"
                      type="text"
                      value={orgSettings.name}
                      onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                      placeholder="Enter organization name"
                      className="org-form-input"
                    />
                  </div>

                  <div className="org-form-group">
                    <label htmlFor="org-description" className="org-form-label">Description</label>
                    <textarea
                      id="org-description"
                      value={orgSettings.description}
                      onChange={(e) => setOrgSettings({ ...orgSettings, description: e.target.value })}
                      placeholder="Enter organization description"
                      className="org-form-textarea"
                      rows={4}
                    />
                  </div>

                  <div className="org-form-group">
                    <label htmlFor="org-website" className="org-form-label">Website</label>
                    <input
                      id="org-website"
                      type="text"
                      value={orgSettings.website}
                      onChange={(e) => setOrgSettings({ ...orgSettings, website: e.target.value })}
                      placeholder="Enter website URL"
                      className="org-form-input"
                    />
                  </div>

                  <div className="org-form-actions">
                    <button
                      onClick={handleSaveProfile}
                      className="org-save-button"
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'stores' && (
              <section className="org-section">
                <h2 className="org-section-title">Knowledge Store Management</h2>
                <p className="org-section-description">
                  Create and manage knowledge stores (FileSearchStores) for your organization. 
                  These stores can be used by all employees.
                </p>

                {storeError && <div className="org-error-message">{storeError}</div>}
                {storeSuccess && <div className="org-success-message">{storeSuccess}</div>}

                <div className="org-create-section">
                  <h3 className="org-subsection-title">Create New Knowledge Store</h3>
                  <form onSubmit={handleCreateStore} className="org-create-form">
                    <input
                      type="text"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      placeholder="Enter knowledge store name..."
                      className="org-form-input"
                      disabled={creatingStore}
                    />
                    <button
                      type="submit"
                      className="org-create-button"
                      disabled={creatingStore || !newStoreName.trim()}
                    >
                      {creatingStore ? 'Creating...' : 'Create Store'}
                    </button>
                  </form>
                </div>

                <div className="org-stores-list">
                  <h3 className="org-subsection-title">Available Knowledge Stores</h3>
                  {loadingStores && <div className="org-loading">Loading stores...</div>}
                  
                  {!loadingStores && stores.length === 0 && (
                    <div className="org-empty-state">
                      <p>No knowledge stores found. Create one above to get started.</p>
                    </div>
                  )}

                  {stores.length > 0 && (
                    <div className="org-stores-grid">
                      {stores.map((store) => (
                        <div key={store.name} className="org-store-card">
                          <div className="org-store-header">
                            <h4 className="org-store-name">
                              {store.displayName || store.name.split('/').pop()}
                            </h4>
                          </div>
                          
                          <div className="org-store-details">
                            <div className="org-store-detail-item">
                              <span className="org-detail-label">Store ID:</span>
                              <span className="org-detail-value">{store.name}</span>
                            </div>
                            <div className="org-store-detail-item">
                              <span className="org-detail-label">Active Documents:</span>
                              <span className="org-detail-value">{store.activeDocumentsCount || '0'}</span>
                            </div>
                            <div className="org-store-detail-item">
                              <span className="org-detail-label">Size:</span>
                              <span className="org-detail-value">{formatBytes(store.sizeBytes)}</span>
                            </div>
                          </div>

                          <div className="org-store-actions">
                            <button
                              onClick={() => handleDeleteStore(store.name, false)}
                              className="org-delete-button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === 'team' && (
              <section className="org-section">
                <h2 className="org-section-title">Team Member Management</h2>
                <p className="org-section-description">
                  Manage team members and their roles in your organization.
                </p>

                <div className="org-team-header">
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="org-add-button"
                  >
                    + Add Team Member
                  </button>
                </div>

                {showAddMember && (
                  <div className="org-add-form">
                    <h3 className="org-subsection-title">Add New Team Member</h3>
                    <div className="org-form-group">
                      <label className="org-form-label">Name</label>
                      <input
                        type="text"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Enter name"
                        className="org-form-input"
                      />
                    </div>
                    <div className="org-form-group">
                      <label className="org-form-label">Email</label>
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="Enter email"
                        className="org-form-input"
                      />
                    </div>
                    <div className="org-form-group">
                      <label className="org-form-label">Role</label>
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        className="org-form-select"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                    <div className="org-form-actions">
                      <button onClick={handleAddTeamMember} className="org-save-button">
                        Add Member
                      </button>
                      <button
                        onClick={() => {
                          setShowAddMember(false);
                          setNewMember({ name: '', email: '', role: 'Member' });
                        }}
                        className="org-cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="org-team-list">
                  {teamMembers.length === 0 ? (
                    <div className="org-empty-state">
                      <p>No team members yet. Add one above to get started.</p>
                    </div>
                  ) : (
                    <div className="org-team-grid">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="org-team-card">
                          <div className="org-team-info">
                            <h4 className="org-team-name">{member.name}</h4>
                            <p className="org-team-email">{member.email}</p>
                            <span className={`org-team-role org-role-${member.role.toLowerCase()}`}>
                              {member.role}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveTeamMember(member.id)}
                            className="org-remove-button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === 'integrations' && (
              <section className="org-section">
                <h2 className="org-section-title">Third-party Integrations</h2>
                <p className="org-section-description">
                  Manage integrations with third-party services like Slack, Jira, and more.
                </p>

                <div className="org-integrations-header">
                  <button
                    onClick={() => setShowAddIntegration(true)}
                    className="org-add-button"
                  >
                    + Add Integration
                  </button>
                </div>

                {showAddIntegration && (
                  <div className="org-add-form">
                    <h3 className="org-subsection-title">Add New Integration</h3>
                    <div className="org-form-group">
                      <label className="org-form-label">Integration Name</label>
                      <input
                        type="text"
                        value={newIntegration.name}
                        onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                        placeholder="e.g., Slack Workspace"
                        className="org-form-input"
                      />
                    </div>
                    <div className="org-form-group">
                      <label className="org-form-label">Type</label>
                      <select
                        value={newIntegration.type}
                        onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
                        className="org-form-select"
                      >
                        <option value="slack">Slack</option>
                        <option value="jira">Jira</option>
                        <option value="email">Email</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="org-form-actions">
                      <button onClick={handleAddIntegration} className="org-save-button">
                        Add Integration
                      </button>
                      <button
                        onClick={() => {
                          setShowAddIntegration(false);
                          setNewIntegration({ name: '', type: 'slack', config: {} });
                        }}
                        className="org-cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="org-integrations-list">
                  {integrations.length === 0 ? (
                    <div className="org-empty-state">
                      <p>No integrations configured. Add one above to get started.</p>
                    </div>
                  ) : (
                    <div className="org-integrations-grid">
                      {integrations.map((integration) => (
                        <div key={integration.id} className="org-integration-card">
                          <div className="org-integration-info">
                            <h4 className="org-integration-name">{integration.name}</h4>
                            <p className="org-integration-type">{integration.type}</p>
                            <span className={`org-integration-status org-status-${integration.status || 'active'}`}>
                              {integration.status || 'active'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveIntegration(integration.id)}
                            className="org-remove-button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrganizationSettings;

