/**
 * Settings Service
 * Manages system prompt and other application settings stored in localStorage
 */

const SYSTEM_PROMPT_STORAGE_KEY = "wizcommerce_system_prompt";

/**
 * Default system prompt for Wizcommerce.com
 */
const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant for Wizcommerce.com, an e-commerce platform and internal tools company. 
Your role is to help team members manage documents, analyze knowledge, and assist with internal workflows.

Guidelines:
- Provide accurate, concise, and contextually relevant responses based on available documents
- Always cite sources when referencing specific documents from the knowledge base
- Be transparent about what information you have access to and any limitations
- Focus on being helpful for internal team operations and knowledge management
- Maintain a professional yet friendly tone appropriate for workplace collaboration
- When analyzing documents, identify key insights, action items, and relationships`;

/**
 * Get the default system prompt
 * @returns {string} Default system prompt
 */
export const getDefaultSystemPrompt = () => {
  return DEFAULT_SYSTEM_PROMPT;
};

/**
 * Get system prompt from localStorage or return default
 * @returns {string} System prompt
 */
export const getSystemPrompt = () => {
  try {
    const stored = localStorage.getItem(SYSTEM_PROMPT_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.error("Error loading system prompt:", error);
  }
  
  return DEFAULT_SYSTEM_PROMPT;
};

/**
 * Save system prompt to localStorage
 * @param {string} prompt - System prompt to save
 */
export const saveSystemPrompt = (prompt) => {
  try {
    if (prompt && prompt.trim()) {
      localStorage.setItem(SYSTEM_PROMPT_STORAGE_KEY, prompt.trim());
    } else {
      // If empty, remove from storage to use default
      localStorage.removeItem(SYSTEM_PROMPT_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving system prompt:", error);
    throw new Error("Failed to save system prompt");
  }
};

/**
 * Reset system prompt to default
 */
export const resetSystemPrompt = () => {
  try {
    localStorage.removeItem(SYSTEM_PROMPT_STORAGE_KEY);
  } catch (error) {
    console.error("Error resetting system prompt:", error);
    throw new Error("Failed to reset system prompt");
  }
};

