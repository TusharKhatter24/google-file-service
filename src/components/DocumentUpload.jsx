import React, { useState, useRef, useEffect } from 'react';
import { uploadFileToStore, getOperationStatus, listDocuments } from '../services/fileStoreService';
import { getEmployeeStore } from '../services/employeeStoreService';
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
    if (employeeId) {
      const store = getEmployeeStore(employeeId);
      setStoreName(store);
      if (store) {
        loadDocuments(store);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

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

  const handleUploadFiles = async () => {
    if (!storeName) {
      setError('No knowledge source selected. Please set up a knowledge source in Settings first.');
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
      for (const fileObj of files) {
        setUploadProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'uploading' }
        }));

        try {
          // Use chunking config from employee settings
          const chunkingConfig = uploadConfig?.chunkingConfig ? {
            chunkSize: uploadConfig.chunkingConfig.chunkSize,
            chunkOverlap: uploadConfig.chunkingConfig.chunkOverlap,
          } : null;

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
            setUploadProgress(prev => ({
              ...prev,
              [fileObj.id]: { status: 'processing', operationName: response.name }
            }));
            await pollOperationStatus(response.name, fileObj.id);
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [fileObj.id]: { status: 'completed' }
            }));
            await loadDocuments(storeName);
          }
        } catch (err) {
          setUploadProgress(prev => ({
            ...prev,
            [fileObj.id]: { status: 'error', error: err.message }
          }));
        }
      }

      setSuccess(`Successfully uploaded ${files.length} file(s)`);
      setFiles([]);
      
      // Reload documents after a short delay
      setTimeout(() => {
        if (storeName) {
          loadDocuments(storeName);
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
        {!storeName && (
          <div className="warning-message">
            ⚠️ No knowledge source configured. Please set up a knowledge source in Settings first.
          </div>
        )}
        {storeName && (
          <div className="info-message">
            ✓ Files will be uploaded to Google Files and imported into: {storeName}
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
            disabled={uploading || !storeName}
          >
            {uploading ? 'Uploading...' : 'Upload & Train AI Employee'}
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

