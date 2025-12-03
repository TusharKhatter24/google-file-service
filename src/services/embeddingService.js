import axios from "axios";
import { API_KEY, API_BASE_URL } from "../config";

const EMBEDDING_MODEL = "text-embedding-004";

/**
 * Get embedding for a single text using Gemini API
 * @param {string} text - The text to embed
 * @param {string} taskType - 'RETRIEVAL_QUERY' for queries, 'RETRIEVAL_DOCUMENT' for documents
 * @returns {Promise<number[]>} The embedding vector
 */
export const getEmbedding = async (text, taskType = "RETRIEVAL_QUERY") => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`,
      {
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text }],
        },
        taskType: taskType,
      }
    );
    return response.data.embedding.values;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to get embedding"
    );
  }
};

/**
 * Get embeddings for multiple texts in a single batch request
 * @param {string[]} texts - Array of texts to embed
 * @param {string} taskType - 'RETRIEVAL_QUERY' for queries, 'RETRIEVAL_DOCUMENT' for documents
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export const batchGetEmbeddings = async (
  texts,
  taskType = "RETRIEVAL_DOCUMENT"
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${API_KEY}`,
      {
        requests: texts.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: {
            parts: [{ text }],
          },
          taskType: taskType,
        })),
      }
    );
    return response.data.embeddings.map((e) => e.values);
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Failed to get batch embeddings"
    );
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Similarity score between -1 and 1
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Re-rank sources based on semantic similarity to the query
 * @param {string} query - The user's query
 * @param {Array} sources - Array of source objects with {title, text, fileSearchStore}
 * @param {Object} options - Re-ranking options
 * @param {number} options.topK - Number of top results to return (default: 5)
 * @param {number} options.minRelevanceScore - Minimum score threshold (default: 0.3)
 * @returns {Promise<Array>} Re-ranked sources with relevanceScore attached
 */
export const rerankSources = async (query, sources, options = {}) => {
  const { topK = 5, minRelevanceScore = 0.3 } = options;

  // Return empty array if no sources
  if (!sources || sources.length === 0) {
    return [];
  }

  // If only one source or fewer than topK, still calculate scores but skip re-ranking
  if (sources.length <= 1) {
    const queryEmbedding = await getEmbedding(query, "RETRIEVAL_QUERY");
    const docEmbeddings = await batchGetEmbeddings(
      sources.map((s) => s.text || s.title || ""),
      "RETRIEVAL_DOCUMENT"
    );

    return sources
      .map((source, idx) => ({
        ...source,
        relevanceScore: cosineSimilarity(queryEmbedding, docEmbeddings[idx]),
      }))
      .filter((s) => s.relevanceScore >= minRelevanceScore);
  }

  try {
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query, "RETRIEVAL_QUERY");

    // Get embeddings for all source texts in batch
    const sourceTexts = sources.map((s) => {
      // Combine title and text for better semantic matching
      const text = s.text || "";
      const title = s.title || "";
      return title ? `${title}: ${text}` : text;
    });

    const docEmbeddings = await batchGetEmbeddings(
      sourceTexts,
      "RETRIEVAL_DOCUMENT"
    );

    // Calculate similarity scores for each source
    const scoredSources = sources.map((source, idx) => ({
      ...source,
      relevanceScore: cosineSimilarity(queryEmbedding, docEmbeddings[idx]),
    }));

    // Sort by relevance score (descending)
    const sortedSources = scoredSources.sort(
      (a, b) => b.relevanceScore - a.relevanceScore
    );

    // Filter by minimum score and take top K
    const filteredSources = sortedSources
      .filter((s) => s.relevanceScore >= minRelevanceScore)
      .slice(0, topK);

    return filteredSources;
  } catch (error) {
    console.error("Error during re-ranking:", error);
    // Fall back to original sources if re-ranking fails
    return sources.slice(0, topK).map((s) => ({
      ...s,
      relevanceScore: null,
      rerankingError: error.message,
    }));
  }
};

/**
 * Calculate semantic similarity between query and a single document
 * Useful for on-the-fly relevance checking
 * @param {string} query - The user's query
 * @param {string} document - The document text
 * @returns {Promise<number>} Similarity score
 */
export const calculateRelevance = async (query, document) => {
  const [queryEmbedding, docEmbedding] = await Promise.all([
    getEmbedding(query, "RETRIEVAL_QUERY"),
    getEmbedding(document, "RETRIEVAL_DOCUMENT"),
  ]);

  return cosineSimilarity(queryEmbedding, docEmbedding);
};

