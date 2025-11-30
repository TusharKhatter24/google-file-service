import React, { useState, useRef, useEffect } from 'react';
import { uploadFileToStore, getOperationStatus, listDocuments, listFileStores } from '../services/fileStoreService';
import { getEmployeeConfig } from '../services/employeeConfigService';
import './DocumentUpload.css';

function DocumentUpload({ employeeName, employeeId }) {
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
  const fileInputRef = useRef(null);

  const loadDocuments = async (store, pageToken = null) => {
    try {
      const response = await listDocuments(store, 20, pageToken);
      if (pageToken) {
        // Append for pagination
        setUploadedDocuments(prev => [...prev, ...(response.documents || [])]);
      } else {
        // Replace for initial load
        setUploadedDocuments(response.documents || []);
      }
      // Note: If you need more than 20 documents, implement pagination UI
      // using response.nextPageToken
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
      
      // Initialize with selected stores from config, or first store if none selected
      if (employeeId) {
        const config = getEmployeeConfig(employeeId);
        const configStores = config.chat?.selectedStores || [];
        if (configStores.length > 0) {
          // Only include stores that actually exist
          const validStores = configStores.filter(storeName => 
            stores.some(s => s.name === storeName)
          );
          setSelectedStores(validStores);
          if (validStores.length > 0) {
            setStoreName(validStores[0]); // For document list display
            loadDocuments(validStores[0]);
          }
        } else if (stores.length > 0) {
          // Default to first store if none selected
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

  const uploadConfig = getEmployeeConfig(employeeId)?.upload;

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
    const maxAttempts = 60; // 5 minutes max
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
          setTimeout(poll, 5000); // Poll every 5 seconds
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

      // Upload each file to all selected stores
      for (const fileObj of files) {
        setUploadProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'uploading', stores: selectedStores.length }
        }));

        try {
          // Upload to all selected stores
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

              // Check if response is an operation (long-running)
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
          
          // Poll operations if any
          const operations = results.filter(r => r.type === 'operation');
          if (operations.length > 0) {
            setUploadProgress(prev => ({
              ...prev,
              [fileObj.id]: { status: 'processing', operations }
            }));
            
            // Poll all operations
            await Promise.all(operations.map(op => 
              pollOperationStatus(op.operationName, fileObj.id)
            ));
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [fileObj.id]: { status: 'completed' }
            }));
          }

          // Reload documents from first store
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
      
      // Reload documents after a short delay
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
    <div className="document-upload">
      <div className="upload-header">
        <h3>Train {employeeName || 'your AI employee'}</h3>
        <p>
          <strong>Part 1: Upload Documents Flow</strong><br />
          Upload documents directly to Google Files and attach them to your knowledge source (file store). 
          These documents will be processed and made searchable for AI-powered queries.
        </p>
        {availableStores.length === 0 && !loadingStores && (
          <div className="warning-message">
            ⚠️ No knowledge sources available. Please create a knowledge source in Settings first.
          </div>
        )}
        {availableStores.length > 0 && (
          <div className="store-selection-section" style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>
              Select Knowledge Sources ({selectedStores.length} selected)
            </h4>
            <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Choose which knowledge sources to upload files to. Files will be uploaded to all selected sources.
            </p>
            <div className="store-checkboxes" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableStores.map((store) => {
                const isSelected = selectedStores.includes(store.name);
                return (
                  <label
                    key={store.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      border: `2px solid ${isSelected ? '#667eea' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0f4ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStoreToggle(store.name)}
                      style={{
                        marginRight: '0.75rem',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isSelected ? '600' : '500', color: '#111827' }}>
                        {store.displayName || store.name.split('/').pop()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {store.activeDocumentsCount || 0} active documents
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ color: '#667eea', fontSize: '1.25rem' }}>✓</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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

      {files.length > 0 && (
        <div className="uploaded-files">
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
                          {progress.status === 'uploading' && <span className="status-uploading">⏳ Uploading...</span>}
                          {progress.status === 'processing' && <span className="status-processing">🔄 Processing...</span>}
                          {progress.status === 'completed' && <span className="status-completed">✓ Completed</span>}
                          {progress.status === 'error' && <span className="status-error">✗ Error: {progress.error}</span>}
                          {progress.status === 'timeout' && <span className="status-error">⏱ Timeout</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  {!progress && (
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="remove-file-btn"
                      title="Remove file"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="upload-actions">
          <button 
            className="train-button"
            onClick={handleUploadFiles}
            disabled={uploading || selectedStores.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload & Train AI Employee (${selectedStores.length} store${selectedStores.length > 1 ? 's' : ''})`}
          </button>
        </div>
      )}

      {uploadedDocuments.length > 0 && (
        <div className="uploaded-documents-section">
          <h4>Documents in Knowledge Source ({uploadedDocuments.length})</h4>
          <div className="documents-list">
            {uploadedDocuments.map((doc) => (
              <div key={doc.name} className="document-item">
                <div className="document-info">
                  <div className="document-icon">📚</div>
                  <div className="document-details">
                    <div className="document-name">{doc.displayName || doc.name}</div>
                    <div className="document-meta">
                      {doc.createTime && new Date(doc.createTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;

