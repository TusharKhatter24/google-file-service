// Service to manage employee-specific configuration
// Stores configurations in localStorage

import { getEmployeeById } from '../data/employees';

const CONFIG_PREFIX = 'employee_config_';

const DEFAULT_CONFIG = {
  chat: {
    systemPrompt: '',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    selectedStores: [], // Array of selected knowledge base store names (max 5)
    // Re-ranking configuration
    enableReranking: false,      // Toggle for semantic re-ranking of sources
    rerankingTopK: 5,            // Number of top sources to keep after re-ranking
    minRelevanceScore: 0.3,      // Minimum relevance score threshold (0.0-1.0)
  },
  upload: {
    chunkingConfig: {
      chunkSize: 1000,
      chunkOverlap: 200,
    },
  },
  n8n: {
    workflowUrl: '',
  },
};

/**
 * Get configuration for an employee
 * @param {string} employeeId - The employee ID
 * @returns {Object} - The employee configuration
 */
export const getEmployeeConfig = (employeeId) => {
  try {
    const configJson = localStorage.getItem(`${CONFIG_PREFIX}${employeeId}`);
    const employee = getEmployeeById(employeeId);
    const defaultSystemPrompt = employee?.defaultSystemPrompt || '';
    
    if (configJson) {
      const savedConfig = JSON.parse(configJson);
      // Merge with defaults to ensure all fields exist
      const config = {
        chat: { 
          ...DEFAULT_CONFIG.chat, 
          ...(savedConfig.chat || {}),
          selectedStores: savedConfig.chat?.selectedStores || DEFAULT_CONFIG.chat.selectedStores,
        },
        upload: { ...DEFAULT_CONFIG.upload, ...(savedConfig.upload || {}) },
        n8n: { ...DEFAULT_CONFIG.n8n, ...(savedConfig.n8n || {}) },
      };
      
      // Initialize system prompt from employee default if not set
      if (!config.chat.systemPrompt && defaultSystemPrompt) {
        config.chat.systemPrompt = defaultSystemPrompt;
      }
      
      return config;
    }
    
    // Return default config with employee's default system prompt
    return {
      ...DEFAULT_CONFIG,
      chat: {
        ...DEFAULT_CONFIG.chat,
        systemPrompt: defaultSystemPrompt
      }
    };
  } catch (error) {
    console.error('Error getting employee config:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Save configuration for an employee
 * @param {string} employeeId - The employee ID
 * @param {Object} config - The configuration object
 */
export const setEmployeeConfig = (employeeId, config) => {
  try {
    localStorage.setItem(`${CONFIG_PREFIX}${employeeId}`, JSON.stringify(config));
  } catch (error) {
    console.error('Error setting employee config:', error);
    throw error;
  }
};

/**
 * Update a specific section of employee configuration
 * @param {string} employeeId - The employee ID
 * @param {string} section - The section name ('chat' or 'upload')
 * @param {Object} sectionConfig - The section configuration
 */
export const updateEmployeeConfigSection = (employeeId, section, sectionConfig) => {
  try {
    const currentConfig = getEmployeeConfig(employeeId);
    const updatedConfig = {
      ...currentConfig,
      [section]: { ...currentConfig[section], ...sectionConfig },
    };
    setEmployeeConfig(employeeId, updatedConfig);
  } catch (error) {
    console.error('Error updating employee config section:', error);
    throw error;
  }
};

/**
 * Reset configuration to defaults
 * @param {string} employeeId - The employee ID
 */
export const resetEmployeeConfig = (employeeId) => {
  try {
    localStorage.removeItem(`${CONFIG_PREFIX}${employeeId}`);
  } catch (error) {
    console.error('Error resetting employee config:', error);
    throw error;
  }
};

/**
 * Get default configuration
 * @returns {Object} - Default configuration
 */
export const getDefaultConfig = () => {
  return DEFAULT_CONFIG;
};

