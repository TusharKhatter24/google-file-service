import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateContentWithStore, generateAudioWithStore } from '../services/fileStoreService';
import { getEmployeeConfig } from '../services/employeeConfigService';
import './ChatInterface.css';

function ChatInterface({ employeeName, employeeId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! I'm ${employeeName || 'your AI assistant'}. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date(),
      sources: [],
      inputType: 'text',
      outputType: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [chatConfig, setChatConfig] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [outputMode, setOutputMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  const processMessage = async (userMessage, inputType = 'text') => {
    if (!userMessage.trim() || loading) return;

    if (selectedStores.length === 0) {
      setError('No knowledge source configured. Please set up a knowledge source in Settings first.');
      return;
    }

    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
      sources: [],
      inputType: inputType
    };

    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userMessage;
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
          currentInput,
          conversationHistory,
          {
            model: chatConfig?.model || 'gemini-2.5-flash',
            systemPrompt: chatConfig?.systemPrompt || null,
            temperature: chatConfig?.temperature !== undefined ? chatConfig.temperature : null,
            topP: chatConfig?.topP !== undefined ? chatConfig.topP : null,
            topK: chatConfig?.topK !== undefined ? chatConfig.topK : null,
            maxOutputTokens: chatConfig?.maxOutputTokens !== undefined ? chatConfig.maxOutputTokens : null,
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
            "gemini-2.5-flash-preview-tts"
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
          currentInput,
          conversationHistory,
          {
            model: chatConfig?.model || 'gemini-2.5-flash',
            systemPrompt: chatConfig?.systemPrompt || null,
            temperature: chatConfig?.temperature !== undefined ? chatConfig.temperature : null,
            topP: chatConfig?.topP !== undefined ? chatConfig.topP : null,
            topK: chatConfig?.topK !== undefined ? chatConfig.topK : null,
            maxOutputTokens: chatConfig?.maxOutputTokens !== undefined ? chatConfig.maxOutputTokens : null,
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
        <div className="chat-stores-info" style={{
          padding: '0.75rem 1rem',
          background: '#f0f4ff',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '0.875rem',
          color: '#667eea'
        }}>
          <strong>Searching across {selectedStores.length} knowledge base{selectedStores.length > 1 ? 's' : ''}:</strong>{' '}
          {selectedStores.map((store, idx) => (
            <span key={store}>
              {store.split('/').pop()}{idx < selectedStores.length - 1 ? ', ' : ''}
            </span>
          ))}
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
        <div className="input-mode-toggles">
          <div className="mode-toggle-group">
            <span className="mode-label">Input:</span>
            <button
              type="button"
              className={`mode-toggle ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => setInputMode('text')}
            >
              Text
            </button>
            <button
              type="button"
              className={`mode-toggle ${inputMode === 'audio' ? 'active' : ''}`}
              onClick={() => setInputMode('audio')}
            >
              Voice
            </button>
          </div>
          <div className="mode-toggle-group">
            <span className="mode-label">Output:</span>
            <button
              type="button"
              className={`mode-toggle ${outputMode === 'text' ? 'active' : ''}`}
              onClick={() => setOutputMode('text')}
            >
              Text
            </button>
            <button
              type="button"
              className={`mode-toggle ${outputMode === 'audio' ? 'active' : ''}`}
              onClick={() => setOutputMode('audio')}
            >
              Audio
            </button>
          </div>
        </div>

        {inputMode === 'text' ? (
          <form onSubmit={handleSend} className="chat-input-form">
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
              disabled={!inputValue.trim() || loading || selectedStores.length === 0}
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

