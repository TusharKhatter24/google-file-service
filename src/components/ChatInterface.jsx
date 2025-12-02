import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateContentWithStore, generateAudioWithStore } from '../services/fileStoreService';
import { getEmployeeConfig } from '../services/employeeConfigService';
import { uploadFile } from '../services/filesService';
import './ChatInterface.css';

const CHAT_STORAGE_PREFIX = 'chat_messages_';

// Icon Components
const KeyboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

function ChatInterface({ employeeName, employeeId }) {
  const getDefaultMessage = (name) => ({
    id: 1,
    text: `Hello! I'm ${name || 'your AI assistant'}. How can I help you today?`,
    sender: 'ai',
    timestamp: new Date(),
    sources: [],
    inputType: 'text',
    outputType: 'text'
  });

  // Initialize messages from localStorage or default
  const initializeMessages = () => {
    if (!employeeId) {
      return [getDefaultMessage(employeeName)];
    }

    try {
      const stored = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${employeeId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          // Convert timestamp strings back to Date objects
          return parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
    
    // Return default message if no stored messages
    return [getDefaultMessage(employeeName)];
  };

  const [messages, setMessages] = useState(() => initializeMessages());
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [chatConfig, setChatConfig] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [outputMode, setOutputMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [showSources, setShowSources] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const fileInputRef = useRef(null);

  // Load messages from localStorage whenever component mounts or employeeId changes
  useEffect(() => {
    if (!employeeId) return;
    
    isInitialLoadRef.current = true;
    
    try {
      const stored = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${employeeId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          // Convert timestamp strings back to Date objects
          let loadedMessages = parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          // Update the initial greeting message if the employee name has changed
          if (loadedMessages[0]?.id === 1 && loadedMessages[0]?.sender === 'ai') {
            const expectedGreeting = `Hello! I'm ${employeeName || 'your AI assistant'}. How can I help you today?`;
            if (loadedMessages[0].text !== expectedGreeting) {
              loadedMessages[0] = {
                ...loadedMessages[0],
                text: expectedGreeting
              };
              // Save updated messages back to localStorage
              try {
                localStorage.setItem(`${CHAT_STORAGE_PREFIX}${employeeId}`, JSON.stringify(loadedMessages));
              } catch (e) {
                console.error('Error updating greeting message:', e);
              }
            }
          }
          
          setMessages(loadedMessages);
          isInitialLoadRef.current = false;
          return;
        }
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
    
    // Set default message if no stored messages found
    setMessages([getDefaultMessage(employeeName)]);
    isInitialLoadRef.current = false;
  }, [employeeId, employeeName]);

  // Save messages to localStorage whenever they change (but skip initial load)
  useEffect(() => {
    // Skip saving during initial load to avoid overwriting loaded messages
    if (isInitialLoadRef.current) return;
    
    if (employeeId && messages.length > 0) {
      try {
        localStorage.setItem(`${CHAT_STORAGE_PREFIX}${employeeId}`, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat messages:', error);
      }
    }
  }, [messages, employeeId]);

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      const defaultMessage = getDefaultMessage(employeeName);
      setMessages([defaultMessage]);
      setShowSources(null);
      try {
        localStorage.setItem(`${CHAT_STORAGE_PREFIX}${employeeId}`, JSON.stringify([defaultMessage]));
      } catch (error) {
        console.error('Error clearing chat messages:', error);
      }
    }
  };

  useEffect(() => {
    if (employeeId) {
      const config = getEmployeeConfig(employeeId);
      setChatConfig(config.chat);
      // Get selected stores from config - loaded from localStorage
      const stores = config.chat?.selectedStores || [];
      setSelectedStores(stores);
      if (stores.length === 0) {
        setError('No knowledge bases selected. Please select at least one knowledge base in Settings.');
      } else {
        setError(null); // Clear error if stores are available
      }
    }
  }, [employeeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAudioInput = async () => {
    try {
      setLoading(true);
      setIsRecording(true);
      setError(null);

      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser. Please use text input.');
      }

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = true; // Enable interim results for better UX
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Store recognition instance so we can stop it manually if needed
      recognitionRef.current = recognition;

      let hasResult = false;
      let finalTranscript = '';
      
      const userMessage = await new Promise((resolve, reject) => {
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          if (!hasResult) {
            recognition.stop();
            setIsRecording(false);
            reject(new Error('Speech recognition timed out. Please try again.'));
          }
        }, 10000); // 10 second timeout

        recognition.onresult = (event) => {
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              hasResult = true;
            } else {
              interimTranscript += transcript;
            }
          }

          // If we have a final result, resolve immediately
          if (hasResult && finalTranscript.trim()) {
            clearTimeout(timeout);
            setIsRecording(false);
            recognition.stop();
            resolve(finalTranscript.trim());
          }
        };

        recognition.onerror = (event) => {
          clearTimeout(timeout);
          setIsRecording(false);
          
          // Handle specific error types
          let errorMessage = 'Speech recognition error';
          if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please speak clearly and try again.';
          } else if (event.error === 'audio-capture') {
            errorMessage = 'No microphone found. Please check your microphone settings.';
          } else if (event.error === 'not-allowed') {
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
          } else {
            errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          reject(new Error(errorMessage));
        };

        recognition.onend = () => {
          clearTimeout(timeout);
          setIsRecording(false);
          
          // Only reject if we truly didn't get a result
          // This handles cases where recognition ends naturally after getting a result
          if (!hasResult && !finalTranscript.trim()) {
            // Don't reject here if we're already handling an error
            // The error handler will take care of it
          }
        };

        recognition.onstart = () => {
          // Recognition started successfully
          console.log('Speech recognition started');
        };

        try {
          recognition.start();
        } catch (startError) {
          clearTimeout(timeout);
          setIsRecording(false);
          recognitionRef.current = null;
          reject(new Error('Failed to start speech recognition. Please try again.'));
        }
      });

      if (userMessage && userMessage.trim()) {
        recognitionRef.current = null;
        await processMessage(userMessage, 'audio');
      } else {
        recognitionRef.current = null;
      }
    } catch (err) {
      setLoading(false);
      setIsRecording(false);
      recognitionRef.current = null;
      
      // Only show error if it's not a user cancellation
      if (err.message && !err.message.includes('cancelled')) {
        setError(err.message || 'Could not transcribe audio. Please try typing your message.');
        const errorMessage = {
          id: Date.now(),
          text: `Error: ${err.message}. Please try typing your message.`,
          sender: 'ai',
          timestamp: new Date(),
          sources: [],
          isError: true,
          outputType: outputMode
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setLoading(false);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Process each file
    for (const file of files) {
      const fileId = Date.now() + Math.random();
      
      // Add file to uploading state
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { name: file.name, status: 'uploading' }
      }));

      try {
        // Upload file to Google Files API
        const uploadResponse = await uploadFile(file, file.name);
        
        // Get file URI from response - handle different response structures
        // Response structure: { file: { name, uri, mimeType } } or { name, uri, mimeType }
        let fileUri = uploadResponse.file?.uri || uploadResponse.uri;
        let mimeType = uploadResponse.file?.mimeType || uploadResponse.mimeType || file.type || 'application/octet-stream';
        
        // If we have name but no URI, use name (Gemini API accepts both formats)
        // Name format: "files/{file_id}" - this works with Gemini API
        if (!fileUri) {
          fileUri = uploadResponse.file?.name || uploadResponse.name;
        }
        
        if (!fileUri) {
          throw new Error('File upload did not return a valid file identifier');
        }

        // Add to attached files
        setAttachedFiles(prev => [...prev, {
          id: fileId,
          name: file.name,
          uri: fileUri,
          mimeType: mimeType,
          size: file.size
        }]);

        // Remove from uploading state
        setUploadingFiles(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      } catch (err) {
        console.error('Error uploading file:', err);
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: { name: file.name, status: 'error', error: err.message }
        }));
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('text') || mimeType?.includes('json')) return '📝';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📘';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return '📊';
    return '📎';
  };

  const processMessage = async (userMessage, inputType = 'text') => {
    if ((!userMessage.trim() && attachedFiles.length === 0) || loading) return;

    if (selectedStores.length === 0) {
      setError('No knowledge source configured. Please set up a knowledge source in Settings first.');
      return;
    }

    // Prepare attached files for API call
    const filesForAPI = attachedFiles.map(f => ({
      uri: f.uri,
      mimeType: f.mimeType
    }));

    const newUserMessage = {
      id: Date.now(),
      text: userMessage || (attachedFiles.length > 0 ? `[Sent ${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''}]` : ''),
      sender: 'user',
      timestamp: new Date(),
      sources: [],
      inputType: inputType,
      attachedFiles: attachedFiles.map(f => ({
        name: f.name,
        uri: f.uri,
        mimeType: f.mimeType,
        size: f.size
      }))
    };

    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userMessage || '';
    
    // Clear attached files and input
    setAttachedFiles([]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      // Build conversation history from previous messages
      const conversationHistory = messages
        .filter(msg => msg.id !== 1) // Exclude initial greeting
        .slice(-10) // Last 10 messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          text: msg.text
        }));

      let response;

      if (outputMode === 'audio') {
        // Step 1: Generate text response first (for grounding)
        const textResponse = await generateContentWithStore(
          selectedStores,
          currentInput || 'Please analyze the attached files.',
          conversationHistory,
          {
            model: chatConfig?.model || 'gemini-2.5-flash',
            systemPrompt: chatConfig?.systemPrompt || null,
            temperature: chatConfig?.temperature !== undefined ? chatConfig.temperature : null,
            topP: chatConfig?.topP !== undefined ? chatConfig.topP : null,
            topK: chatConfig?.topK !== undefined ? chatConfig.topK : null,
            maxOutputTokens: chatConfig?.maxOutputTokens !== undefined ? chatConfig.maxOutputTokens : null,
            attachedFiles: filesForAPI,
          }
        );

        // Extract text response
        const candidate = textResponse.candidates?.[0];
        const textParts = candidate?.content?.parts || [];
        const responseText = textParts
          .filter(part => part.text)
          .map(part => part.text)
          .join('\n') || 'I apologize, but I couldn\'t generate a response.';

        // Extract grounding metadata (sources)
        const groundingMetadata = candidate?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk) => ({
          title: chunk.retrievedContext?.title || 'Unknown',
          text: chunk.retrievedContext?.text || '',
          fileSearchStore: chunk.retrievedContext?.fileSearchStore || '',
        })) || [];

        // Step 2: Show text response immediately with "Generating audio..." indicator
        const textMessageId = Date.now();
        const textMessage = {
          id: textMessageId,
          text: responseText,
          sender: 'ai',
          timestamp: new Date(),
          sources: sources,
          outputType: 'audio',
          generatingAudio: true
        };
        setMessages(prev => [...prev, textMessage]);

        // Step 3: Generate audio from the text response
        try {
          response = await generateAudioWithStore(
            selectedStores,
            responseText,
            [],
            "Kore",
            "gemini-2.5-flash",
            "gemini-2.5-flash-preview-tts",
            [] // No file attachments for audio conversion
          );

          // Extract audio data
          const audioPart = response.candidates?.[0]?.content?.parts?.find(
            part => part.inlineData && part.inlineData.mimeType?.startsWith('audio')
          );

          if (audioPart?.inlineData?.data) {
            // Convert base64 PCM data to WAV format for browser playback
            const audioData = audioPart.inlineData.data;
            const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
            
            // Create WAV file from PCM data (24kHz, 16-bit, mono)
            const sampleRate = 24000;
            const numChannels = 1;
            const bitsPerSample = 16;
            const dataLength = pcmData.length;
            
            const wavHeader = new ArrayBuffer(44);
            const view = new DataView(wavHeader);
            
            // WAV header
            const writeString = (offset, string) => {
              for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
              }
            };
            
            writeString(0, 'RIFF');
            view.setUint32(4, 36 + dataLength, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
            view.setUint16(32, numChannels * bitsPerSample / 8, true);
            view.setUint16(34, bitsPerSample, true);
            writeString(36, 'data');
            view.setUint32(40, dataLength, true);
            
            const wavBlob = new Blob([wavHeader, pcmData], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(wavBlob);
            
            // Step 4: Update the message with audio URL
            setMessages(prev => prev.map(msg => 
              msg.id === textMessageId
                ? {
                    ...msg,
                    audioUrl: audioUrl,
                    generatingAudio: false
                  }
                : msg
            ));
          } else {
            throw new Error('No audio data received');
          }
        } catch (audioError) {
          // Update message to show audio generation failed
          setMessages(prev => prev.map(msg => 
            msg.id === textMessageId
              ? {
                  ...msg,
                  generatingAudio: false,
                  audioError: audioError.message
                }
              : msg
          ));
        }
      } else {
        // Generate text response
        response = await generateContentWithStore(
          selectedStores,
          currentInput || 'Please analyze the attached files.',
          conversationHistory,
          {
            model: chatConfig?.model || 'gemini-2.5-flash',
            systemPrompt: chatConfig?.systemPrompt || null,
            temperature: chatConfig?.temperature !== undefined ? chatConfig.temperature : null,
            topP: chatConfig?.topP !== undefined ? chatConfig.topP : null,
            topK: chatConfig?.topK !== undefined ? chatConfig.topK : null,
            maxOutputTokens: chatConfig?.maxOutputTokens !== undefined ? chatConfig.maxOutputTokens : null,
            attachedFiles: filesForAPI,
          }
        );

        // Extract response text and sources
        const candidates = response.candidates || [];
        const candidate = candidates[0];
        const textParts = candidate?.content?.parts || [];
        const responseText = textParts
          .filter(part => part.text)
          .map(part => part.text)
          .join('\n') || 'I apologize, but I couldn\'t generate a response.';

        // Extract grounding metadata (sources)
        const groundingMetadata = candidate?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk) => ({
          title: chunk.retrievedContext?.title || 'Unknown',
          text: chunk.retrievedContext?.text || '',
          fileSearchStore: chunk.retrievedContext?.fileSearchStore || '',
        })) || [];

        const aiMessage = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'ai',
          timestamp: new Date(),
          sources: sources,
          outputType: 'text'
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      const errorMessage = {
        id: Date.now() + 1,
        text: `I apologize, but I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
        sources: [],
        isError: true,
        outputType: outputMode
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;
    await processMessage(inputValue, 'text');
  };

  return (
    <div className="chat-interface">
      <div className="chat-header-actions">
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            className="clear-chat-button"
            title="Clear chat history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear Chat
          </button>
        )}
      </div>
      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}
      {selectedStores.length === 0 && (
        <div className="chat-warning">
          ⚠️ No knowledge source configured. Please set up a knowledge source in Settings to enable chat functionality.
        </div>
      )}
      {selectedStores.length > 0 && (
        <div className="chat-stores-info">
          <span className="chat-stores-label">Searching across {selectedStores.length} knowledge base{selectedStores.length > 1 ? 's' : ''}</span>
          <div className="chat-stores-list">
            {selectedStores.map((store, idx) => (
              <span key={store} className="chat-store-badge">
                {store.split('/').pop()}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {message.sender === 'user' ? 'You' : (
                    <>
                      <span className="ai-badge">🤖</span> {employeeName || 'Assistant'}
                    </>
                  )}
                </span>
                {message.inputType === 'audio' && message.sender === 'user' && (
                  <span className="input-type-badge">🎤 Voice</span>
                )}
              </div>
              {message.attachedFiles && message.attachedFiles.length > 0 && (
                <div className="message-attached-files">
                  {message.attachedFiles.map((file, idx) => (
                    <div key={idx} className="attached-file-item">
                      <span className="file-icon">{getFileIcon(file.mimeType)}</span>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        {file.size && (
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="message-text">
                {message.sender === 'ai' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
              {message.generatingAudio && (
                <div className="audio-generating">
                  <span className="pulse-dot"></span>
                  Generating audio...
                </div>
              )}
              {message.outputType === 'audio' && message.audioUrl && (
                <div className="audio-player">
                  <audio controls src={message.audioUrl} />
                </div>
              )}
              {message.audioError && (
                <div className="audio-error">
                  Audio generation failed: {message.audioError}
                </div>
              )}
              {message.sources && message.sources.length > 0 && (
                <>
                  <button
                    className="sources-info-button"
                    onClick={() => setShowSources(showSources === message.id ? null : message.id)}
                    title={`${showSources === message.id ? 'Hide' : 'Show'} sources (${message.sources.length})`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    {showSources === message.id ? 'Hide' : 'Show'} Sources ({message.sources.length})
                  </button>
                  {showSources === message.id && (
                    <div className="message-sources">
                      <div className="sources-header">Sources:</div>
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="source-item">
                          <span className="source-title">{source.title}</span>
                          {source.text && (
                            <span className="source-preview">{source.text.substring(0, 100)}...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message ai-message">
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="attached-files-preview">
            <div className="attached-files-header">
              <span>Attached Files ({attachedFiles.length})</span>
            </div>
            <div className="attached-files-list">
              {attachedFiles.map((file) => (
                <div key={file.id} className="attached-file-preview">
                  <span className="file-icon">{getFileIcon(file.mimeType)}</span>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    {file.size && (
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => handleRemoveFile(file.id)}
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadingFiles).length > 0 && (
          <div className="upload-progress-container">
            {Object.entries(uploadingFiles).map(([fileId, file]) => (
              <div key={fileId} className="upload-progress-item">
                <span className="file-icon">{getFileIcon('')}</span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="upload-status">
                    {file.status === 'uploading' && '⏳ Uploading...'}
                    {file.status === 'error' && `❌ Error: ${file.error}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="input-mode-toggles">
          <div className="mode-toggle-group">
            <span className="mode-label">Input:</span>
            <button
              type="button"
              className={`mode-toggle ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => setInputMode('text')}
            >
              <KeyboardIcon />
              <span>Text</span>
            </button>
            <button
              type="button"
              className={`mode-toggle ${inputMode === 'audio' ? 'active' : ''}`}
              onClick={() => setInputMode('audio')}
            >
              <MicrophoneIcon />
              <span>Voice</span>
            </button>
          </div>
          <div className="mode-toggle-group">
            <span className="mode-label">Output:</span>
            <button
              type="button"
              className={`mode-toggle ${outputMode === 'text' ? 'active' : ''}`}
              onClick={() => setOutputMode('text')}
            >
              <DocumentIcon />
              <span>Text</span>
            </button>
            <button
              type="button"
              className={`mode-toggle ${outputMode === 'audio' ? 'active' : ''}`}
              onClick={() => setOutputMode('audio')}
            >
              <SpeakerIcon />
              <span>Audio</span>
            </button>
          </div>
        </div>

        {inputMode === 'text' ? (
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="file-input-hidden"
              accept=".pdf,.doc,.docx,.txt,.md,.json,.csv,.jpg,.jpeg,.png,.gif,.webp"
              id="file-input"
            />
            <button
              type="button"
              className="file-attach-button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
              disabled={loading || selectedStores.length === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedStores.length === 0 ? "Select knowledge bases first..." : `Ask ${employeeName || 'me'} a question...`}
              className="chat-input"
              disabled={loading || selectedStores.length === 0}
            />
            <button 
              type="submit" 
              className="chat-send-button"
              disabled={(!inputValue.trim() && attachedFiles.length === 0) || loading || selectedStores.length === 0}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        ) : (
          <div className="audio-input-container">
            {isRecording ? (
              <div className="recording-controls">
                <button
                  type="button"
                  className="voice-button recording"
                  disabled
                >
                  <span className="recording-indicator"></span>
                  Listening... Speak now
                </button>
                <button
                  type="button"
                  className="stop-recording-button"
                  onClick={stopRecording}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  </svg>
                  Stop
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="voice-button"
                onClick={handleAudioInput}
                disabled={loading || selectedStores.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Speak
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;

