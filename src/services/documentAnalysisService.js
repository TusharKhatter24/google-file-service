import { generateContentWithStore, listDocuments } from "./fileStoreService";
import { generateInsights, detectPatterns } from "./conciergeService";

/**
 * Document Analysis Service
 * Provides batch processing, topic extraction, relationship mapping, and summary generation
 */

// Cache for analysis results
const analysisCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Analyze all documents in a store
 * @param {string} storeName - Store name to analyze
 * @param {boolean} useCache - Whether to use cached results
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeStoreDocuments = async (storeName, useCache = true) => {
  try {
    // Check cache
    const cacheKey = `store_${storeName}`;
    if (useCache && analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    // Get all documents
    const documents = await getAllDocuments(storeName);
    
    if (documents.length === 0) {
      return {
        summaries: [],
        topics: [],
        relationships: [],
        actionItems: [],
        trends: [],
      };
    }

    // Generate comprehensive analysis
    const analysis = await generateComprehensiveAnalysis(storeName, documents);

    // Cache results
    if (useCache) {
      analysisCache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now(),
      });
    }

    return analysis;
  } catch (error) {
    throw new Error(
      error.message || "Failed to analyze store documents"
    );
  }
};

/**
 * Get all documents from a store (with pagination)
 * @param {string} storeName - Store name
 * @returns {Promise<Array>} All documents
 */
async function getAllDocuments(storeName) {
  const allDocuments = [];
  let pageToken = null;

  do {
    const response = await listDocuments(storeName, 20, pageToken);
    if (response.documents) {
      allDocuments.push(...response.documents);
    }
    pageToken = response.nextPageToken || null;
  } while (pageToken);

  return allDocuments;
}

/**
 * Generate comprehensive analysis of documents
 * @param {string} storeName - Store name
 * @param {Array} documents - Documents to analyze
 * @returns {Promise<Object>} Analysis results
 */
async function generateComprehensiveAnalysis(storeName, documents) {
  try {
    // Use insights and patterns from concierge service
    const [insights, patterns] = await Promise.all([
      generateInsights(storeName),
      detectPatterns(storeName),
    ]);

    // Extract topics
    const topics = await extractTopics(storeName, documents);

    // Extract action items
    const actionItems = await extractActionItems(storeName);

    // Generate summaries
    const summaries = await generateDocumentSummaries(storeName, documents);

    // Map relationships
    const relationships = await mapDocumentRelationships(storeName, documents);

    return {
      summaries,
      topics,
      relationships,
      actionItems,
      trends: patterns.temporalPatterns || [],
      insights: insights,
      patterns: patterns,
    };
  } catch (error) {
    console.error("Error in comprehensive analysis:", error);
    // Return partial results
    return {
      summaries: [],
      topics: [],
      relationships: [],
      actionItems: [],
      trends: [],
      error: error.message,
    };
  }
}

/**
 * Extract topics from documents
 * @param {string} storeName - Store name
 * @param {Array} documents - Documents to analyze
 * @returns {Promise<Array>} Extracted topics
 */
export const extractTopics = async (storeName, documents = null) => {
  try {
    const prompt = `Analyze all documents in the file store and extract the main topics and themes. 
    
Provide a comprehensive list of topics, organized by:
1. Primary topics (most frequently mentioned)
2. Secondary topics (related or supporting topics)
3. Emerging topics (new or developing themes)

For each topic, provide:
- Topic name
- Frequency/importance
- Related documents (if document list is provided)
- Brief description

Format as a JSON array of topic objects with: {name, frequency, importance, description, relatedDocuments}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const topicsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let topics;
    try {
      topics = JSON.parse(topicsText);
      if (!Array.isArray(topics)) {
        topics = [topics];
      }
    } catch {
      // Parse from text
      topics = parseTopicsFromText(topicsText);
    }

    return topics;
  } catch (error) {
    throw new Error(
      error.message || "Failed to extract topics"
    );
  }
};

/**
 * Extract action items from documents
 * @param {string} storeName - Store name
 * @returns {Promise<Array>} Extracted action items
 */
export const extractActionItems = async (storeName) => {
  try {
    const prompt = `Extract all action items, tasks, and to-dos from documents in the file store.

For each action item, provide:
- Description
- Priority (if mentioned)
- Due date (if mentioned)
- Assignee (if mentioned)
- Related document
- Status (if mentioned)

Format as a JSON array of action item objects with: {description, priority, dueDate, assignee, document, status}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const actionItemsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let actionItems;
    try {
      actionItems = JSON.parse(actionItemsText);
      if (!Array.isArray(actionItems)) {
        actionItems = [actionItems];
      }
    } catch {
      // Parse from text
      actionItems = parseActionItemsFromText(actionItemsText);
    }

    return actionItems;
  } catch (error) {
    throw new Error(
      error.message || "Failed to extract action items"
    );
  }
};

/**
 * Generate summaries for documents
 * @param {string} storeName - Store name
 * @param {Array} documents - Documents to summarize
 * @param {number} maxDocuments - Maximum number of documents to summarize at once
 * @returns {Promise<Array>} Document summaries
 */
export const generateDocumentSummaries = async (
  storeName,
  documents,
  maxDocuments = 20
) => {
  try {
    // Limit batch size
    const documentsToSummarize = documents.slice(0, maxDocuments);

    const prompt = `Generate concise summaries for documents in the file store. 
    
For each document, provide:
- Document title/name
- Main points (3-5 key points)
- Purpose/objective
- Key takeaways

Format as a JSON array of summary objects with: {documentName, title, mainPoints, purpose, takeaways}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const summariesText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let summaries;
    try {
      summaries = JSON.parse(summariesText);
      if (!Array.isArray(summaries)) {
        summaries = [summaries];
      }
    } catch {
      // Create summaries from document list
      summaries = documentsToSummarize.map((doc, index) => ({
        documentName: doc.name,
        title: doc.displayName || `Document ${index + 1}`,
        mainPoints: [],
        purpose: "Document in knowledge base",
        takeaways: summariesText,
      }));
    }

    return summaries;
  } catch (error) {
    throw new Error(
      error.message || "Failed to generate document summaries"
    );
  }
};

/**
 * Map relationships between documents
 * @param {string} storeName - Store name
 * @param {Array} documents - Documents to analyze
 * @returns {Promise<Array>} Document relationships
 */
export const mapDocumentRelationships = async (storeName, documents) => {
  try {
    const prompt = `Analyze relationships between documents in the file store.

Identify:
1. Documents that reference each other
2. Documents with similar topics or themes
3. Documents that are part of a sequence or workflow
4. Documents that build upon each other
5. Document clusters or groups

Format as a JSON array of relationship objects with: {document1, document2, relationshipType, strength, description}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const relationshipsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let relationships;
    try {
      relationships = JSON.parse(relationshipsText);
      if (!Array.isArray(relationships)) {
        relationships = [relationships];
      }
    } catch {
      // Create basic relationships from document pairs
      relationships = createBasicRelationships(documents);
    }

    return relationships;
  } catch (error) {
    throw new Error(
      error.message || "Failed to map document relationships"
    );
  }
};

/**
 * Detect trends over time
 * @param {string} storeName - Store name
 * @returns {Promise<Object>} Trend analysis
 */
export const detectTrends = async (storeName) => {
  try {
    const prompt = `Analyze documents in the file store to detect trends over time.

Identify:
1. Topics that are increasing in frequency
2. Topics that are decreasing in frequency
3. New topics that have emerged
4. Topics that have become less relevant
5. Overall content evolution patterns

Format as JSON with: {increasingTopics, decreasingTopics, emergingTopics, decliningTopics, evolution}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const trendsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let trends;
    try {
      trends = JSON.parse(trendsText);
    } catch {
      trends = {
        increasingTopics: [],
        decreasingTopics: [],
        emergingTopics: [],
        decliningTopics: [],
        evolution: trendsText,
      };
    }

    return trends;
  } catch (error) {
    throw new Error(
      error.message || "Failed to detect trends"
    );
  }
};

/**
 * Synthesize knowledge from multiple documents
 * @param {string|Array<string>} storeNames - Store name(s)
 * @param {string} query - Query to synthesize knowledge for
 * @returns {Promise<string>} Synthesized knowledge
 */
export const synthesizeKnowledge = async (storeNames, query) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Synthesize information from all documents in the file store(s) to answer the following query:

Query: ${query}

Provide a comprehensive answer that:
1. Combines relevant information from multiple documents
2. Identifies patterns and connections
3. Highlights key insights
4. Notes any contradictions or gaps
5. Provides actionable conclusions

Format as a well-structured response with clear sections.`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const synthesizedText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    return synthesizedText;
  } catch (error) {
    throw new Error(
      error.message || "Failed to synthesize knowledge"
    );
  }
};

// Helper functions

function parseTopicsFromText(text) {
  const topics = [];
  const lines = text.split("\n").filter(line => line.trim());
  
  for (const line of lines) {
    if (line.match(/^\d+\.|^[-*•]|^[A-Z]/)) {
      const topicName = line.replace(/^\d+\.|^[-*•]\s*/, "").split(/[:\-]/)[0].trim();
      if (topicName) {
        topics.push({
          name: topicName,
          frequency: "medium",
          importance: "medium",
          description: line,
          relatedDocuments: [],
        });
      }
    }
  }
  
  return topics.length > 0 ? topics : [{ name: "General", frequency: "low", importance: "low", description: text }];
}

function parseActionItemsFromText(text) {
  const actionItems = [];
  const lines = text.split("\n").filter(line => line.trim());
  
  for (const line of lines) {
    if (line.match(/^\d+\.|^[-*•]|^(?:TODO|ACTION|TASK)/i)) {
      actionItems.push({
        description: line.replace(/^\d+\.|^[-*•]\s*|^(?:TODO|ACTION|TASK):?\s*/i, "").trim(),
        priority: line.toLowerCase().includes("high") ? "high" : 
                 line.toLowerCase().includes("low") ? "low" : "medium",
        dueDate: null,
        assignee: null,
        document: null,
        status: "pending",
      });
    }
  }
  
  return actionItems;
}

function createBasicRelationships(documents) {
  const relationships = [];
  
  // Create basic relationships for documents with similar names or in sequence
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const doc1 = documents[i];
      const doc2 = documents[j];
      
      // Check for similar names
      const name1 = (doc1.displayName || doc1.name || "").toLowerCase();
      const name2 = (doc2.displayName || doc2.name || "").toLowerCase();
      
      if (name1 && name2 && (name1.includes(name2.substring(0, 5)) || name2.includes(name1.substring(0, 5)))) {
        relationships.push({
          document1: doc1.name,
          document2: doc2.name,
          relationshipType: "similar",
          strength: "medium",
          description: "Documents with similar names",
        });
      }
    }
  }
  
  return relationships;
}

/**
 * Clear analysis cache
 * @param {string} storeName - Optional store name to clear, or clear all if not provided
 */
export const clearAnalysisCache = (storeName = null) => {
  if (storeName) {
    analysisCache.delete(`store_${storeName}`);
  } else {
    analysisCache.clear();
  }
};

