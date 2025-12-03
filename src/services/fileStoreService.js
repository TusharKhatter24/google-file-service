import axios from "axios";
import { API_KEY, API_BASE_URL, UPLOAD_API_BASE_URL } from "../config";
import { rerankSources } from "./embeddingService";

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

/**
 * Generate content using Gemini API with FileSearchStore context
 * Based: https://ai.google.dev/api/file-search/file-search-stores
 *
 * @param {string|Array<string>} storeNames - The FileSearchStore name(s)
 * @param {string} query - User's query/question
 * @param {Array} conversationHistory - Optional conversation history for context
 * @param {Object} options - Optional configuration
 * @param {string} options.model - Model to use (default: "gemini-2.5-flash")
 * @param {string} options.systemPrompt - System instruction/prompt
 * @param {number} options.temperature - Temperature (0.0-2.0, default: 0.7)
 * @param {number} options.topP - Top P (0.0-1.0, default: 0.95)
 * @param {number} options.topK - Top K (default: 40)
 * @param {number} options.maxOutputTokens - Max output tokens (default: 8192)
 * @param {Array} options.attachedFiles - Optional array of attached files with { uri, mimeType }
 * @returns {Promise<Object>} Generated content response
 */
export const generateContentWithStore = async (
  storeNames,
  query,
  conversationHistory = [],
  options = {}
) => {
  try {
    const {
      model = "gemini-2.5-flash",
      systemPrompt = null,
      temperature = null,
      topP = null,
      topK = null,
      maxOutputTokens = null,
      attachedFiles = [],
    } = options;

    // Normalize storeNames to array
    const storeNamesArray = Array.isArray(storeNames)
      ? storeNames
      : [storeNames];

    // Build contents array with conversation history and current query
    const contents = [];

    // Add system instruction if provided
    if (systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
      contents.push({
        role: "model",
        parts: [{ text: "Understood." }],
      });
    }

    // Add conversation history
    conversationHistory.forEach((msg) => {
      // Map 'assistant' to 'model' for API compatibility
      const role = msg.role === "assistant" ? "model" : msg.role || "user";
      contents.push({
        role: role,
        parts: [{ text: msg.text }],
      });
    });

    // Build parts array for current user query
    const userParts = [{ text: query }];
    
    // Add attached files as fileData parts
    if (attachedFiles && attachedFiles.length > 0) {
      attachedFiles.forEach((file) => {
        if (file.uri && file.mimeType) {
          userParts.push({
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri,
            },
          });
        }
      });
    }

    // Add current user query with attached files
    contents.push({
      role: "user",
      parts: userParts,
    });

    const requestBody = {
      contents: contents,
      tools: [
        {
          file_search: {
            file_search_store_names: storeNamesArray,
          },
        },
      ],
    };

    // Add generation config if any parameters are provided
    const generationConfig = {};
    if (temperature !== null && temperature !== undefined) {
      generationConfig.temperature = temperature;
    }
    if (topP !== null && topP !== undefined) {
      generationConfig.topP = topP;
    }
    if (topK !== null && topK !== undefined) {
      generationConfig.topK = topK;
    }
    if (maxOutputTokens !== null && maxOutputTokens !== undefined) {
      generationConfig.maxOutputTokens = maxOutputTokens;
    }

    if (Object.keys(generationConfig).length > 0) {
      requestBody.generationConfig = generationConfig;
    }

    const response = await apiClient.post(
      `${API_BASE_URL}/models/${model}:generateContent`,
      requestBody
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to generate content"
    );
  }
};

/**
 * Generate audio (TTS) using Gemini API with FileSearchStore context
 * Based on: https://ai.google.dev/gemini-api/docs/speech-generation
 *
 * Note: TTS models don't support multiturn chat, so we first generate text response
 * then convert it to audio
 *
 * @param {string|Array<string>} storeNames - Single FileSearchStore name or array of names
 * @param {string} query - User's query/question
 * @param {Array} conversationHistory - Optional conversation history for context (used for text generation only)
 * @param {string} voiceName - Voice name (default: "Kore")
 * @param {string} textModel - Model for text generation (default: "gemini-2.5-flash")
 * @param {string} ttsModel - Model for TTS (default: "gemini-2.5-flash-preview-tts")
 * @param {Array} attachedFiles - Optional array of attached files with { uri, mimeType }
 * @returns {Promise<Object>} Generated audio response with base64 audio data
 */
export const generateAudioWithStore = async (
  storeNames,
  query,
  conversationHistory = [],
  voiceName = "Kore",
  textModel = "gemini-2.5-flash",
  ttsModel = "gemini-2.5-flash-preview-tts",
  attachedFiles = []
) => {
  try {
    // Normalize storeNames to array
    const storeNamesArray = Array.isArray(storeNames)
      ? storeNames
      : [storeNames];

    // Step 1: Generate text response with conversation history and file attachments
    const textContents = [];
    conversationHistory.forEach((msg) => {
      const role = msg.role === "assistant" ? "model" : msg.role || "user";
      textContents.push({
        role: role,
        parts: [{ text: msg.text }],
      });
    });
    
    // Build parts array for current user query with file attachments
    const userParts = [{ text: query }];
    if (attachedFiles && attachedFiles.length > 0) {
      attachedFiles.forEach((file) => {
        if (file.uri && file.mimeType) {
          userParts.push({
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri,
            },
          });
        }
      });
    }
    
    textContents.push({
      role: "user",
      parts: userParts,
    });

    const textRequestBody = {
      contents: textContents,
      tools: [
        {
          file_search: {
            file_search_store_names: storeNamesArray,
          },
        },
      ],
    };

    const textResponse = await apiClient.post(
      `${API_BASE_URL}/models/${textModel}:generateContent`,
      textRequestBody
    );

    // Extract text response
    const candidate = textResponse.data.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const responseText =
      textParts
        .filter((part) => part.text)
        .map((part) => part.text)
        .join("\n") || "No response generated.";

    // Step 2: Convert text to audio using TTS model (no conversation history, no tools)
    const audioRequestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: responseText }],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      },
    };

    const audioResponse = await apiClient.post(
      `${API_BASE_URL}/models/${ttsModel}:generateContent`,
      audioRequestBody
    );

    // Return audio response with text for display
    return {
      ...audioResponse.data,
      textResponse: responseText, // Include the text response for display
      groundingMetadata: candidate?.groundingMetadata, // Include sources
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to generate audio"
    );
  }
};

/**
 * Generate content with post-retrieval semantic re-ranking
 * This wrapper calls generateContentWithStore and then re-ranks the sources
 * using embedding-based similarity scoring
 *
 * @param {string|Array<string>} storeNames - The FileSearchStore name(s)
 * @param {string} query - User's query/question
 * @param {Array} conversationHistory - Optional conversation history for context
 * @param {Object} options - Optional configuration (same as generateContentWithStore plus re-ranking options)
 * @param {boolean} options.enableReranking - Whether to enable re-ranking (default: true)
 * @param {number} options.rerankingTopK - Number of top sources to keep (default: 5)
 * @param {number} options.minRelevanceScore - Minimum relevance score threshold (default: 0.3)
 * @returns {Promise<Object>} Generated content response with re-ranked sources
 */
export const generateContentWithReranking = async (
  storeNames,
  query,
  conversationHistory = [],
  options = {}
) => {
  const {
    enableReranking = true,
    rerankingTopK = 5,
    minRelevanceScore = 0.3,
    ...generateOptions
  } = options;

  // Get the initial response from file search
  const response = await generateContentWithStore(
    storeNames,
    query,
    conversationHistory,
    generateOptions
  );

  // If re-ranking is disabled, return the original response
  if (!enableReranking) {
    return response;
  }

  // Extract grounding chunks (sources) from the response
  const candidate = response.candidates?.[0];
  const groundingMetadata = candidate?.groundingMetadata;
  const groundingChunks = groundingMetadata?.groundingChunks || [];

  // If no sources, return original response
  if (groundingChunks.length === 0) {
    return response;
  }

  // Convert grounding chunks to source objects for re-ranking
  const sources = groundingChunks.map((chunk) => ({
    title: chunk.retrievedContext?.title || "Unknown",
    text: chunk.retrievedContext?.text || "",
    fileSearchStore: chunk.retrievedContext?.fileSearchStore || "",
    originalChunk: chunk,
  }));

  try {
    // Re-rank the sources using embedding-based similarity
    const rerankedSources = await rerankSources(query, sources, {
      topK: rerankingTopK,
      minRelevanceScore: minRelevanceScore,
    });

    // Rebuild grounding chunks with re-ranked sources
    const rerankedGroundingChunks = rerankedSources.map((source) => ({
      ...source.originalChunk,
      retrievedContext: {
        ...source.originalChunk?.retrievedContext,
        title: source.title,
        text: source.text,
        fileSearchStore: source.fileSearchStore,
      },
      relevanceScore: source.relevanceScore,
    }));

    // Create updated response with re-ranked sources
    const updatedResponse = {
      ...response,
      candidates: response.candidates?.map((cand, idx) => {
        if (idx === 0) {
          return {
            ...cand,
            groundingMetadata: {
              ...cand.groundingMetadata,
              groundingChunks: rerankedGroundingChunks,
              rerankingApplied: true,
              originalSourceCount: groundingChunks.length,
              rerankedSourceCount: rerankedGroundingChunks.length,
            },
          };
        }
        return cand;
      }),
    };

    return updatedResponse;
  } catch (rerankError) {
    // If re-ranking fails, log error and return original response
    console.error("Re-ranking failed, returning original sources:", rerankError);
    
    // Add error info to metadata but keep original sources
    return {
      ...response,
      candidates: response.candidates?.map((cand, idx) => {
        if (idx === 0) {
          return {
            ...cand,
            groundingMetadata: {
              ...cand.groundingMetadata,
              rerankingApplied: false,
              rerankingError: rerankError.message,
            },
          };
        }
        return cand;
      }),
    };
  }
};
