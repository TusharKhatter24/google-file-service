import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { listFileStores } from '../services/fileStoreService';
import { generateContentWithStore, generateAudioWithStore } from '../services/fileStoreService';
import './AskInterface.css';

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

function AskInterface() {
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showSources, setShowSources] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [outputMode, setOutputMode] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [showSegmentSelector, setShowSegmentSelector] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    // Auto-select all stores by default
    if (stores.length > 0 && selectedStores.length === 0) {
      setSelectedStores(stores.map(s => s.name));
    }
  }, [stores]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadStores = async () => {
    try {
      const response = await listFileStores(20);
      setStores(response.fileSearchStores || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
    }
  };

  const handleAudioInput = async () => {
    try {
      setChatLoading(true);
      setIsRecording(true);

      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      let hasResult = false;
      const userMessage = await new Promise((resolve, reject) => {
        recognition.onresult = (event) => {
          hasResult = true;
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          resolve(transcript);
        };
        recognition.onerror = (event) => {
          setIsRecording(false);
          reject(new Error('Speech recognition error: ' + event.error));
        };
        recognition.onend = () => {
          setIsRecording(false);
          if (!hasResult) {
            reject(new Error('No speech detected'));
          }
        };
        recognition.start();
      });

      if (userMessage) {
        await processMessage(userMessage, 'audio');
      }
    } catch (err) {
      setChatLoading(false);
      setIsRecording(false);
      const errorMessage = {
        id: Date.now(),
        role: 'model',
        text: `Error: ${err.message}. Please try typing your message.`,
        isError: true,
        outputType: outputMode
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const processMessage = async (userMessage, inputType = 'text') => {
    if (!userMessage.trim() || selectedStores.length === 0) return;

    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      text: userMessage,
      inputType: inputType
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);
    setChatInput('');

    try {
      const conversationHistory = chatMessages.slice(-10).map(msg => ({
        role: msg.role,
        text: msg.text,
      }));

      let response;

      if (outputMode === 'audio') {
        const textResponse = await generateContentWithStore(
          selectedStores,
          userMessage,
          conversationHistory
        );

        const candidate = textResponse.candidates?.[0];
        const textParts = candidate?.content?.parts || [];
        const responseText = textParts
          .filter((part) => part.text)
          .map((part) => part.text)
          .join('\n') || 'No response generated.';

        const groundingMetadata = candidate?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk) => ({
          title: chunk.retrievedContext?.title || 'Unknown',
          text: chunk.retrievedContext?.text || '',
          fileSearchStore: chunk.retrievedContext?.fileSearchStore || '',
        })) || [];

        const textMessageId = Date.now();
        const textMessage = {
          id: textMessageId,
          role: 'model',
          text: responseText,
          outputType: 'audio',
          sources: sources,
          generatingAudio: true
        };
        setChatMessages(prev => [...prev, textMessage]);

        try {
          response = await generateAudioWithStore(
            selectedStores,
            responseText,
            [],
            "Kore",
            "gemini-2.5-flash",
            "gemini-2.5-flash-preview-tts"
          );

          const audioPart = response.candidates?.[0]?.content?.parts?.find(
            part => part.inlineData && part.inlineData.mimeType?.startsWith('audio')
          );

          if (audioPart?.inlineData?.data) {
            const audioData = audioPart.inlineData.data;
            const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
            
            const sampleRate = 24000;
            const numChannels = 1;
            const bitsPerSample = 16;
            const dataLength = pcmData.length;
            
            const wavHeader = new ArrayBuffer(44);
            const view = new DataView(wavHeader);
            
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
            
            setChatMessages(prev => prev.map(msg =>
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
          setChatMessages(prev => prev.map(msg =>
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
        response = await generateContentWithStore(
          selectedStores,
          userMessage,
          conversationHistory
        );

        const candidate = response.candidates?.[0];
        const textParts = candidate?.content?.parts || [];
        const responseText = textParts
          .filter((part) => part.text)
          .map((part) => part.text)
          .join('\n') || 'No response generated.';

        const groundingMetadata = candidate?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map((chunk) => ({
          title: chunk.retrievedContext?.title || 'Unknown',
          text: chunk.retrievedContext?.text || '',
          fileSearchStore: chunk.retrievedContext?.fileSearchStore || '',
        })) || [];

        const modelMessage = {
          id: Date.now(),
          role: 'model',
          text: responseText,
          sources: sources,
          outputType: 'text'
        };
        setChatMessages(prev => [...prev, modelMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now(),
        role: 'model',
        text: `Error: ${err.message}`,
        isError: true,
        outputType: outputMode
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || selectedStores.length === 0) return;
    await processMessage(chatInput.trim(), 'text');
  };

  const handleStoreToggle = (storeName) => {
    setSelectedStores(prev => {
      if (prev.includes(storeName)) {
        return prev.filter(s => s !== storeName);
      } else {
        return [...prev, storeName];
      }
    });
  };

  const handleSelectAllStores = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(stores.map(s => s.name));
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setShowSources(null);
  };

  const getStoreDisplayName = (storeName) => {
    const store = stores.find(s => s.name === storeName);
    return store?.displayName || storeName.split('/').pop();
  };

  return (
    <div className="ask-interface">
      <div className="ask-header">
        <div className="ask-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <img 
              src="https://cdn.prod.website-files.com/68d14433cd550114f9ff7bf6/68dbeba8eee819e51bbce486_donna-full_body.png" 
              alt="Donna" 
              className="donna-logo-header"
              onLoad={(e) => {
                // Ensure animation plays even if image loads from cache
                e.target.style.animation = 'none';
                setTimeout(() => {
                  e.target.style.animation = '';
                }, 10);
              }}
            />
            <div className="ask-header-text">
              <h1 style={{ margin: 0 }}>Ask Donna</h1>
              <p className="ask-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Your Intelligent Knowledge Assistant</p>
            </div>
          </div>
          <p className="ask-slogan">Get instant, accurate answers from your knowledge base. Donna understands context, synthesizes information, and helps you find what you need.</p>
        </div>
        <div className="segment-selector-container">
          {chatMessages.length > 0 && (
            <button
              className="clear-chat-btn"
              onClick={handleClearChat}
              title="Start a new chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              New Chat
            </button>
          )}
          <button
            className="segment-selector-btn"
            onClick={() => setShowSegmentSelector(!showSegmentSelector)}
          >
            {selectedStores.length === 0
              ? 'Select Knowledge Segments'
              : selectedStores.length === stores.length
              ? 'All Segments'
              : `${selectedStores.length} Segment${selectedStores.length !== 1 ? 's' : ''} Selected`}
            <span className="dropdown-arrow">▼</span>
          </button>
          {showSegmentSelector && (
            <div className="segment-selector-dropdown">
              <div className="segment-selector-header">
                <button
                  className="select-all-btn"
                  onClick={handleSelectAllStores}
                >
                  {selectedStores.length === stores.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="segment-list">
                {stores.map(store => (
                  <label key={store.name} className="segment-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.name)}
                      onChange={() => handleStoreToggle(store.name)}
                    />
                    <div className="segment-info">
                      <span className="segment-name">{store.displayName || store.name}</span>
                      <span className="segment-meta">
                        {store.activeDocumentsCount || 0} documents
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {stores.length === 0 && (
                <div className="no-segments">
                  <p>No knowledge segments available.</p>
                  <a href="/segments" className="create-segment-link">
                    Create your first segment
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="empty-chat-state">

              <h2 className="empty-chat-title">Start a conversation with Donna</h2>
              <p className="empty-chat-description">Ask Donna questions about your knowledge base. Donna will search through your selected segments to provide accurate answers.</p>
              <p className="empty-chat-tagline">"Your intelligent assistant, always ready to help"</p>
              {selectedStores.length > 0 && (
                <div className="selected-segments-preview">
                  <p className="preview-label">Searching in:</p>
                  <div className="segment-pills">
                    {selectedStores.slice(0, 3).map(storeName => (
                      <span key={storeName} className="segment-pill">
                        {getStoreDisplayName(storeName)}
                      </span>
                    ))}
                    {selectedStores.length > 3 && (
                      <span className="segment-pill">+{selectedStores.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-role">
                      {msg.role === 'user' ? 'You' : (
                        <>
                          <span className="ai-badge">🤖</span> Donna
                        </>
                      )}
                    </span>
                    {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                      <button
                        className="sources-toggle"
                        onClick={() => setShowSources(showSources === msg.id ? null : msg.id)}
                      >
                        {showSources === msg.id ? 'Hide' : 'Show'} Sources ({msg.sources.length})
                      </button>
                    )}
                  </div>
                  <div className="message-text">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.generatingAudio && (
                    <div className="audio-generating">
                      <span className="pulse-dot"></span>
                      Generating audio...
                    </div>
                  )}
                  {msg.outputType === 'audio' && msg.audioUrl && (
                    <div className="audio-player">
                      <audio controls src={msg.audioUrl} />
                    </div>
                  )}
                  {msg.audioError && (
                    <div className="audio-error">
                      Audio generation failed: {msg.audioError}
                    </div>
                  )}
                  {showSources === msg.id && msg.sources && msg.sources.length > 0 && (
                    <div className="sources-list">
                      <h4>Sources ({msg.sources.length})</h4>
                      {msg.sources.map((source, idx) => (
                        <div key={idx} className="source-item">
                          <div className="source-title">{source.title}</div>
                          <div className="source-text">{source.text.substring(0, 200)}...</div>
                          {source.fileSearchStore && (
                            <div className="source-store">
                              From: {getStoreDisplayName(source.fileSearchStore)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="chat-message assistant-message">
              <div className="message-content">
                <div className="message-header">
                  <span className="message-role">
                    <span className="ai-badge">🤖</span> Donna
                  </span>
                </div>
                <div className="typing-indicator">
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
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  selectedStores.length === 0
                    ? "Select knowledge segments first..."
                    : "Ask Donna a question about your knowledge base..."
                }
                disabled={chatLoading || selectedStores.length === 0}
                className="chat-input"
              />
              <button
                type="submit"
                className="send-button"
                disabled={!chatInput.trim() || chatLoading || selectedStores.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          ) : (
            <div className="audio-input-container">
              <button
                type="button"
                className="voice-button"
                onClick={handleAudioInput}
                disabled={chatLoading || selectedStores.length === 0 || isRecording}
              >
                {isRecording ? (
                  <>
                    <span className="recording-indicator"></span>
                    Listening...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                    Speak
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AskInterface;

