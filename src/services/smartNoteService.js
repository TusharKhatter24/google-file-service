import { generateContentWithStore, listDocuments, getDocument } from './fileStoreService';

/**
 * Smart Note Service
 * Generates intelligent notes from multiple documents using AI
 */

/**
 * Generate notes from multiple documents
 * @param {Array<string>} documentNames - Array of document names to process
 * @param {string} storeName - Store name containing the documents
 * @param {Object} options - Options for note generation
 * @returns {Promise<string>} Generated notes
 */
export const generateNotesFromDocuments = async (documentNames, storeName, options = {}) => {
  try {
    const {
      includeSummary = true,
      includeKeyPoints = true,
      includeActionItems = true,
      includeTopics = true,
      format = 'structured'
    } = options;

    // Build focused prompt based on options - only request what's needed
    const sections = [];
    if (includeSummary) sections.push('summary');
    if (includeKeyPoints) sections.push('key points');
    if (includeActionItems) sections.push('action items');
    if (includeTopics) sections.push('main topics and themes');

    let prompt = '';
    
    if (sections.length === 0) {
      prompt = `Analyze the following documents and provide insights.\n\n`;
    } else if (sections.length === 1) {
      prompt = `Analyze the following documents and provide ONLY a ${sections[0]} section. Focus exclusively on ${sections[0]}. Do not include any other sections.\n\n`;
    } else {
      prompt = `Analyze the following documents and generate notes with ONLY the following sections: ${sections.join(', ')}. Do not include any other sections.\n\n`;
    }
    
    prompt += `Format the output in a clear, structured way.\n\n`;
    prompt += `Documents to analyze:\n`;
    
    // Add document references
    documentNames.forEach((docName, index) => {
      prompt += `${index + 1}. ${docName}\n`;
    });

    // Generate notes using AI
    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      {
        model: 'gemini-1.5-pro',
        temperature: 0.3,
      }
    );

    const candidates = response.candidates || [];
    const candidate = candidates[0];
    const textParts = candidate?.content?.parts || [];
    const notes = textParts
      .filter(part => part.text)
      .map(part => part.text)
      .join('\n') || 'No notes generated.';

    return notes;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to generate notes from documents'
    );
  }
};

/**
 * Synthesize information from multiple documents
 * @param {Array<string>} documentNames - Array of document names
 * @param {string} storeName - Store name
 * @returns {Promise<string>} Synthesized content
 */
export const synthesizeMultipleDocuments = async (documentNames, storeName) => {
  try {
    const prompt = `Synthesize information from the following documents. 
Find common themes, connections, and insights across all documents. 
Create a unified understanding that combines information from all sources.
Be comprehensive and highlight relationships between different documents.

Documents:
${documentNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      {
        model: 'gemini-1.5-pro',
        temperature: 0.4,
      }
    );

    const candidates = response.candidates || [];
    const candidate = candidates[0];
    const textParts = candidate?.content?.parts || [];
    return textParts
      .filter(part => part.text)
      .map(part => part.text)
      .join('\n') || 'No synthesis generated.';
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to synthesize documents'
    );
  }
};

/**
 * Extract key insights from documents
 * @param {Array<string>} documentNames - Array of document names
 * @param {string} storeName - Store name
 * @returns {Promise<string>} Key insights
 */
export const extractKeyInsights = async (documentNames, storeName) => {
  try {
    const prompt = `Extract the most important insights, findings, and takeaways from the following documents.
Focus on actionable insights, surprising findings, and key learnings.
Format as a clear list with explanations.

Documents:
${documentNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      {
        model: 'gemini-1.5-pro',
        temperature: 0.3,
      }
    );

    const candidates = response.candidates || [];
    const candidate = candidates[0];
    const textParts = candidate?.content?.parts || [];
    return textParts
      .filter(part => part.text)
      .map(part => part.text)
      .join('\n') || 'No insights extracted.';
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to extract insights'
    );
  }
};

/**
 * Generate action items from documents
 * @param {Array<string>} documentNames - Array of document names
 * @param {string} storeName - Store name
 * @returns {Promise<string>} Action items
 */
export const generateActionItems = async (documentNames, storeName) => {
  try {
    const prompt = `Extract all action items, tasks, and next steps from the following documents.
Include who should do what, deadlines if mentioned, and priorities.
Format as a clear, actionable list.

Documents:
${documentNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      {
        model: 'gemini-1.5-pro',
        temperature: 0.2,
      }
    );

    const candidates = response.candidates || [];
    const candidate = candidates[0];
    const textParts = candidate?.content?.parts || [];
    return textParts
      .filter(part => part.text)
      .map(part => part.text)
      .join('\n') || 'No action items found.';
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to generate action items'
    );
  }
};

/**
 * Cluster topics from documents
 * @param {Array<string>} documentNames - Array of document names
 * @param {string} storeName - Store name
 * @returns {Promise<string>} Topic clusters
 */
export const clusterTopics = async (documentNames, storeName) => {
  try {
    const prompt = `Identify and cluster the main topics, themes, and subjects covered in the following documents.
Group related topics together and provide a brief description of each cluster.
Show which documents relate to which topics.

Documents:
${documentNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`;

    const response = await generateContentWithStore(
      storeName,
      prompt,
      [],
      {
        model: 'gemini-1.5-pro',
        temperature: 0.3,
      }
    );

    const candidates = response.candidates || [];
    const candidate = candidates[0];
    const textParts = candidate?.content?.parts || [];
    return textParts
      .filter(part => part.text)
      .map(part => part.text)
      .join('\n') || 'No topics identified.';
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to cluster topics'
    );
  }
};

/**
 * Generate comprehensive notes with all features
 * @param {Array<string>} documentNames - Array of document names
 * @param {string} storeName - Store name
 * @returns {Promise<Object>} Comprehensive notes object
 */
export const generateComprehensiveNotes = async (documentNames, storeName) => {
  try {
    // Generate all sections in parallel with focused prompts
    const [summary, keyPoints, insights, actionItems, topics, synthesis] = await Promise.all([
      generateNotesFromDocuments(documentNames, storeName, {
        includeSummary: true,
        includeKeyPoints: false,
        includeActionItems: false,
        includeTopics: false,
      }),
      generateNotesFromDocuments(documentNames, storeName, {
        includeSummary: false,
        includeKeyPoints: true,
        includeActionItems: false,
        includeTopics: false,
      }),
      extractKeyInsights(documentNames, storeName),
      generateActionItems(documentNames, storeName),
      clusterTopics(documentNames, storeName),
      synthesizeMultipleDocuments(documentNames, storeName),
    ]);

    return {
      summary: summary || 'No summary generated.',
      keyPoints: keyPoints || 'No key points found.',
      insights: insights || 'No insights extracted.',
      actionItems: actionItems || 'No action items found.',
      topics: topics || 'No topics identified.',
      synthesis: synthesis || 'No synthesis generated.',
      generatedAt: new Date().toISOString(),
      documentCount: documentNames.length,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message ||
      error.message ||
      'Failed to generate comprehensive notes';
    throw new Error(errorMessage);
  }
};

