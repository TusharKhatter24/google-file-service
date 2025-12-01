import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { skills } from '../../data/skills';
import { getEmployeeSkills, toggleSkill } from '../../services/skillAssignmentService';
import Card from '../Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import EmptyState from '../ui/EmptyState';
import SkillCard from '../SkillCard';
import './SkillsPage.css';

function SkillsPage() {
  const { employeeId } = useParams();
  const [activeTab, setActiveTab] = useState('installed'); // 'installed' or 'marketplace'
  const [enabledSkills, setEnabledSkills] = useState(new Set());
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    if (employeeId) {
      const assignment = getEmployeeSkills(employeeId);
      setEnabledSkills(new Set(assignment.enabledSkills || []));
    }
  }, [employeeId]);

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
    } catch (error) {
      console.error('Error toggling skill:', error);
      alert('Failed to toggle skill. Please try again.');
    }
  };

  const installedSkills = skills.filter(skill => enabledSkills.has(skill.id));
  const marketplaceSkills = skills.filter(skill => !enabledSkills.has(skill.id));

  const getSkillsByCategory = (skillsList) => {
    const grouped = {};
    skillsList.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  };

  const installedByCategory = getSkillsByCategory(installedSkills);
  const marketplaceByCategory = getSkillsByCategory(marketplaceSkills);

  return (
    <div className="skills-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">Manage capabilities and install new skills for your AI employee.</p>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'installed' ? 'active' : ''}`}
            onClick={() => setActiveTab('installed')}
          >
            Installed ({installedSkills.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace ({marketplaceSkills.length})
          </button>
        </div>

        {activeTab === 'installed' ? (
          <div className="skills-content">
            {installedSkills.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No skills installed"
                description="Browse the marketplace to find and install skills for your AI employee."
                action={() => setActiveTab('marketplace')}
                actionLabel="Browse Marketplace"
              />
            ) : (
              Object.entries(installedByCategory).map(([category, categorySkills]) => (
                <div key={category} className="skills-category-section">
                  <h3 className="category-title">{category}</h3>
                  <div className="skills-grid">
                    {categorySkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onClick={() => setSelectedSkill(skill)}
                        isEnabled={true}
                        onToggle={handleSkillToggle}
                        employeeId={employeeId}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="skills-content">
            {marketplaceSkills.length === 0 ? (
              <EmptyState
                icon="✨"
                title="All skills installed"
                description="You've installed all available skills. Check back later for new additions!"
              />
            ) : (
              Object.entries(marketplaceByCategory).map(([category, categorySkills]) => (
                <div key={category} className="skills-category-section">
                  <h3 className="category-title">{category}</h3>
                  <div className="skills-grid">
                    {categorySkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onClick={() => setSelectedSkill(skill)}
                        isEnabled={false}
                        onToggle={handleSkillToggle}
                        employeeId={employeeId}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedSkill && (
        <div className="skill-modal" onClick={() => setSelectedSkill(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSkill.name}</h3>
              <button className="close-btn" onClick={() => setSelectedSkill(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="skill-description">{selectedSkill.description}</p>
              <div className="skill-meta">
                <Badge variant="secondary">{selectedSkill.category}</Badge>
                {enabledSkills.has(selectedSkill.id) && (
                  <Badge variant="success">Installed</Badge>
                )}
              </div>
              <div className="modal-actions">
                <Button
                  variant={enabledSkills.has(selectedSkill.id) ? 'secondary' : 'primary'}
                  onClick={() => {
                    handleSkillToggle(selectedSkill.id);
                    setSelectedSkill(null);
                  }}
                >
                  {enabledSkills.has(selectedSkill.id) ? 'Disable Skill' : 'Install Skill'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillsPage;

