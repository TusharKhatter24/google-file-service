// Service to manage employee-specific configuration
// Stores configurations in localStorage

const CONFIG_PREFIX = 'employee_config_';

const DEFAULT_CONFIG = {
  chat: {
    systemPrompt: '',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  upload: {
    chunkingConfig: {
      chunkSize: 1000,
      chunkOverlap: 200,
    },
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
    if (configJson) {
      const savedConfig = JSON.parse(configJson);
      // Merge with defaults to ensure all fields exist
      return {
        chat: { ...DEFAULT_CONFIG.chat, ...(savedConfig.chat || {}) },
        upload: { ...DEFAULT_CONFIG.upload, ...(savedConfig.upload || {}) },
      };
    }
    return DEFAULT_CONFIG;
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

