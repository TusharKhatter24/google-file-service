import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateContentWithStore } from '../services/fileStoreService';
import { getEmployeeStore } from '../services/employeeStoreService';
import { getEmployeeConfig } from '../services/employeeConfigService';
import './ChatInterface.css';

function ChatInterface({ employeeName, employeeId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello! I'm ${employeeName || 'your AI assistant'}. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date(),
      sources: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storeName, setStoreName] = useState(null);
  const [chatConfig, setChatConfig] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (employeeId) {
      const store = getEmployeeStore(employeeId);
      setStoreName(store);
      const config = getEmployeeConfig(employeeId);
      setChatConfig(config.chat);
      if (!store) {
        setError('No knowledge source configured. Please set up a knowledge source in Settings.');
      }
    }
  }, [employeeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    if (!storeName) {
      setError('No knowledge source configured. Please set up a knowledge source in Settings first.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      sources: []
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
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

      // Generate response using Google Gemini API with FileSearchStore
      const response = await generateContentWithStore(
        storeName,
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
        sources: sources
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      const errorMessage = {
        id: Date.now() + 1,
        text: `I apologize, but I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
        sources: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}
      {!storeName && (
        <div className="chat-warning">
          ⚠️ No knowledge source configured. Please set up a knowledge source in Settings to enable chat functionality.
        </div>
      )}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              <div className="message-text">
                {message.sender === 'ai' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
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

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button 
          type="submit" 
          className="chat-send-button"
          disabled={loading || !storeName}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;

