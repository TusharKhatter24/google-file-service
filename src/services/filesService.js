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
 * Upload a file using media.upload
 * Based on: https://ai.google.dev/api/files
 */
export const uploadFile = async (file, displayName = null) => {
  try {
    const formData = new FormData();

    // Add metadata as JSON string
    const metadata = {
      displayName: displayName || file.name,
      indexingConfig: {
        fileContentType: file.type || "application/octet-stream",
      },
    };

    formData.append("metadata", JSON.stringify(metadata));
    formData.append("file", file);

    const response = await axios.post(
      `${UPLOAD_API_BASE_URL}/files?key=${API_KEY}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Handle different possible response structures
    // The API might return the file object directly or wrapped
    const responseData = response.data;
    
    // If response has a file property, use it
    if (responseData.file && responseData.file.name) {
      return responseData.file;
    }
    
    // If response has a name property directly, return it
    if (responseData.name) {
      return responseData;
    }
    
    // If response is wrapped in a different structure, try to find the file object
    // Log the response structure for debugging
    console.warn('Unexpected upload response structure:', responseData);
    
    // Return the response data as-is and let the caller handle it
    return responseData;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to upload file"
    );
  }
};

/**
 * List all files
 */
export const listFiles = async (pageSize = 20, pageToken = null) => {
  try {
    const params = { pageSize };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await apiClient.get(`${API_BASE_URL}/files`, { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to list files"
    );
  }
};

/**
 * Get a specific file
 * Based on: https://ai.google.dev/api/files#method:-files.get
 *
 * Endpoint: GET https://generativelanguage.googleapis.com/v1beta/{name=files/*}
 *
 * @param {string} fileName - The file resource name (e.g., "files/{file_id}")
 * @returns {Promise<Object>} File object containing:
 *   - name: Resource name
 *   - displayName: Display name
 *   - mimeType: MIME type
 *   - sizeBytes: Size in bytes
 *   - createTime: Creation timestamp
 *   - updateTime: Update timestamp
 *   - expirationTime: Expiration timestamp (if scheduled)
 *   - sha256Hash: SHA-256 hash
 *   - uri: File URI
 *   - downloadUri: Download URI
 *   - state: Processing state (STATE_UNSPECIFIED, PROCESSING, ACTIVE, FAILED)
 *   - source: Source of the file (SOURCE_UNSPECIFIED, UPLOADED, GENERATED, REGISTERED)
 *   - error: Error status if processing failed
 *   - metadata: File metadata (videoMetadata for videos)
 */
export const getFile = async (fileName) => {
  try {
    // Ensure fileName is in the correct format (files/{file_id})
    // Files from listFiles API already have the "files/" prefix
    const fileResourceName = fileName.startsWith("files/")
      ? fileName
      : `files/${fileName}`;

    // Endpoint: GET https://generativelanguage.googleapis.com/v1beta/files/{file_id}
    const response = await apiClient.get(`${API_BASE_URL}/${fileResourceName}`);

    // The API returns the File object directly in response.data
    // Response contains: name, displayName, mimeType, sizeBytes, uri, downloadUri, state, etc.
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to get file"
    );
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (fileName) => {
  try {
    const response = await apiClient.delete(`${API_BASE_URL}/${fileName}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete file"
    );
  }
};

/**
 * Extract/download file content using downloadUri
 */
export const extractFileContent = async (file) => {
  try {
    // Always fetch full file details to ensure we have downloadUri
    let fileData;
    if (typeof file === "string") {
      fileData = await getFile(file);
    } else {
      // If file object is passed but doesn't have downloadUri, fetch full details
      if (!file.downloadUri && file.name) {
        fileData = await getFile(file.name);
      } else {
        fileData = file;
      }
    }

    // Check if downloadUri exists
    if (!fileData.downloadUri) {
      throw new Error(
        "File does not have a download URI. This file type may not support direct download. " +
          "The file URI is: " +
          (fileData.uri || "N/A") +
          ". You can use this file with the Gemini API for content generation."
      );
    }

    // Download the file content using downloadUri
    const response = await axios.get(fileData.downloadUri, {
      responseType:
        fileData.mimeType?.includes("text") ||
        fileData.mimeType === "application/json"
          ? "text"
          : "blob",
      params: {
        key: API_KEY,
      },
    });

    return {
      content: response.data,
      mimeType: fileData.mimeType || "application/octet-stream",
      fileName: fileData.displayName || fileData.name,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to extract file content"
    );
  }
};

/**
 * Extract text content from a file (for text-based files)
 */
export const extractTextContent = async (file) => {
  try {
    // Always fetch full file details
    let fileData;
    if (typeof file === "string") {
      fileData = await getFile(file);
    } else {
      // If file object is passed but doesn't have downloadUri, fetch full details
      if (!file.downloadUri && file.name) {
        fileData = await getFile(file.name);
      } else {
        fileData = file;
      }
    }

    // Check if downloadUri exists
    if (!fileData.downloadUri) {
      // For PDFs and other files without downloadUri, try using Gemini API to extract text
      if (fileData.mimeType === "application/pdf" && fileData.uri) {
        return await extractTextFromFileUsingGemini(fileData);
      }
      throw new Error(
        "File does not have a download URI. This file type may not support direct text extraction. " +
          "The file URI is: " +
          (fileData.uri || "N/A") +
          ". You can use this file with the Gemini API for content generation."
      );
    }

    // Use downloadUri to get text content
    const response = await axios.get(fileData.downloadUri, {
      responseType: "text",
      params: {
        key: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to extract text content"
    );
  }
};

/**
 * Extract text from a file using Gemini API (for PDFs and files without downloadUri)
 */
export const extractTextFromFileUsingGemini = async (fileData) => {
  try {
    // Use Gemini API to extract text from the file
    const response = await apiClient.post(
      `${API_BASE_URL}/models/gemini-1.5-flash:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                fileData: {
                  mimeType: fileData.mimeType,
                  fileUri: fileData.uri,
                },
              },
              {
                text: "Extract all text content from this file. Return only the text content without any additional formatting or explanations.",
              },
            ],
          },
        ],
      }
    );

    // Extract text from the response
    const textParts = response.data.candidates?.[0]?.content?.parts || [];
    const extractedText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    if (!extractedText) {
      throw new Error("No text content could be extracted from the file.");
    }

    return extractedText;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to extract text using Gemini API"
    );
  }
};
