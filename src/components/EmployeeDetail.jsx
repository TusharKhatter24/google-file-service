import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import { skills, skillCategories } from '../data/skills';
import { 
  getEmployeeSkills, 
  isSkillEnabled, 
  toggleSkill,
  getSkillConfig 
} from '../services/skillAssignmentService';
import ChatInterface from './ChatInterface';
import DocumentUpload from './DocumentUpload';
import SmartNoteMaker from './SmartNoteMaker';
import SkillCard from './SkillCard';
import MeetingAssistant from './skills/MeetingAssistant';
import SlackIntegration from './skills/SlackIntegration';
import JiraIntegration from './skills/JiraIntegration';
import EmailAssistant from './skills/EmailAssistant';
import NoteTaking from './skills/NoteTaking';
import WorkflowAutomation from './skills/WorkflowAutomation';
import DocumentAnalysis from './skills/DocumentAnalysis';
import TaskManagement from './skills/TaskManagement';
import CalendarManagement from './skills/CalendarManagement';
import KnowledgeBaseSearch from './skills/KnowledgeBaseSearch';
import Research from './skills/Research';
import GuidedTour from './GuidedTour';
import { employeeDetailTour } from '../data/tourSteps';
import { 
  FaFileAlt, 
  FaRobot, 
  FaDatabase,
  FaArrowRight,
  FaRocket,
  FaChartBar,
  FaPencilAlt,
  FaEnvelope,
  FaComments,
  FaMicrophone,
  FaEdit,
  FaGlobe
} from 'react-icons/fa';
import { SiTelegram, SiGooglesheets } from 'react-icons/si';
import './EmployeeDetail.css';

function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  const [activeTab, setActiveTab] = useState('chat');
  const [educateSubTab, setEducateSubTab] = useState('notes'); // 'notes' or 'upload'
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillFilter, setSkillFilter] = useState('all'); // 'all', 'enabled', 'disabled'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledSkills, setEnabledSkills] = useState(new Set());
  const [skillConfigs, setSkillConfigs] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'educate', label: 'Educate/Train', icon: '📚' },
    { id: 'skillset', label: 'Skillset', icon: '🎯' },
    { id: 'workflows', label: 'Workflows', icon: '⚡' }
  ];

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
  };

  const handleBackToSkills = () => {
    setSelectedSkill(null);
  };

  // Load employee skills on mount and when employeeId changes
  useEffect(() => {
    if (employeeId) {
      const assignment = getEmployeeSkills(employeeId);
      setEnabledSkills(new Set(assignment.enabledSkills || []));
      setSkillConfigs(assignment.skillConfigs || {});
    }
  }, [employeeId]);

  // Auto-start tour on page load
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setShowTour(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSkillToggle = (skillId) => {
    try {
      const newEnabled = toggleSkill(employeeId, skillId);
      setEnabledSkills(prev => {
        const updated = new Set(prev);
        if (newEnabled) {
          updated.add(skillId);
        } else {
          updated.delete(skillId);
        }
        return updated;
      });
      // Reload skills to ensure consistency
      const assignment = getEmployeeSkills(employeeId);
      setEnabledSkills(new Set(assignment.enabledSkills || []));
    } catch (error) {
      console.error('Error toggling skill:', error);
      alert('Failed to toggle skill. Please try again.');
    }
  };

  // Filter skills based on selected filter
  const getFilteredSkills = () => {
    let filtered = skills;
    
    // Apply status filter
    if (skillFilter === 'enabled') {
      filtered = filtered.filter(skill => enabledSkills.has(skill.id));
    } else if (skillFilter === 'disabled') {
      filtered = filtered.filter(skill => !enabledSkills.has(skill.id));
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(skill => skill.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query)
      );
    }
    
    // Group by category
    const grouped = {};
    filtered.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    
    return grouped;
  };

  // Get category counts
  const getCategoryStats = () => {
    const stats = {};
    Object.values(skillCategories).forEach(category => {
      const categorySkills = skills.filter(s => s.category === category);
      const enabledCount = categorySkills.filter(s => enabledSkills.has(s.id)).length;
      stats[category] = {
        total: categorySkills.length,
        enabled: enabledCount
      };
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  const filteredSkillsByCategory = getFilteredSkills();
  const enabledCount = enabledSkills.size;
  const totalCount = skills.length;

  // Map skill IDs to their components
  const skillComponents = {
    'meeting-assistant': MeetingAssistant,
    'slack-integration': SlackIntegration,
    'jira-integration': JiraIntegration,
    'email-assistant': EmailAssistant,
    'note-taking': NoteTaking,
    'workflow-automation': WorkflowAutomation,
    'document-analysis': DocumentAnalysis,
    'task-management': TaskManagement,
    'calendar-management': CalendarManagement,
    'knowledge-base': KnowledgeBaseSearch,
    'research': Research
  };

  const renderSkillComponent = () => {
    if (!selectedSkill) return null;
    const SkillComponent = skillComponents[selectedSkill.id];
    if (!SkillComponent) return <div>Skill component not found</div>;
    return <SkillComponent employeeName={employee.name} employeeId={employeeId} />;
  };

  // Filter tour steps based on current UI state
  // Show all steps - users can follow along and switch tabs as needed
  const getFilteredTourSteps = () => {
    if (!employeeDetailTour) return [];
    
    // For now, return all steps. The tour will handle missing elements gracefully.
    // Users can follow the tour and switch tabs when instructed.
    return employeeDetailTour;
  };

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
          <div className="detail-header-actions">
            <button 
              onClick={() => setShowTour(true)} 
              className="help-button"
              title="How to use this page"
            >
              ❓ Help
            </button>
            <button 
              onClick={() => navigate(`/employees/${employeeId}/settings`)} 
              className="settings-button"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>

      <main className="detail-main">
        <div className="detail-container">
          <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
            <div className="tabs-container" data-tour-target="tabs-container">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={sidebarCollapsed ? tab.label : ''}
                  data-tab={tab.id}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {!sidebarCollapsed && <span className="tab-label">{tab.label}</span>}
                </button>
              ))}
            </div>
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
                    data-subtab="notes"
                  >
                    ✍️ Smart Note Maker
                  </button>
                  <button
                    className={`subtab-button ${educateSubTab === 'upload' ? 'active' : ''}`}
                    onClick={() => setEducateSubTab('upload')}
                    data-subtab="upload"
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

            {activeTab === 'skillset' && (
              <div className="tab-panel skillset-panel">
                {!selectedSkill ? (
                  <div className="skills-overview">
                    <div className="skills-overview-header">
                      <div className="skills-header-content">
                        <h3>Available Skills</h3>
                        <p>Choose skills to empower {employee.name}</p>
                      </div>
                      <div className="skills-progress-card">
                        <div className="progress-circle-wrapper">
                          <svg className="progress-circle" viewBox="0 0 36 36">
                            <path
                              className="progress-circle-bg"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="progress-circle-fill"
                              strokeDasharray={`${(enabledCount / totalCount) * 100}, 100`}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="progress-text">
                            <span className="progress-count">{enabledCount}</span>
                            <span className="progress-total">/{totalCount}</span>
                          </div>
                        </div>
                        <div className="progress-label">Skills Active</div>
                      </div>
                    </div>
                    
                    {/* Search and Filters */}
                    <div className="skills-controls">
                      <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          className="search-input"
                          placeholder="Search skills..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button 
                            className="search-clear"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      <div className="skills-filter-bar" data-tour-target="skills-filter-bar">
                        <div className="filter-group">
                          <label className="filter-label">Status:</label>
                          <button
                            className={`filter-button ${skillFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setSkillFilter('all')}
                          >
                            All
                          </button>
                          <button
                            className={`filter-button ${skillFilter === 'enabled' ? 'active' : ''}`}
                            onClick={() => setSkillFilter('enabled')}
                          >
                            ✓ Enabled
                          </button>
                          <button
                            className={`filter-button ${skillFilter === 'disabled' ? 'active' : ''}`}
                            onClick={() => setSkillFilter('disabled')}
                          >
                            ○ Disabled
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                      <button
                        className={`category-tab ${categoryFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setCategoryFilter('all')}
                      >
                        <span className="category-tab-name">All Categories</span>
                        <span className="category-tab-badge">{skills.length}</span>
                      </button>
                      {Object.entries(skillCategories).map(([key, category]) => (
                        <button
                          key={key}
                          className={`category-tab ${categoryFilter === category ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(category)}
                        >
                          <span className="category-tab-name">{category}</span>
                          <span className="category-tab-badge">
                            {categoryStats[category]?.enabled}/{categoryStats[category]?.total}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Skills Grid */}
                    <div className="skills-content">
                      {Object.keys(filteredSkillsByCategory).length === 0 ? (
                        <div className="no-skills-message">
                          <div className="no-skills-icon">🔍</div>
                          <h4>No skills found</h4>
                          <p>
                            {searchQuery 
                              ? `No skills match "${searchQuery}". Try a different search term.`
                              : 'No skills match the selected filters.'}
                          </p>
                          {(searchQuery || skillFilter !== 'all' || categoryFilter !== 'all') && (
                            <button 
                              className="reset-filters-btn"
                              onClick={() => {
                                setSearchQuery('');
                                setSkillFilter('all');
                                setCategoryFilter('all');
                              }}
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      ) : (
                        Object.entries(filteredSkillsByCategory).map(([category, categorySkills]) => (
                          <div key={category} className="skills-category-section">
                            <div className="skills-category-header-wrapper">
                              <h4 className="skills-category-header">{category}</h4>
                              <span className="category-skill-count">
                                {categorySkills.filter(s => enabledSkills.has(s.id)).length} / {categorySkills.length} enabled
                              </span>
                            </div>
                            <div className="skills-grid" data-tour-target="skills-grid">
                              {categorySkills.map((skill) => (
                                <SkillCard
                                  key={skill.id}
                                  skill={skill}
                                  onClick={handleSkillClick}
                                  isEnabled={enabledSkills.has(skill.id)}
                                  hasConfig={!!skillConfigs[skill.id]}
                                  onToggle={handleSkillToggle}
                                  employeeId={employeeId}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="skill-detail-view">
                    <button className="back-to-skills-btn" onClick={handleBackToSkills}>
                      ← Back to Skills
                    </button>
                    {renderSkillComponent()}
                  </div>
                )}
              </div>
            )}

{activeTab === 'workflows' && (
  <div className="tab-panel workflows-panel">
    <div className="workflows-container">
      {/* Hero Card */}
      <div className="workflow-hero-card">
        <div className="workflow-hero-content">
          <div className="workflow-hero-icons">
            <span className="workflow-icon"><FaFileAlt /></span>
            <span className="workflow-icon"><FaRobot /></span>
            <span className="workflow-icon"><FaDatabase /></span>
            <span className="workflow-icon-badge">+400</span>
          </div>
          <h2 className="workflow-hero-title">Give Your AI Employee Infinite Power with n8n Workflows</h2>
          <p className="workflow-hero-subtitle">Connect to 400+ apps and services. Automate everything. Build workflows that never sleep.</p>
          <a 
            href="https://n8n.io/workflows/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="workflow-hero-button"
          >
            <FaRocket /> Explore Workflow Templates
          </a>
        </div>
        <div className="workflow-hero-diagram">
          <img 
            src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/first_agent_58d4ee8882.png"
            alt="AI Agent Workflow Diagram"
            className="workflow-diagram-image"
          />
        </div>
      </div>
      {/* Workflow Template Grid */}
      <div className="workflow-template-grid">
        <div className="workflow-card">
          <div className="workflow-card-icons">
            <span className="card-icon"><FaChartBar /></span>
            <span className="card-icon"><FaPencilAlt /></span>
            <span className="card-icon telegram"><SiTelegram /></span>
            <span className="card-icon-badge">+6</span>
          </div>
          <h3 className="workflow-card-title">Personal Life Manager with Telegram, Google Services & Voice-Enabled AI</h3>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-icons">
            <span className="card-icon"><FaFileAlt /></span>
            <span className="card-icon"><FaRobot /></span>
            <span className="card-icon sheets"><SiGooglesheets /></span>
            <span className="card-icon-badge">+2</span>
          </div>
          <h3 className="workflow-card-title">Talk to Your Google Sheets Using ChatGPT-5</h3>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-icons">
            <span className="card-icon"><FaChartBar /></span>
            <span className="card-icon globe"><FaGlobe /></span>
            <span className="card-icon"><FaEdit /></span>
            <span className="card-icon-badge">+8</span>
          </div>
          <h3 className="workflow-card-title">Generate AI Viral Videos with VEO 3 and Upload to TikTok</h3>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-icons">
            <span className="card-icon"><FaComments /></span>
            <span className="card-icon"><FaRobot /></span>
            <span className="card-icon"><FaEnvelope /></span>
            <span className="card-icon-badge">+4</span>
          </div>
          <h3 className="workflow-card-title">AI Sales Assistant with CRM Integration & Email Follow-ups</h3>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-icons">
            <span className="card-icon"><FaEnvelope /></span>
            <span className="card-icon"><FaRobot /></span>
            <span className="card-icon"><FaChartBar /></span>
            <span className="card-icon-badge">+3</span>
          </div>
          <h3 className="workflow-card-title">Automated Email Responses with OpenAI & Sentiment Analysis</h3>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-icons">
            <span className="card-icon"><FaComments /></span>
            <span className="card-icon"><FaMicrophone /></span>
            <span className="card-icon"><SiTelegram /></span>
            <span className="card-icon-badge">+5</span>
          </div>
          <h3 className="workflow-card-title">Voice-Enabled Customer Support Bot with Slack Integration</h3>
        </div>
      </div>

      
    </div>
  </div>
)}
          </div>
        </div>
      </main>

      {/* Guided Tour */}
      <GuidedTour
        steps={getFilteredTourSteps()}
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        storageKey="employee-detail"
      />
    </div>
  );
}

export default EmployeeDetail;

