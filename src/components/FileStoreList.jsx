import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createFileStore, listFileStores, deleteFileStore, generateContentWithStore } from '../services/fileStoreService';
import './FileStoreList.css';

function FileStoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSources, setShowSources] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFileStores();
      setStores(response.fileSearchStores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      setError('Store name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createFileStore(newStoreName.trim());
      setNewStoreName('');
      setShowCreateModal(false);
      await loadStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStore = async (storeName, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(storeName);
      setError(null);
      await deleteFileStore(storeName, true); // Force delete to remove documents too
      await loadStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || stores.length === 0) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    const newUserMessage = { role: 'user', text: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);
    setError(null);

    try {
      // Get all store names
      const allStoreNames = stores.map(store => store.name);
      
      // Build conversation history (last 10 messages for context)
      const conversationHistory = chatMessages.slice(-10).map(msg => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await generateContentWithStore(
        allStoreNames,
        userMessage,
        conversationHistory
      );

      // Extract response text
      const candidate = response.candidates?.[0];
      const textParts = candidate?.content?.parts || [];
      const responseText = textParts
        .filter((part) => part.text)
        .map((part) => part.text)
        .join('\n') || 'No response generated.';

      // Extract grounding metadata (sources)
      const groundingMetadata = candidate?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks?.map((chunk) => ({
        title: chunk.retrievedContext?.title || 'Unknown',
        text: chunk.retrievedContext?.text || '',
        fileSearchStore: chunk.retrievedContext?.fileSearchStore || '',
      })) || [];

      // Add model response to chat with sources
      const modelMessage = { 
        role: 'model', 
        text: responseText,
        sources: sources
      };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      setError(err.message);
      // Add error message to chat
      const errorMessage = { role: 'model', text: `Error: ${err.message}`, isError: true };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading file stores...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-section">
        <h2>File Search Stores</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New Store
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Chatbot Section */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#374151' }}>Chat with All Stores</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {chatMessages.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={handleClearChat}
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                Clear Chat
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setShowChatbot(!showChatbot)}
              disabled={stores.length === 0}
            >
              {showChatbot ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>
        </div>

        {showChatbot && (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
            maxHeight: '80vh'
          }}>
            {/* Chat Messages Area */}
            <div 
              className="chat-messages-container"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {chatMessages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                  <h4>Start a conversation</h4>
                  <p>Ask questions about documents across all your stores. The AI will search through all stores to provide answers.</p>
                  {stores.length > 0 && (
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#9ca3af' }}>
                      Searching {stores.length} store{stores.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="chat-message"
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      backgroundColor: msg.role === 'user' 
                        ? '#3b82f6' 
                        : msg.isError 
                        ? '#fee2e2' 
                        : '#f3f4f6',
                      color: msg.role === 'user' 
                        ? '#ffffff' 
                        : msg.isError 
                        ? '#dc2626' 
                        : '#1f2937',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      position: 'relative'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                        {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                          <button
                            onClick={() => setShowSources(showSources === idx ? null : idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              color: 'inherit',
                              opacity: 0.7
                            }}
                            title="View sources"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div>{msg.text}</div>
                      {showSources === idx && msg.sources && msg.sources.length > 0 && (
                        <div style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(0,0,0,0.1)',
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.5rem', opacity: 0.8 }}>
                            Sources ({msg.sources.length}):
                          </div>
                          {msg.sources.map((source, sourceIdx) => (
                            <div 
                              key={sourceIdx}
                              style={{
                                marginBottom: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                borderRadius: '4px',
                                fontSize: '0.7rem'
                              }}
                            >
                              {/* <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                {source.title}
                              </div> */}
                              <div style={{ 
                                opacity: 0.7,
                                maxHeight: '60px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {source.text.substring(0, 150)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  width: '100%'
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Thinking</span>
                      <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Area */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              padding: '1rem'
            }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={stores.length === 0 ? "Create a store first to start chatting..." : "Ask a question across all stores..."}
                  disabled={chatLoading || stores.length === 0}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    opacity: stores.length === 0 ? 0.6 : 1
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!chatInput.trim() || chatLoading || stores.length === 0}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {chatLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {stores.length === 0 ? (
        <div className="empty-state">
          <h3>No file stores found</h3>
          <p>Create your first file search store to get started.</p>
        </div>
      ) : (
        <div className="store-list">
          {stores.map((store) => (
            <div key={store.name} className="store-card">
              <div className="store-info">
                <div className="store-name">{store.displayName || store.name}</div>
                <div className="store-details">
                  <span>Created: {formatDate(store.createTime)}</span>
                  <span>Active Docs: {store.activeDocumentsCount || 0}</span>
                  <span>Pending: {store.pendingDocumentsCount || 0}</span>
                  <span>Failed: {store.failedDocumentsCount || 0}</span>
                  <span>Size: {formatBytes(store.sizeBytes)}</span>
                </div>
              </div>
              <div className="store-actions">
                <Link
                  to={`/store/${encodeURIComponent(store.name)}`}
                  className="btn btn-primary"
                >
                  View
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteStore(store.name, store.displayName)}
                  disabled={deleting === store.name}
                >
                  {deleting === store.name ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New File Store</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label htmlFor="storeName">Store Display Name</label>
                <input
                  id="storeName"
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g., My Document Store"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileStoreList;

