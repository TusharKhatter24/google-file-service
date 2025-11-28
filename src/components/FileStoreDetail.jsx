import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getFileStore,
  uploadFileToStore,
  getOperationStatus,
  listDocuments,
  getDocument,
  deleteDocument,
  importFileToStore,
  generateContentWithStore,
} from '../services/fileStoreService';
import { listFiles } from '../services/filesService';
import './FileStoreDetail.css';

function FileStoreDetail() {
  const { storeName } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDisplayName, setFileDisplayName] = useState('');
  const [operationStatus, setOperationStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filesNextPageToken, setFilesNextPageToken] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    loadStoreDetails();
    loadDocuments();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [storeName]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const storeData = await getFileStore(decodeURIComponent(storeName));
      setStore(storeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (pageToken = null) => {
    try {
      setDocumentsLoading(true);
      setError(null);
      const decodedStoreName = decodeURIComponent(storeName);
      const response = await listDocuments(decodedStoreName, 20, pageToken);
      if (pageToken) {
        // Append to existing documents for pagination
        setDocuments(prev => [...prev, ...(response.documents || [])]);
      } else {
        // Replace documents for initial load or refresh
        setDocuments(response.documents || []);
      }
      setNextPageToken(response.nextPageToken || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleViewDocument = async (documentName) => {
    try {
      setError(null);
      const doc = await getDocument(documentName);
      setSelectedDocument(doc);
      setShowDocumentModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDocument = async (documentName, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName || documentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingDoc(documentName);
      setError(null);
      await deleteDocument(documentName, true); // Force delete to remove chunks too
      setSuccess('Document deleted successfully!');
      await loadDocuments(); // Reload documents list
      await loadStoreDetails(); // Reload store stats
      if (selectedDocument && selectedDocument.name === documentName) {
        setShowDocumentModal(false);
        setSelectedDocument(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingDoc(null);
    }
  };

  const pollOperationStatus = async (operationName) => {
    try {
      const status = await getOperationStatus(operationName);
      setOperationStatus(status);

      if (status.done) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        if (status.error) {
          setError(status.error.message || 'Upload failed');
        } else {
          setSuccess('File uploaded successfully!');
          setSelectedFile(null);
          setFileDisplayName('');
          await loadStoreDetails();
          await loadDocuments(); // Reload documents list
        }
        setUploading(false);
      }
    } catch (err) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setError(err.message);
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!fileDisplayName) {
        setFileDisplayName(file.name);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!fileDisplayName) {
        setFileDisplayName(file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setOperationStatus(null);

      const decodedStoreName = decodeURIComponent(storeName);
      const response = await uploadFileToStore(
        decodedStoreName,
        selectedFile,
        fileDisplayName || selectedFile.name
      );

      // If response contains an operation, poll for status
      if (response.name) {
        setOperationStatus(response);
        const interval = setInterval(() => {
          pollOperationStatus(response.name);
        }, 2000);
        setPollingInterval(interval);
      } else {
        // Immediate success
        setSuccess('File uploaded successfully!');
        setSelectedFile(null);
        setFileDisplayName('');
        await loadStoreDetails();
        await loadDocuments(); // Reload documents list
        setUploading(false);
      }
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const handleOpenImportModal = async () => {
    setShowImportModal(true);
    setLoadingFiles(true);
    try {
      const response = await listFiles(50);
      setAvailableFiles(response.files || []);
      setFilesNextPageToken(response.nextPageToken || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadMoreFiles = async () => {
    if (!filesNextPageToken) return;
    try {
      setLoadingFiles(true);
      const response = await listFiles(50, filesNextPageToken);
      setAvailableFiles(prev => [...prev, ...(response.files || [])]);
      setFilesNextPageToken(response.nextPageToken || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleImportFile = async (fileName) => {
    try {
      setImporting(true);
      setError(null);
      const decodedStoreName = decodeURIComponent(storeName);
      const response = await importFileToStore(
        decodedStoreName,
        fileName
      );

      // Check if it's a long-running operation
      if (response.name) {
        setSuccess('File import started! The file is being processed.');
        setOperationStatus(response);
        const interval = setInterval(() => {
          pollOperationStatus(response.name);
        }, 2000);
        setPollingInterval(interval);
      } else {
        setSuccess('File imported successfully!');
        await loadStoreDetails();
        await loadDocuments();
      }
      
      setShowImportModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    const newUserMessage = { role: 'user', text: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatLoading(true);
    setError(null);

    try {
      const decodedStoreName = decodeURIComponent(storeName);
      
      // Build conversation history (last 10 messages for context)
      const conversationHistory = chatMessages.slice(-10).map(msg => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await generateContentWithStore(
        decodedStoreName,
        userMessage,
        conversationHistory
      );

      // Extract response text
      const textParts = response.candidates?.[0]?.content?.parts || [];
      const responseText = textParts
        .filter((part) => part.text)
        .map((part) => part.text)
        .join('\n') || 'No response generated.';

      // Add model response to chat (use 'model' role for API compatibility)
      const modelMessage = { role: 'model', text: responseText };
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getStateBadge = (state) => {
    const stateMap = {
      'STATE_ACTIVE': { label: 'Active', className: 'badge-success' },
      'STATE_PENDING': { label: 'Pending', className: 'badge-warning' },
      'STATE_FAILED': { label: 'Failed', className: 'badge-error' },
      'STATE_UNSPECIFIED': { label: 'Unknown', className: 'badge-secondary' },
    };
    const stateInfo = stateMap[state] || stateMap['STATE_UNSPECIFIED'];
    return <span className={`badge ${stateInfo.className}`}>{stateInfo.label}</span>;
  };

  const getFileStateBadge = (state) => {
    const stateMap = {
      'ACTIVE': { label: 'Active', className: 'badge-success' },
      'PROCESSING': { label: 'Processing', className: 'badge-warning' },
      'FAILED': { label: 'Failed', className: 'badge-error' },
      'STATE_UNSPECIFIED': { label: 'Unknown', className: 'badge-secondary' },
    };
    const stateInfo = stateMap[state] || stateMap['STATE_UNSPECIFIED'];
    return <span className={`badge ${stateInfo.className}`}>{stateInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading store details...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container">
        <div className="error">Store not found</div>
        <Link to="/" className="back-link">← Back to Stores</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to Stores</Link>

      <div className="header-section">
        <div>
          <h2>{store.displayName || store.name}</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {store.name}
          </p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {operationStatus && (
        <div className={`operation-status ${operationStatus.done ? (operationStatus.error ? 'error' : 'success') : ''}`}>
          {operationStatus.done ? (
            operationStatus.error ? (
              <div>Upload failed: {operationStatus.error.message}</div>
            ) : (
              <div>Upload completed successfully!</div>
            )
          ) : (
            <div>Uploading... Please wait.</div>
          )}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Documents</div>
          <div className="stat-value">{store.activeDocumentsCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Documents</div>
          <div className="stat-value">{store.pendingDocumentsCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed Documents</div>
          <div className="stat-value">{store.failedDocumentsCount || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Size</div>
          <div className="stat-value">{formatBytes(store.sizeBytes)}</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#374151', margin: 0 }}>Upload File</h3>
          <button
            className="btn btn-secondary"
            onClick={handleOpenImportModal}
            disabled={importing}
          >
            Import from Files
          </button>
        </div>
        
        <div
          className="file-upload-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            className="file-input"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
            {selectedFile ? (
              <div>
                <strong>{selectedFile.name}</strong>
                <div className="upload-info">
                  Size: {formatBytes(selectedFile.size)}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <div>Click to select a file or drag and drop</div>
                <div className="upload-info">
                  Supported formats: PDF, TXT, DOCX, HTML, and more
                </div>
              </div>
            )}
          </label>
        </div>

        {selectedFile && (
          <div className="form-group">
            <label htmlFor="fileDisplayName">Display Name (optional)</label>
            <input
              id="fileDisplayName"
              type="text"
              value={fileDisplayName}
              onChange={(e) => setFileDisplayName(e.target.value)}
              placeholder={selectedFile.name}
            />
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Store Information</h3>
        <div style={{ display: 'grid', gap: '0.5rem', color: '#6b7280' }}>
          <div><strong>Created:</strong> {formatDate(store.createTime)}</div>
          <div><strong>Last Updated:</strong> {formatDate(store.updateTime)}</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#374151' }}>Documents</h3>
          <button
            className="btn btn-secondary"
            onClick={() => loadDocuments()}
            disabled={documentsLoading}
          >
            {documentsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {documentsLoading && documents.length === 0 ? (
          <div className="loading">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <h3>No documents found</h3>
            <p>Upload your first file to get started.</p>
          </div>
        ) : (
          <>
            <div className="document-list">
              {documents.map((doc) => (
                <div key={doc.name} className="document-card">
                  <div className="document-info">
                    <div className="document-name-row">
                      <div className="document-name">{doc.displayName || doc.name}</div>
                      {getStateBadge(doc.state)}
                    </div>
                    <div className="document-details">
                      <span>Size: {formatBytes(doc.sizeBytes)}</span>
                      {doc.mimeType && <span>Type: {doc.mimeType}</span>}
                      <span>Created: {formatDate(doc.createTime)}</span>
                      {doc.updateTime && <span>Updated: {formatDate(doc.updateTime)}</span>}
                    </div>
                    {doc.customMetadata && doc.customMetadata.length > 0 && (
                      <div className="document-metadata">
                        {doc.customMetadata.map((meta, idx) => (
                          <span key={idx} className="metadata-tag">
                            {meta.key}: {meta.stringValue || meta.numericValue || (meta.stringListValue?.values?.join(', ') || '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="document-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewDocument(doc.name)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteDocument(doc.name, doc.displayName)}
                      disabled={deletingDoc === doc.name}
                    >
                      {deletingDoc === doc.name ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {nextPageToken && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => loadDocuments(nextPageToken)}
                  disabled={documentsLoading}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chatbot Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#374151' }}>Chat with Store</h3>
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
                  <p>Ask questions about the documents in this store. The AI will search through your documents to provide answers.</p>
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
                      whiteSpace: 'pre-wrap'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        opacity: 0.8
                      }}>
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div>{msg.text}</div>
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
                  placeholder="Ask a question about your documents..."
                  disabled={chatLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none'
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
                  disabled={!chatInput.trim() || chatLoading}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {chatLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {showDocumentModal && selectedDocument && (
        <div className="modal" onClick={() => setShowDocumentModal(false)}>
          <div className="modal-content document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Document Details</h3>
              <button className="close-btn" onClick={() => setShowDocumentModal(false)}>
                ×
              </button>
            </div>
            <div className="document-detail-content">
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{selectedDocument.name}</span>
              </div>
              <div className="detail-row">
                <strong>Display Name:</strong>
                <span>{selectedDocument.displayName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>State:</strong>
                {getStateBadge(selectedDocument.state)}
              </div>
              <div className="detail-row">
                <strong>Size:</strong>
                <span>{formatBytes(selectedDocument.sizeBytes)}</span>
              </div>
              {selectedDocument.mimeType && (
                <div className="detail-row">
                  <strong>MIME Type:</strong>
                  <span>{selectedDocument.mimeType}</span>
                </div>
              )}
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{formatDate(selectedDocument.createTime)}</span>
              </div>
              {selectedDocument.updateTime && (
                <div className="detail-row">
                  <strong>Last Updated:</strong>
                  <span>{formatDate(selectedDocument.updateTime)}</span>
                </div>
              )}
              {selectedDocument.customMetadata && selectedDocument.customMetadata.length > 0 && (
                <div className="detail-section">
                  <strong>Custom Metadata:</strong>
                  <div className="metadata-list">
                    {selectedDocument.customMetadata.map((meta, idx) => (
                      <div key={idx} className="metadata-item">
                        <strong>{meta.key}:</strong>
                        <span>
                          {meta.stringValue || 
                           meta.numericValue || 
                           (meta.stringListValue?.values?.join(', ') || 'N/A')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteDocument(selectedDocument.name, selectedDocument.displayName);
                  setShowDocumentModal(false);
                }}
                disabled={deletingDoc === selectedDocument.name}
              >
                {deletingDoc === selectedDocument.name ? 'Deleting...' : 'Delete Document'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDocumentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import File from Files List</h3>
              <button className="close-btn" onClick={() => setShowImportModal(false)}>
                ×
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Select a file to import into this store:
              </p>
              
              {loadingFiles && availableFiles.length === 0 ? (
                <div className="loading">Loading files...</div>
              ) : availableFiles.length === 0 ? (
                <div className="empty-state">
                  <p>No files available. Upload files first.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {availableFiles.map((file) => (
                    <div
                      key={file.name}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                          {file.displayName || file.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>•</span>
                          <span>{file.mimeType || 'Unknown type'}</span>
                          {file.state && (
                            <>
                              <span>•</span>
                              {getFileStateBadge(file.state)}
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleImportFile(file.name)}
                        disabled={importing || file.state !== 'ACTIVE'}
                        style={{ marginLeft: '1rem' }}
                      >
                        {importing ? 'Importing...' : 'Import'}
                      </button>
                    </div>
                  ))}
                  {filesNextPageToken && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={loadMoreFiles}
                        disabled={loadingFiles}
                      >
                        {loadingFiles ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowImportModal(false)}
                disabled={importing}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileStoreDetail;

