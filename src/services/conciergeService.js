import { generateContentWithStore } from "./fileStoreService";
import { listFileStores, listDocuments } from "./fileStoreService";

/**
 * Donna Service
 * Provides proactive suggestions, insights, and recommendations based on stored knowledge
 */

/**
 * Analyze store content and generate insights
 * @param {string|Array<string>} storeNames - Store name(s) to analyze
 * @returns {Promise<Object>} Insights object
 */
export const generateInsights = async (storeNames) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Analyze all documents in the file store(s) and provide comprehensive insights:

1. **Key Topics & Themes**: Identify the main topics and themes across all documents
2. **Document Relationships**: Identify how documents relate to each other
3. **Knowledge Gaps**: Identify areas where information might be missing or incomplete
4. **Trends & Patterns**: Identify any trends or patterns in the content
5. **Action Items**: Extract any action items or tasks mentioned
6. **Important Information**: Highlight the most important information

Format the response as a structured JSON object with these sections. Be specific and actionable.`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const insightsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    // Try to parse as JSON, fallback to text
    let insights;
    try {
      insights = JSON.parse(insightsText);
    } catch {
      // If not JSON, structure it manually
      insights = {
        topics: extractTopics(insightsText),
        relationships: extractRelationships(insightsText),
        knowledgeGaps: extractKnowledgeGaps(insightsText),
        trends: extractTrends(insightsText),
        actionItems: extractActionItems(insightsText),
        importantInfo: insightsText,
      };
    }

    return insights;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to generate insights"
    );
  }
};

/**
 * Generate proactive recommendations based on content analysis
 * @param {string|Array<string>} storeNames - Store name(s) to analyze
 * @param {string} context - Optional context about current work
 * @returns {Promise<Array>} Array of recommendations
 */
export const generateRecommendations = async (storeNames, context = null) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    let prompt = `Based on all documents in the file store(s), provide proactive recommendations for improvement:

1. **Writing Style Improvements**: Suggest ways to improve writing consistency and quality
2. **Content Gaps**: Identify topics that should be covered but aren't
3. **Related Documents**: Suggest documents that should be reviewed together
4. **Action Items**: Highlight any pending action items
5. **Best Practices**: Suggest best practices based on the content patterns

${context ? `Current context: ${context}` : ""}

Format as a JSON array of recommendation objects with: {type, title, description, priority, actionItems}`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const recommendationsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    // Try to parse as JSON array
    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
      if (!Array.isArray(recommendations)) {
        recommendations = [recommendations];
      }
    } catch {
      // If not JSON, parse from text
      recommendations = parseRecommendationsFromText(recommendationsText);
    }

    return recommendations;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to generate recommendations"
    );
  }
};

/**
 * Analyze writing style and suggest improvements
 * @param {string|Array<string>} storeNames - Store name(s) to analyze
 * @param {string} currentText - Current text being written
 * @returns {Promise<Object>} Style analysis and suggestions
 */
export const analyzeWritingStyle = async (storeNames, currentText) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Analyze the writing style of documents in the file store(s) and compare it with the following current text:

Current Text:
${currentText}

Provide:
1. **Style Consistency**: How well does the current text match the style of existing documents?
2. **Improvements**: Specific suggestions to make the text more consistent
3. **Tone Analysis**: Identify the tone of existing documents and suggest tone adjustments
4. **Formatting Suggestions**: Suggest formatting improvements based on document patterns

Format as JSON with: {consistent, suggestions, tone, formatting}`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const analysisText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = {
        consistent: analysisText.includes("consistent") || analysisText.includes("matches"),
        suggestions: extractSuggestions(analysisText),
        tone: extractTone(analysisText),
        formatting: extractFormatting(analysisText),
      };
    }

    return analysis;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to analyze writing style"
    );
  }
};

/**
 * Detect patterns across documents
 * @param {string|Array<string>} storeNames - Store name(s) to analyze
 * @returns {Promise<Object>} Detected patterns
 */
export const detectPatterns = async (storeNames) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Analyze all documents in the file store(s) and detect patterns:

1. **Content Patterns**: Recurring topics, themes, or structures
2. **Writing Patterns**: Common writing styles, formats, or structures
3. **Temporal Patterns**: Changes over time (if dates are available)
4. **Relationship Patterns**: How documents typically relate to each other
5. **Usage Patterns**: Common workflows or processes mentioned

Format as JSON with: {contentPatterns, writingPatterns, temporalPatterns, relationshipPatterns, usagePatterns}`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const patternsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let patterns;
    try {
      patterns = JSON.parse(patternsText);
    } catch {
      patterns = {
        contentPatterns: extractListItems(patternsText, "content"),
        writingPatterns: extractListItems(patternsText, "writing"),
        temporalPatterns: extractListItems(patternsText, "temporal"),
        relationshipPatterns: extractListItems(patternsText, "relationship"),
        usagePatterns: extractListItems(patternsText, "usage"),
      };
    }

    return patterns;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to detect patterns"
    );
  }
};

/**
 * Get context-aware suggestions for current work
 * @param {string|Array<string>} storeNames - Store name(s) to use
 * @param {string} currentContext - Current work context
 * @returns {Promise<Array>} Context-aware suggestions
 */
export const getContextAwareSuggestions = async (storeNames, currentContext) => {
  try {
    const storeNamesArray = Array.isArray(storeNames) ? storeNames : [storeNames];
    
    const prompt = `Based on the knowledge in the file store(s) and the current work context, provide specific, actionable suggestions:

Current Context:
${currentContext}

Provide suggestions for:
1. Relevant information from the knowledge base
2. Related documents to review
3. Best practices based on similar past work
4. Potential improvements or considerations
5. Missing information that should be included

Format as a JSON array of suggestion objects with: {type, title, description, relevance, source}`;

    const response = await generateContentWithStore(
      storeNamesArray,
      prompt,
      [],
      "gemini-2.5-flash"
    );

    const candidate = response.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const suggestionsText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    let suggestions;
    try {
      suggestions = JSON.parse(suggestionsText);
      if (!Array.isArray(suggestions)) {
        suggestions = [suggestions];
      }
    } catch {
      suggestions = parseSuggestionsFromText(suggestionsText);
    }

    return suggestions;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to get context-aware suggestions"
    );
  }
};

// Helper functions for parsing text responses

function extractTopics(text) {
  const topicMatches = text.match(/topics?[:\-]?\s*([^\n]+)/i);
  return topicMatches ? topicMatches[1].split(/[,;]/).map(t => t.trim()) : [];
}

function extractRelationships(text) {
  const relationshipMatches = text.match(/relationships?[:\-]?\s*([^\n]+)/i);
  return relationshipMatches ? relationshipMatches[1] : "";
}

function extractKnowledgeGaps(text) {
  const gapMatches = text.match(/knowledge gaps?[:\-]?\s*([^\n]+)/i);
  return gapMatches ? gapMatches[1] : "";
}

function extractTrends(text) {
  const trendMatches = text.match(/trends?[:\-]?\s*([^\n]+)/i);
  return trendMatches ? trendMatches[1] : "";
}

function extractActionItems(text) {
  const actionMatches = text.match(/(?:action items?|tasks?)[:\-]?\s*([^\n]+)/i);
  return actionMatches ? actionMatches[1].split(/[•\-\*]/).map(a => a.trim()).filter(a => a) : [];
}

function extractSuggestions(text) {
  const suggestionMatches = text.match(/suggestions?[:\-]?\s*([^\n]+)/i);
  return suggestionMatches ? suggestionMatches[1].split(/[•\-\*]/).map(s => s.trim()).filter(s => s) : [];
}

function extractTone(text) {
  const toneMatches = text.match(/tone[:\-]?\s*([^\n]+)/i);
  return toneMatches ? toneMatches[1] : "";
}

function extractFormatting(text) {
  const formattingMatches = text.match(/formatting[:\-]?\s*([^\n]+)/i);
  return formattingMatches ? formattingMatches[1] : "";
}

function extractListItems(text, keyword) {
  const regex = new RegExp(`${keyword}[:\-]?\\s*([^\\n]+)`, "i");
  const matches = text.match(regex);
  return matches ? matches[1].split(/[•\-\*]/).map(item => item.trim()).filter(item => item) : [];
}

function parseRecommendationsFromText(text) {
  const recommendations = [];
  const lines = text.split("\n").filter(line => line.trim());
  
  let currentRec = null;
  for (const line of lines) {
    if (line.match(/^\d+\.|^[-*•]/)) {
      if (currentRec) recommendations.push(currentRec);
      currentRec = {
        type: "general",
        title: line.replace(/^\d+\.|^[-*•]\s*/, "").trim(),
        description: "",
        priority: "medium",
        actionItems: [],
      };
    } else if (currentRec && line.trim()) {
      currentRec.description += (currentRec.description ? " " : "") + line.trim();
    }
  }
  if (currentRec) recommendations.push(currentRec);
  
  return recommendations.length > 0 ? recommendations : [{ type: "general", title: "No recommendations", description: text }];
}

function parseSuggestionsFromText(text) {
  const suggestions = [];
  const lines = text.split("\n").filter(line => line.trim());
  
  for (const line of lines) {
    if (line.match(/^\d+\.|^[-*•]/)) {
      suggestions.push({
        type: "general",
        title: line.replace(/^\d+\.|^[-*•]\s*/, "").trim(),
        description: "",
        relevance: "medium",
        source: "knowledge base",
      });
    }
  }
  
  return suggestions.length > 0 ? suggestions : [{ type: "general", title: "No suggestions", description: text }];
}

