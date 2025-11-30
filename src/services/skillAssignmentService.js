// Service to manage employee skill assignments
// Stores skill assignments in localStorage

import { skills } from '../data/skills';

const STORAGE_PREFIX = 'employee_skills_';

/**
 * Get default enabled skills based on skill type
 * Global skills are enabled by default, configurable skills are disabled
 * @returns {Array<string>} - Array of skill IDs that should be enabled by default
 */
const getDefaultEnabledSkills = () => {
  return skills
    .filter(skill => skill.isGlobal)
    .map(skill => skill.id);
};

/**
 * Initialize skill assignments for an employee with defaults
 * @param {string} employeeId - The employee ID
 * @returns {Object} - Initialized skill assignment object
 */
const initializeEmployeeSkills = (employeeId) => {
  const defaultEnabled = getDefaultEnabledSkills();
  const assignment = {
    enabledSkills: [...defaultEnabled],
    skillConfigs: {},
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, JSON.stringify(assignment));
  return assignment;
};

/**
 * Get skill assignments for an employee
 * @param {string} employeeId - The employee ID
 * @returns {Object} - Skill assignment object with enabledSkills, skillConfigs, and lastUpdated
 */
export const getEmployeeSkills = (employeeId) => {
  try {
    const assignmentJson = localStorage.getItem(`${STORAGE_PREFIX}${employeeId}`);
    if (assignmentJson) {
      return JSON.parse(assignmentJson);
    }
    // Initialize with defaults if not found
    return initializeEmployeeSkills(employeeId);
  } catch (error) {
    console.error('Error getting employee skills:', error);
    return initializeEmployeeSkills(employeeId);
  }
};

/**
 * Check if a specific skill is enabled for an employee
 * @param {string} employeeId - The employee ID
 * @param {string} skillId - The skill ID
 * @returns {boolean} - True if skill is enabled
 */
export const isSkillEnabled = (employeeId, skillId) => {
  const assignment = getEmployeeSkills(employeeId);
  return assignment.enabledSkills.includes(skillId);
};

/**
 * Enable a skill for an employee
 * @param {string} employeeId - The employee ID
 * @param {string} skillId - The skill ID
 */
export const enableSkill = (employeeId, skillId) => {
  try {
    const assignment = getEmployeeSkills(employeeId);
    if (!assignment.enabledSkills.includes(skillId)) {
      assignment.enabledSkills.push(skillId);
      assignment.lastUpdated = new Date().toISOString();
      localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, JSON.stringify(assignment));
    }
  } catch (error) {
    console.error('Error enabling skill:', error);
    throw error;
  }
};

/**
 * Disable a skill for an employee
 * @param {string} employeeId - The employee ID
 * @param {string} skillId - The skill ID
 */
export const disableSkill = (employeeId, skillId) => {
  try {
    const assignment = getEmployeeSkills(employeeId);
    assignment.enabledSkills = assignment.enabledSkills.filter(id => id !== skillId);
    assignment.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, JSON.stringify(assignment));
  } catch (error) {
    console.error('Error disabling skill:', error);
    throw error;
  }
};

/**
 * Toggle a skill's enabled/disabled state for an employee
 * @param {string} employeeId - The employee ID
 * @param {string} skillId - The skill ID
 * @returns {boolean} - New enabled state (true if enabled, false if disabled)
 */
export const toggleSkill = (employeeId, skillId) => {
  const isEnabled = isSkillEnabled(employeeId, skillId);
  if (isEnabled) {
    disableSkill(employeeId, skillId);
    return false;
  } else {
    enableSkill(employeeId, skillId);
    return true;
  }
};

/**
 * Get skill-specific configuration for an employee
 * @param {string} employeeId - The employee ID
 * @param {string} skillId - The skill ID
 * @returns {Object|null} - Skill configuration object or null if not configured
 */
export const getSkillConfig = (employeeId, skillId) => {
  const assignment = getEmployeeSkills(employeeId);
  return assignment.skillConfigs[skillId] || null;
};

/**
 * Set skill-specific configuration for an employee
 * @param {string} employeeId - The employee ID
 * @param {string} skillId - The skill ID
 * @param {Object} config - Configuration object
 */
export const setSkillConfig = (employeeId, skillId, config) => {
  try {
    const assignment = getEmployeeSkills(employeeId);
    assignment.skillConfigs[skillId] = config;
    assignment.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, JSON.stringify(assignment));
  } catch (error) {
    console.error('Error setting skill config:', error);
    throw error;
  }
};

/**
 * Get all employee skill assignments (for organization view)
 * @returns {Object} - Object mapping employeeId to skill assignment
 */
export const getAllEmployeeSkills = () => {
  try {
    const assignments = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const employeeId = key.replace(STORAGE_PREFIX, '');
        assignments[employeeId] = JSON.parse(localStorage.getItem(key));
      }
    }
    return assignments;
  } catch (error) {
    console.error('Error getting all employee skills:', error);
    return {};
  }
};

/**
 * Reset skill assignments for an employee to defaults
 * @param {string} employeeId - The employee ID
 */
export const resetEmployeeSkills = (employeeId) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${employeeId}`);
    return initializeEmployeeSkills(employeeId);
  } catch (error) {
    console.error('Error resetting employee skills:', error);
    throw error;
  }
};

