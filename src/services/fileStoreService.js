import axios from 'axios';
import { API_KEY, API_BASE_URL, UPLOAD_API_BASE_URL } from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: API_KEY,
  },
});

/**
 * Create a new FileSearchStore
 */
export const createFileStore = async (displayName) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/fileSearchStores`, {
      displayName,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to create file store');
  }
};

/**
 * List all FileSearchStores
 */
export const listFileStores = async (pageSize = 20, pageToken = null) => {
  try {
    const params = { pageSize };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await apiClient.get(`${API_BASE_URL}/fileSearchStores`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to list file stores');
  }
};

/**
 * Get a specific FileSearchStore
 */
export const getFileStore = async (storeName) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/${storeName}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to get file store');
  }
};

/**
 * Delete a FileSearchStore
 */
export const deleteFileStore = async (storeName, force = false) => {
  try {
    const params = force ? { force: true } : {};
    const response = await apiClient.delete(`${API_BASE_URL}/${storeName}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to delete file store');
  }
};

/**
 * Upload a file to a FileSearchStore
 */
export const uploadFileToStore = async (storeName, file, displayName = null, customMetadata = null, chunkingConfig = null) => {
  try {
    const formData = new FormData();
    
    // Add metadata as JSON
    const metadata = {};
    if (displayName) metadata.displayName = displayName;
    if (customMetadata) metadata.customMetadata = customMetadata;
    if (chunkingConfig) metadata.chunkingConfig = chunkingConfig;
    
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('file', file);

    const response = await axios.post(
      `${UPLOAD_API_BASE_URL}/${storeName}:uploadToFileSearchStore?key=${API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to upload file');
  }
};

/**
 * Get operation status
 */
export const getOperationStatus = async (operationName) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/${operationName}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to get operation status');
  }
};

/**
 * List all documents in a FileSearchStore
 */
export const listDocuments = async (storeName, pageSize = 20, pageToken = null) => {
  try {
    const params = { pageSize };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await apiClient.get(`${API_BASE_URL}/${storeName}/documents`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to list documents');
  }
};

/**
 * Get a specific document
 */
export const getDocument = async (documentName) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/${documentName}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to get document');
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentName, force = false) => {
  try {
    const params = force ? { force: true } : {};
    const response = await apiClient.delete(`${API_BASE_URL}/${documentName}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || 'Failed to delete document');
  }
};

