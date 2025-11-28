import genaiClient from "./genaiClient";

/**
 * Create a new FileSearchStore
 */
export const createFileStore = async (displayName) => {
  try {
    const response = await genaiClient.fileSearchStores.create({
      displayName,
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to create file store");
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
    const response = await genaiClient.fileSearchStores.list(params);

    // SDK returns array directly based on user's example: [{...}, {...}]
    // Normalize to expected format: { fileSearchStores: [...], nextPageToken: ... }

    let fileSearchStores = [];
    let nextPageToken = null;

    if (Array.isArray(response)) {
      // SDK returns array directly
      fileSearchStores = response;
    } else if (response && typeof response === "object") {
      // Check various possible response structures
      if (response.fileSearchStores) {
        fileSearchStores = response.fileSearchStores;
        nextPageToken = response.nextPageToken || null;
      } else if (response.data?.fileSearchStores) {
        fileSearchStores = response.data.fileSearchStores;
        nextPageToken = response.data.nextPageToken || null;
      } else if (response.results) {
        fileSearchStores = response.results;
        nextPageToken = response.nextPageToken || null;
      }
    }

    // Ensure we always return an array
    if (!Array.isArray(fileSearchStores)) {
      console.warn("Unexpected response format from SDK:", response);
      fileSearchStores = [];
    }

    const result = {
      fileSearchStores,
      nextPageToken,
    };

    console.log("listFileStores response:", result);
    return result;
  } catch (error) {
    console.error("Error listing file stores:", error);
    throw new Error(error.message || "Failed to list file stores");
  }
};

/**
 * Get a specific FileSearchStore
 */
export const getFileStore = async (storeName) => {
  try {
    const response = await genaiClient.fileSearchStores.get({
      name: storeName,
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to get file store");
  }
};

/**
 * Delete a FileSearchStore
 */
export const deleteFileStore = async (storeName, force = false) => {
  try {
    const params = { name: storeName };
    if (force) {
      params.force = true;
    }
    const response = await genaiClient.fileSearchStores.delete(params);
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to delete file store");
  }
};

/**
 * Upload a file to a FileSearchStore
 * Uses @google/genai SDK
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
    const config = {};
    if (displayName) config.displayName = displayName;
    if (customMetadata) config.customMetadata = customMetadata;
    if (chunkingConfig) config.chunkingConfig = chunkingConfig;
    if (mimeType) {
      config.mimeType = mimeType;
    } else if (file.type) {
      config.mimeType = file.type;
    }

    const response = await genaiClient.fileSearchStores.uploadToFileSearchStore(
      {
        fileSearchStoreName: storeName,
        file: file,
        config: Object.keys(config).length > 0 ? config : undefined,
      }
    );

    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to upload file");
  }
};

/**
 * Get operation status
 */
export const getOperationStatus = async (operationName) => {
  try {
    // Extract store name and operation ID from operationName
    // Format: fileSearchStores/{store}/operations/{operation}
    const response = await genaiClient.fileSearchStores.operations.get({
      name: operationName,
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to get operation status");
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
    const params = { parent: storeName, pageSize };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await genaiClient.fileSearchStores.documents.list(params);
    // SDK returns data directly, ensure it has documents property
    return {
      documents: response.documents || response || [],
      nextPageToken: response.nextPageToken,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to list documents");
  }
};

/**
 * Get a specific document
 */
export const getDocument = async (documentName) => {
  try {
    const response = await genaiClient.fileSearchStores.documents.get({
      name: documentName,
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to get document");
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentName, force = false) => {
  try {
    const params = { name: documentName };
    if (force) {
      params.force = true;
    }
    const response = await genaiClient.fileSearchStores.documents.delete(
      params
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to delete document");
  }
};

/**
 * Import an existing file into a FileSearchStore
 */
export const importFileToStore = async (
  storeName,
  fileName,
  customMetadata = null,
  chunkingConfig = null
) => {
  try {
    const params = {
      parent: storeName,
      fileName: fileName,
    };

    if (customMetadata) params.customMetadata = customMetadata;
    if (chunkingConfig) params.chunkingConfig = chunkingConfig;

    const response = await genaiClient.fileSearchStores.importFile(params);

    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to import file");
  }
};

/**
 * Generate content using Gemini API with FileSearchStore context
 * Uses @google/genai Chat SDK
 *
 * @param {string|Array<string>} storeNames - Single FileSearchStore name or array of names
 * @param {string} query - User's query/question
 * @param {Array} conversationHistory - Optional conversation history for context
 * @param {string} model - Model to use (default: "gemini-2.5-flash")
 * @returns {Promise<Object>} Generated content response
 */
export const generateContentWithStore = async (
  storeNames,
  query,
  conversationHistory = [],
  model = "gemini-2.5-flash"
) => {
  try {
    // Normalize storeNames to array
    const storeNamesArray = Array.isArray(storeNames)
      ? storeNames
      : [storeNames];

    // Build history for Chat SDK
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role || "user",
      parts: [{ text: msg.text }],
    }));

    // Create chat instance with file search tools
    const chat = genaiClient.chats.create({
      model: model,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: storeNamesArray,
            },
          },
        ],
      },
      history: history,
    });

    // Send message
    const response = await chat.sendMessage({
      message: query,
    });

    // Chat SDK returns GenerateContentResponse with candidates array
    // Ensure response structure matches expected format
    if (response.candidates && response.candidates.length > 0) {
      return response;
    }

    // Fallback: construct response from text if candidates not present
    return {
      candidates: [
        {
          content: {
            parts: response.text ? [{ text: response.text }] : [],
            role: "model",
          },
          groundingMetadata: response.groundingMetadata,
          finishReason: response.finishReason,
        },
      ],
    };
  } catch (error) {
    throw new Error(error.message || "Failed to generate content");
  }
};
