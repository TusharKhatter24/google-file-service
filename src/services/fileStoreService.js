import axios from "axios";
import { API_KEY, API_BASE_URL, UPLOAD_API_BASE_URL } from "../config";

// Create axios instance with default config
const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
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
    throw new Error(
      error.response?.data?.error?.message || "Failed to create file store"
    );
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
    const response = await apiClient.get(`${API_BASE_URL}/fileSearchStores`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to list file stores"
    );
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
    throw new Error(
      error.response?.data?.error?.message || "Failed to get file store"
    );
  }
};

/**
 * Delete a FileSearchStore
 */
export const deleteFileStore = async (storeName, force = false) => {
  try {
    const params = force ? { force: true } : {};
    const response = await apiClient.delete(`${API_BASE_URL}/${storeName}`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete file store"
    );
  }
};

/**
 * Upload a file to a FileSearchStore
 * Based on: https://ai.google.dev/api/file-search/file-search-stores#method:-media.uploadtofilesearchstore
 *
 * Request body (multipart/form-data):
 * - metadata: JSON string containing:
 *   - displayName (optional): Display name of the created document
 *   - customMetadata (optional): Array of custom metadata objects
 *   - chunkingConfig (optional): Config for chunking the data
 *   - mimeType (optional): MIME type of the data (e.g., image/jpeg, image/png, application/pdf)
 * - file: The actual file binary data
 */
export const uploadFileToStore = async (
  storeName,
  file,
  displayName = null,
  customMetadata = null,
  chunkingConfig = null,
  mimeType = null
) => {
  try {
    const formData = new FormData();

    // Add metadata as JSON
    const metadata = {};
    if (displayName) metadata.displayName = displayName;
    if (customMetadata) metadata.customMetadata = customMetadata;
    if (chunkingConfig) metadata.chunkingConfig = chunkingConfig;
    // Include mimeType if provided, otherwise use file.type if available
    if (mimeType) {
      metadata.mimeType = mimeType;
    } else if (file.type) {
      metadata.mimeType = file.type;
    }

    formData.append("metadata", JSON.stringify(metadata));
    formData.append("file", file);

    // Don't set Content-Type header - axios will set it automatically with the correct boundary
    const response = await axios.post(
      `${UPLOAD_API_BASE_URL}/${storeName}:uploadToFileSearchStore?key=${API_KEY}`,
      formData
      // {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to upload file"
    );
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
    throw new Error(
      error.response?.data?.error?.message || "Failed to get operation status"
    );
  }
};

/**
 * List all documents in a FileSearchStore
 */
export const listDocuments = async (
  storeName,
  pageSize = 20,
  pageToken = null
) => {
  try {
    const params = { pageSize };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await apiClient.get(
      `${API_BASE_URL}/${storeName}/documents`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to list documents"
    );
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
    throw new Error(
      error.response?.data?.error?.message || "Failed to get document"
    );
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentName, force = false) => {
  try {
    const params = force ? { force: true } : {};
    const response = await apiClient.delete(`${API_BASE_URL}/${documentName}`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete document"
    );
  }
};

/**
 * Import an existing file into a FileSearchStore
 * Based on: https://ai.google.dev/api/file-search/file-search-stores#method:-filesearchstores.importfile
 */
export const importFileToStore = async (
  storeName,
  fileName,
  customMetadata = null,
  chunkingConfig = null
) => {
  try {
    const requestBody = {
      fileName: fileName,
    };

    if (customMetadata) requestBody.customMetadata = customMetadata;
    if (chunkingConfig) requestBody.chunkingConfig = chunkingConfig;

    const response = await apiClient.post(
      `${API_BASE_URL}/${storeName}:importFile`,
      requestBody
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to import file"
    );
  }
};
