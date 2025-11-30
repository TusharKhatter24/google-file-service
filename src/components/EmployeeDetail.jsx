import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import { skills } from '../data/skills';
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
import './EmployeeDetail.css';

function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  const [activeTab, setActiveTab] = useState('chat');
  const [educateSubTab, setEducateSubTab] = useState('notes'); // 'notes' or 'upload'
  const [selectedSkill, setSelectedSkill] = useState(null);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'educate', label: 'Educate/Train', icon: '📚' },
    { id: 'skillset', label: 'Skillset', icon: '🎯' }
  ];

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
  };

  const handleBackToSkills = () => {
    setSelectedSkill(null);
  };

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
    'knowledge-base': KnowledgeBaseSearch
  };

  const renderSkillComponent = () => {
    if (!selectedSkill) return null;
    const SkillComponent = skillComponents[selectedSkill.id];
    if (!SkillComponent) return <div>Skill component not found</div>;
    return <SkillComponent employeeName={employee.name} employeeId={employeeId} />;
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

            {activeTab === 'skillset' && (
              <div className="tab-panel skillset-panel">
                {!selectedSkill ? (
                  <div className="skills-overview">
                    <div className="skills-overview-header">
                      <h3>Available Skills</h3>
                      <p>Choose a skill to empower {employee.name}</p>
                    </div>
                    <div className="skills-grid">
                      {skills.map((skill) => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          onClick={handleSkillClick}
                        />
                      ))}
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDetail;

