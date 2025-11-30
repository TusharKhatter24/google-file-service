// Service to manage organization-level data
// Stores organization settings in localStorage

const ORG_SETTINGS_KEY = 'organization_settings';
const TEAM_MEMBERS_KEY = 'organization_team_members';
const INTEGRATIONS_KEY = 'organization_integrations';

const DEFAULT_ORG_SETTINGS = {
  name: 'WizCommerce',
  description: 'WizCommerce is a leading e-commerce platform that empowers businesses to create, manage, and scale their online stores. We provide cutting-edge solutions for digital commerce, helping merchants deliver exceptional shopping experiences to their customers worldwide.',
  website: 'wizcommerce.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Get organization settings
 * @returns {Object} - Organization settings object
 */
export const getOrganizationSettings = () => {
  try {
    const settingsJson = localStorage.getItem(ORG_SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_ORG_SETTINGS;
  } catch (error) {
    console.error('Error getting organization settings:', error);
    return DEFAULT_ORG_SETTINGS;
  }
};

/**
 * Set organization settings
 * @param {Object} settings - Organization settings object
 */
export const setOrganizationSettings = (settings) => {
  try {
    const updatedSettings = {
      ...settings,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error setting organization settings:', error);
    throw error;
  }
};

/**
 * Get all team members
 * @returns {Array} - Array of team member objects
 */
export const getTeamMembers = () => {
  try {
    const membersJson = localStorage.getItem(TEAM_MEMBERS_KEY);
    if (membersJson) {
      return JSON.parse(membersJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting team members:', error);
    return [];
  }
};

/**
 * Add a team member
 * @param {Object} member - Team member object with name, email, role
 * @returns {Object} - Added team member with id
 */
export const addTeamMember = (member) => {
  try {
    const members = getTeamMembers();
    const newMember = {
      ...member,
      id: `member-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    members.push(newMember);
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
    return newMember;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

/**
 * Remove a team member
 * @param {string} memberId - Team member ID
 */
export const removeTeamMember = (memberId) => {
  try {
    const members = getTeamMembers();
    const filtered = members.filter(m => m.id !== memberId);
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
};

/**
 * Update a team member
 * @param {string} memberId - Team member ID
 * @param {Object} updates - Updates to apply
 */
export const updateTeamMember = (memberId, updates) => {
  try {
    const members = getTeamMembers();
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      members[index] = {
        ...members[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

/**
 * Get all integrations
 * @returns {Array} - Array of integration objects
 */
export const getIntegrations = () => {
  try {
    const integrationsJson = localStorage.getItem(INTEGRATIONS_KEY);
    if (integrationsJson) {
      return JSON.parse(integrationsJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting integrations:', error);
    return [];
  }
};

/**
 * Add an integration
 * @param {Object} integration - Integration object with name, type, config, etc.
 * @returns {Object} - Added integration with id
 */
export const addIntegration = (integration) => {
  try {
    const integrations = getIntegrations();
    const newIntegration = {
      ...integration,
      id: `integration-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: integration.status || 'active'
    };
    integrations.push(newIntegration);
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    return newIntegration;
  } catch (error) {
    console.error('Error adding integration:', error);
    throw error;
  }
};

/**
 * Remove an integration
 * @param {string} integrationId - Integration ID
 */
export const removeIntegration = (integrationId) => {
  try {
    const integrations = getIntegrations();
    const filtered = integrations.filter(i => i.id !== integrationId);
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing integration:', error);
    throw error;
  }
};

/**
 * Update an integration
 * @param {string} integrationId - Integration ID
 * @param {Object} updates - Updates to apply
 */
export const updateIntegration = (integrationId, updates) => {
  try {
    const integrations = getIntegrations();
    const index = integrations.findIndex(i => i.id === integrationId);
    if (index !== -1) {
      integrations[index] = {
        ...integrations[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    }
  } catch (error) {
    console.error('Error updating integration:', error);
    throw error;
  }
};

