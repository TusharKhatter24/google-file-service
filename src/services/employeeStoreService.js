// Service to manage employee-FileSearchStore associations
// Stores associations in localStorage

const STORAGE_PREFIX = 'employee_store_';

/**
 * Get the FileSearchStore name associated with an employee
 * @param {string} employeeId - The employee ID
 * @returns {string|null} - The FileSearchStore name or null if not set
 */
export const getEmployeeStore = (employeeId) => {
  try {
    const storeName = localStorage.getItem(`${STORAGE_PREFIX}${employeeId}`);
    return storeName || null;
  } catch (error) {
    console.error('Error getting employee store:', error);
    return null;
  }
};

/**
 * Associate a FileSearchStore with an employee
 * @param {string} employeeId - The employee ID
 * @param {string} storeName - The FileSearchStore name (e.g., "fileSearchStores/my-store")
 */
export const setEmployeeStore = (employeeId, storeName) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, storeName);
  } catch (error) {
    console.error('Error setting employee store:', error);
    throw error;
  }
};

/**
 * Remove the FileSearchStore association for an employee
 * @param {string} employeeId - The employee ID
 */
export const clearEmployeeStore = (employeeId) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${employeeId}`);
  } catch (error) {
    console.error('Error clearing employee store:', error);
    throw error;
  }
};

/**
 * Get all employee-store associations
 * @returns {Object} - Object mapping employeeId to storeName
 */
export const getAllEmployeeStores = () => {
  try {
    const associations = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const employeeId = key.replace(STORAGE_PREFIX, '');
        associations[employeeId] = localStorage.getItem(key);
      }
    }
    return associations;
  } catch (error) {
    console.error('Error getting all employee stores:', error);
    return {};
  }
};

