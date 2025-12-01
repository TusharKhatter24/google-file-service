// API Configuration
// Get your API key from: https://ai.google.dev/
export const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
export const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
export const UPLOAD_API_BASE_URL =
  "https://generativelanguage.googleapis.com/upload/v1beta";

// Perplexity API Configuration
// Get your API key from: https://www.perplexity.ai/
export const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || "";
export const PERPLEXITY_API_BASE_URL = "https://api.perplexity.ai";
