import axios from "axios";
import { PERPLEXITY_API_KEY, PERPLEXITY_API_BASE_URL } from "../config";

// Create axios instance with default config
const researchApiClient = axios.create({
  baseURL: PERPLEXITY_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
  },
});

/**
 * Perform research using Perplexity Research API
 * @param {string} query - The research query/question
 * @returns {Promise<string>} Detailed research report with citations
 */
export const performResearch = async (query) => {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("Perplexity API key is not configured. Please set VITE_PERPLEXITY_API_KEY in your environment variables.");
  }

  if (!query || !query.trim()) {
    throw new Error("Research query cannot be empty.");
  }

  try {
    // Use Perplexity's research model (sonar-pro for advanced research with web access)
    // Note: llama-3.1-sonar-large-128k-online was deprecated Feb 22, 2025
    // Current supported models: 'sonar' and 'sonar-pro'
    const response = await researchApiClient.post(
      "/chat/completions",
      {
        model: "sonar-pro", // Research model with web access (use 'sonar' for standard research)
        messages: [
          {
            role: "system",
            content: "You are a helpful research assistant. Provide detailed, well-researched answers with citations. Focus on accuracy and comprehensive information about APIs, tools, errors, and technical documentation."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }
    );

    const researchResult = response.data?.choices?.[0]?.message?.content;
    
    if (!researchResult) {
      throw new Error("No research results returned from Perplexity API");
    }

    // Format the research report with citations if available
    let formattedReport = researchResult;

    // Add citations if available in the response
    if (response.data?.citations && response.data.citations.length > 0) {
      formattedReport += "\n\n## Sources:\n\n";
      response.data.citations.forEach((citation, index) => {
        formattedReport += `${index + 1}. ${citation}\n`;
      });
    }

    return formattedReport;
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          "Failed to perform research";
      throw new Error(`Perplexity API Error: ${errorMessage}`);
    } else if (error.request) {
      throw new Error("Unable to connect to Perplexity API. Please check your internet connection.");
    } else {
      throw new Error(error.message || "Failed to perform research");
    }
  }
};

/**
 * Research external tools, APIs, and technical documentation
 * @param {string} topic - The topic to research (e.g., "Stripe API payment methods", "React useState hook")
 * @param {string} focus - Optional focus area (e.g., "API payload", "errors", "supported features")
 * @returns {Promise<string>} Research report
 */
export const researchExternalTool = async (topic, focus = null) => {
  let query = `Research ${topic}`;
  
  if (focus) {
    query += ` focusing on ${focus}`;
  }
  
  query += ". Include information about API endpoints, request/response formats, error handling, supported features, and any relevant documentation or examples.";

  return await performResearch(query);
};

