import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { uploadFileToStore, getOperationStatus, listDocuments, listFileStores } from '../../services/fileStoreService';
import { getEmployeeConfig } from '../../services/employeeConfigService';
import Card from '../Card';
import Button from '../Button';
import EmptyState from '../ui/EmptyState';
import './KnowledgeBasePage.css';

function KnowledgeBasePage() {
  const { employeeId } = useParams();
  const [files, setFiles] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [storeName, setStoreName] = useState(null);
  const [availableStores, setAvailableStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedDocument, setSelectedDocument] = useState(null);
  const fileInputRef = useRef(null);

  const loadDocuments = async (store, pageToken = null) => {
    try {
      const response = await listDocuments(store, 20, pageToken);
      if (pageToken) {
        setUploadedDocuments(prev => [...prev, ...(response.documents || [])]);
      } else {
        setUploadedDocuments(response.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadAvailableStores();
  }, [employeeId]);

  const loadAvailableStores = async () => {
    try {
      setLoadingStores(true);
      const response = await listFileStores(20);
      const stores = response.fileSearchStores || [];
      setAvailableStores(stores);
      
      if (employeeId) {
        const config = getEmployeeConfig(employeeId);
        const configStores = config.chat?.selectedStores || [];
        if (configStores.length > 0) {
          const validStores = configStores.filter(storeName => 
            stores.some(s => s.name === storeName)
          );
          setSelectedStores(validStores);
          if (validStores.length > 0) {
            setStoreName(validStores[0]);
            loadDocuments(validStores[0]);
          }
        } else if (stores.length > 0) {
          setSelectedStores([stores[0].name]);
          setStoreName(stores[0].name);
          loadDocuments(stores[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      setError('Failed to load knowledge sources');
    } finally {
      setLoadingStores(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date(),
      status: 'pending'
    }));
    setFiles([...files, ...fileObjects]);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const pollOperationStatus = async (operationName, fileId) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const operation = await getOperationStatus(operationName);
        
        if (operation.done) {
          if (operation.error) {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: { status: 'error', error: operation.error.message }
            }));
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: { status: 'completed' }
            }));
            if (storeName) {
              await loadDocuments(storeName);
            }
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { status: 'timeout' }
          }));
        }
      } catch (err) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { status: 'error', error: err.message }
        }));
      }
    };

    poll();
  };

  const handleStoreToggle = (storeName) => {
    setSelectedStores(prev => {
      if (prev.includes(storeName)) {
        return prev.filter(name => name !== storeName);
      } else {
        return [...prev, storeName];
      }
    });
  };

  const handleUploadFiles = async () => {
    if (selectedStores.length === 0) {
      setError('Please select at least one knowledge source to upload files to.');
      return;
    }

    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadConfig = getEmployeeConfig(employeeId)?.upload;
      const chunkingConfig = uploadConfig?.chunkingConfig ? {
        chunkSize: uploadConfig.chunkingConfig.chunkSize,
        chunkOverlap: uploadConfig.chunkingConfig.chunkOverlap,
      } : null;

      for (const fileObj of files) {
        setUploadProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'uploading', stores: selectedStores.length }
        }));

        try {
          const uploadPromises = selectedStores.map(async (storeName) => {
            try {
              const response = await uploadFileToStore(
                storeName,
                fileObj.file,
                fileObj.name,
                null,
                chunkingConfig,
                fileObj.type
              );

              if (response.name && response.name.includes('operations/')) {
                return { storeName, operationName: response.name, type: 'operation' };
              } else {
                return { storeName, type: 'completed' };
              }
            } catch (err) {
              return { storeName, type: 'error', error: err.message };
            }
          });

          const results = await Promise.all(uploadPromises);
          
          const operations = results.filter(r => r.type === 'operation');
          if (operations.length > 0) {
            setUploadProgress(prev => ({
              ...prev,
              [fileObj.id]: { status: 'processing', operations }
            }));
            
            await Promise.all(operations.map(op => 
              pollOperationStatus(op.operationName, fileObj.id)
            ));
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [fileObj.id]: { status: 'completed' }
            }));
          }

          if (selectedStores.length > 0) {
            await loadDocuments(selectedStores[0]);
          }
        } catch (err) {
          setUploadProgress(prev => ({
            ...prev,
            [fileObj.id]: { status: 'error', error: err.message }
          }));
        }
      }

      setSuccess(`Successfully uploaded ${files.length} file(s) to ${selectedStores.length} knowledge source(s)`);
      setFiles([]);
      
      setTimeout(() => {
        if (selectedStores.length > 0) {
          loadDocuments(selectedStores[0]);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="knowledge-base-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">Manage documents and knowledge sources for your AI employee.</p>
        </div>
        <div className="header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div className="upload-section">
          <Card className="upload-card">
            <div
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📄</div>
                <h4>Drop files here or click to browse</h4>
                <p>Supports PDF, DOCX, TXT, and other document formats</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="file-input"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
            </div>

            {availableStores.length > 0 && (
              <div className="store-selection">
                <h4>Select Knowledge Sources ({selectedStores.length} selected)</h4>
                <div className="store-checkboxes">
                  {availableStores.map((store) => {
                    const isSelected = selectedStores.includes(store.name);
                    return (
                      <label
                        key={store.name}
                        className={`store-checkbox ${isSelected ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStoreToggle(store.name)}
                        />
                        <div>
                          <div className="store-name">{store.displayName || store.name.split('/').pop()}</div>
                          <div className="store-meta">{store.activeDocumentsCount || 0} active documents</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="files-to-upload">
                <h4>Files to Upload ({files.length})</h4>
                <div className="files-list">
                  {files.map((file) => {
                    const progress = uploadProgress[file.id];
                    return (
                      <div key={file.id} className="file-item">
                        <div className="file-info">
                          <div className="file-icon">📄</div>
                          <div className="file-details">
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                              {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                            </div>
                            {progress && (
                              <div className="upload-status">
                                {progress.status === 'uploading' && <span>⏳ Uploading...</span>}
                                {progress.status === 'processing' && <span>🔄 Processing...</span>}
                                {progress.status === 'completed' && <span>✓ Completed</span>}
                                {progress.status === 'error' && <span>✗ Error: {progress.error}</span>}
                                {progress.status === 'timeout' && <span>⏱ Timeout</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        {!progress && (
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="remove-file-btn"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={handleUploadFiles}
                  disabled={uploading || selectedStores.length === 0}
                  className="upload-btn"
                >
                  {uploading ? 'Uploading...' : `Upload & Train (${selectedStores.length} store${selectedStores.length > 1 ? 's' : ''})`}
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="documents-section">
          <div className="section-header">
            <h2 className="section-title">Documents ({uploadedDocuments.length})</h2>
          </div>

          {uploadedDocuments.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No documents yet"
              description="Upload your first document to start building your knowledge base."
            />
          ) : (
            <div className={`documents-${viewMode}`}>
              {uploadedDocuments.map((doc) => (
                <Card
                  key={doc.name}
                  className="document-card"
                  hoverable
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="document-icon">📄</div>
                  <div className="document-info">
                    <div className="document-name">{doc.displayName || doc.name}</div>
                    <div className="document-meta">
                      {doc.createTime && new Date(doc.createTime).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDocument && (
        <div className="document-modal" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument.displayName || selectedDocument.name}</h3>
              <button className="close-btn" onClick={() => setSelectedDocument(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="document-detail">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedDocument.displayName || selectedDocument.name}</span>
                </div>
                {selectedDocument.createTime && (
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{new Date(selectedDocument.createTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeBasePage;

