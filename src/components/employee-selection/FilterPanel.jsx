import React, { useState, useMemo } from 'react';
import './FilterPanel.css';
import { getEmployeeConfig } from '../../services/employeeConfigService';

function FilterPanel({ filters, onFilterChange, isCollapsed, onToggleCollapse, employees = [] }) {
  // Extract unique values from employees
  const filterOptions = useMemo(() => {
    const departmentsSet = new Set();
    const personalitiesSet = new Set();
    const skillsSet = new Set();
    const modelTypesSet = new Set();

    employees.forEach(emp => {
      if (emp.department) departmentsSet.add(emp.department);
      if (emp.personality) personalitiesSet.add(emp.personality);
      if (emp.skills && Array.isArray(emp.skills)) {
        emp.skills.forEach(skill => skillsSet.add(skill));
      }
      
      // Get model type from employee config
      try {
        const config = getEmployeeConfig(emp.id);
        if (config?.chat?.model) {
          // Map model IDs to display names
          const modelDisplayNames = {
            'gemini-2.5-flash': 'Gemini 2.5 Flash',
            'gemini-2.0-flash-exp': 'Gemini 2.0 Flash Exp',
            'gemini-1.5-pro': 'Gemini 1.5 Pro',
          };
          const displayName = modelDisplayNames[config.chat.model] || config.chat.model;
          modelTypesSet.add(displayName);
        }
      } catch (e) {
        // Ignore errors
      }
    });

    // Add default model types if none found
    if (modelTypesSet.size === 0) {
      modelTypesSet.add('Gemini 2.5 Flash');
      modelTypesSet.add('Gemini 2.0 Flash Exp');
      modelTypesSet.add('Gemini 1.5 Pro');
    }

    return {
      departments: Array.from(departmentsSet).sort(),
      personalities: Array.from(personalitiesSet).sort(),
      skills: Array.from(skillsSet).sort(),
      modelTypes: Array.from(modelTypesSet).sort(),
    };
  }, [employees]);

  const { departments, personalities, skills, modelTypes } = filterOptions;
  const handleDepartmentToggle = (dept) => {
    const newDepartments = filters.departments.includes(dept)
      ? filters.departments.filter(d => d !== dept)
      : [...filters.departments, dept];
    onFilterChange({ ...filters, departments: newDepartments });
  };

  const handlePersonalityToggle = (personality) => {
    const newPersonalities = filters.personalities.includes(personality)
      ? filters.personalities.filter(p => p !== personality)
      : [...filters.personalities, personality];
    onFilterChange({ ...filters, personalities: newPersonalities });
  };

  const handleModelToggle = (model) => {
    const newModels = filters.models.includes(model)
      ? filters.models.filter(m => m !== model)
      : [...filters.models, model];
    onFilterChange({ ...filters, models: newModels });
  };

  const handleSkillToggle = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const clearAllFilters = () => {
    onFilterChange({
      departments: [],
      personalities: [],
      models: [],
      skills: [],
    });
  };

  const hasActiveFilters = 
    filters.departments.length > 0 ||
    filters.personalities.length > 0 ||
    filters.models.length > 0 ||
    filters.skills.length > 0;

  if (isCollapsed) {
    return (
      <button className="filter-panel-toggle" onClick={onToggleCollapse}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        Filters
      </button>
    );
  }

  return (
    <aside className={`filter-panel ${!isCollapsed ? 'open' : ''}`}>
      <div className="filter-panel-header">
        <h3 className="filter-panel-title">Filters</h3>
        <button className="filter-panel-close" onClick={onToggleCollapse}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={clearAllFilters}>
          Clear all filters
        </button>
      )}

      <div className="filter-section">
        <h4 className="filter-section-title">Department</h4>
        <div className="filter-options">
          {departments.map((dept) => (
            <label key={dept} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.departments.includes(dept)}
                onChange={() => handleDepartmentToggle(dept)}
              />
              <span>{dept}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-section-title">Personality</h4>
        <div className="filter-options">
          {personalities.map((personality) => (
            <label key={personality} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.personalities.includes(personality)}
                onChange={() => handlePersonalityToggle(personality)}
              />
              <span>{personality}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-section-title">Model Type</h4>
        <div className="filter-options">
          {modelTypes.map((model) => (
            <label key={model} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.models.includes(model)}
                onChange={() => handleModelToggle(model)}
              />
              <span>{model}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-section-title">Skills</h4>
        <div className="filter-options">
          {skills.map((skill) => (
            <label key={skill} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FilterPanel;

