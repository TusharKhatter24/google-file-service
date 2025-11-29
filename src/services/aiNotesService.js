import axios from "axios";
import { API_KEY, API_BASE_URL } from "../config";
import { generateContentWithStore } from "./fileStoreService";
import { getSystemPrompt } from "./settingsService";

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
 * Generate content using Gemini API
 * @param {string} prompt - The prompt/instruction for the AI
 * @param {string} text - The text to process
 * @param {Array<string>} storeNames - Optional file store names for context
 * @param {string} model - Model to use (default: "gemini-2.5-flash")
 * @returns {Promise<string>} Generated text response
 */
const generateContent = async (prompt, text, storeNames = null, model = "gemini-2.5-flash") => {
  try {
    let responseData;

    if (storeNames && storeNames.length > 0) {
      // Use context-aware generation with file stores
      // generateContentWithStore already returns response.data
      responseData = await generateContentWithStore(
        storeNames,
        `${prompt}\n\nText:\n${text}`,
        [],
        model
      );
    } else {
      // Use standalone generation
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${prompt}\n\nText:\n${text}` }],
          },
        ],
      };

      // Add system instruction if available
      const systemPrompt = getSystemPrompt();
      if (systemPrompt && systemPrompt.trim()) {
        requestBody.systemInstruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      const response = await apiClient.post(
        `${API_BASE_URL}/models/${model}:generateContent`,
        requestBody
      );
      responseData = response.data;
    }

    // Extract text from response - both paths now have the same structure
    const candidate = responseData.candidates?.[0];
    const textParts = candidate?.content?.parts || [];
    const generatedText = textParts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("\n");

    if (!generatedText) {
      throw new Error("No response generated from AI");
    }

    return generatedText;
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to generate content"
    );
  }
};

/**
 * Summarize selected text
 * @param {string} text - Text to summarize
 * @param {Array<string>} storeNames - Optional file store names for context
 * @returns {Promise<string>} Summarized text
 */
export const summarizeText = async (text, storeNames = null) => {
  const prompt = `Please provide a concise summary of the following text. Focus on the main points and key information.`;
  return await generateContent(prompt, text, storeNames);
};

/**
 * Rewrite/improve text with custom instruction
 * @param {string} text - Text to rewrite
 * @param {string} instruction - Custom instruction (e.g., "make it more formal", "simplify", "expand")
 * @param {Array<string>} storeNames - Optional file store names for context
 * @returns {Promise<string>} Rewritten text
 */
export const rewriteText = async (text, instruction = "improve the writing", storeNames = null) => {
  const prompt = `Please ${instruction} the following text while maintaining its original meaning and key information. Return only the improved text without any explanations.`;
  return await generateContent(prompt, text, storeNames);
};

/**
 * Extract key points and action items
 * @param {string} text - Text to analyze
 * @param {Array<string>} storeNames - Optional file store names for context
 * @returns {Promise<string>} Extracted key points and action items
 */
export const extractKeyPoints = async (text, storeNames = null) => {
  const prompt = `Extract the key points and action items from the following text. Format them as a clear, organized list. Include:
- Main topics and themes
- Important decisions
- Action items (if any)
- Key takeaways

Return only the extracted information without additional commentary.`;
  return await generateContent(prompt, text, storeNames);
};

/**
 * Improve grammar, spelling, and formatting
 * @param {string} text - Text to improve
 * @param {Array<string>} storeNames - Optional file store names for context
 * @returns {Promise<string>} Improved text
 */
export const improveText = async (text, storeNames = null) => {
  const prompt = `Please improve the following text by:
- Fixing any grammar and spelling errors
- Improving sentence structure and clarity
- Enhancing formatting and readability
- Maintaining the original meaning and tone

Return only the improved text without any explanations or comments.`;
  return await generateContent(prompt, text, storeNames);
};

/**
 * Generate auto-complete suggestions
 * @param {string} partialText - Partial text to complete
 * @param {Array<string>} storeNames - Optional file store names for context
 * @param {number} maxLength - Maximum length of completion (default: 100 words)
 * @returns {Promise<string>} Completion suggestion
 */
export const autoComplete = async (partialText, storeNames = null, maxLength = 100) => {
  const prompt = `Continue writing from where the following text ends. Complete the thought naturally and coherently. Keep the completion to approximately ${maxLength} words or less. Return only the continuation text without repeating the original text.`;
  return await generateContent(prompt, partialText, storeNames);
};

/**
 * Generate a document from a prompt with AI assistance
 * @param {string} prompt - Document topic or requirements
 * @param {string} documentType - Type of document (e.g., "meeting notes", "report", "summary")
 * @param {Array<string>} storeNames - Optional file store names for context
 * @returns {Promise<string>} Generated document content
 */
export const generateDocument = async (prompt, documentType = "document", storeNames = null) => {
  const docPrompt = `Generate a complete ${documentType} based on the following requirements:

${prompt}

The document should:
1. Be well-structured and professional
2. Include all relevant sections for a ${documentType}
3. Be comprehensive and detailed
4. Follow best practices for ${documentType} writing
5. Be ready for use

Return the complete document content.`;
  
  return await generateContent(docPrompt, "", storeNames);
};

/**
 * Transcribe audio using Web Speech API
 * @param {Blob} audioBlob - Audio blob to transcribe
 * @returns {Promise<string>} Transcribed text
 */
export const transcribeAudio = async (audioBlob) => {
  return new Promise((resolve, reject) => {
    // Check if Web Speech API is available
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      reject(new Error("Speech recognition is not supported in this browser"));
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      // Recognition ended
    };

    // Note: Web Speech API works with microphone input, not audio blobs
    // For blob transcription, we would need to use a different approach
    // For now, we'll start recognition which uses the microphone
    recognition.start();
  });
};

/**
 * Start continuous speech recognition for real-time transcription
 * @param {Function} onResult - Callback for interim and final results
 * @param {Function} onError - Callback for errors
 * @returns {Object} Recognition object with stop method
 */
export const startSpeechRecognition = (onResult, onError) => {
  // Check if Web Speech API is available
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    throw new Error("Speech recognition is not supported in this browser");
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        interim: interimTranscript,
        final: finalTranscript,
      });
    }
  };

  recognition.onerror = (event) => {
    if (onError) {
      onError(new Error(`Speech recognition error: ${event.error}`));
    }
  };

  recognition.onend = () => {
    // Auto-restart if not manually stopped
    if (recognition.manualStop !== true) {
      try {
        recognition.start();
      } catch (e) {
        // Ignore restart errors
      }
    }
  };

  recognition.start();

  // Store original stop method and override it
  const originalStop = recognition.stop.bind(recognition);
  recognition.stop = () => {
    recognition.manualStop = true;
    originalStop();
  };

  return recognition;
};

