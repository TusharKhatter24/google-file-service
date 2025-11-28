import { GoogleGenAI } from "@google/genai";
import { API_KEY } from "../config";

// Initialize the Google GenAI client
export const genaiClient = new GoogleGenAI({
  apiKey: API_KEY,
});

export default genaiClient;

