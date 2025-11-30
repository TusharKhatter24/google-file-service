import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  uploadFile,
  listFiles,
  getFile,
  deleteFile,
  extractFileContent,
  extractTextContent,
  extractTextFromFileUsingGemini,
} from '../services/filesService';
import { listFileStores, importFileToStore } from '../services/fileStoreService';
import './Files.css';

function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDisplayName, setFileDisplayName] = useState('');
  const [extracting, setExtracting] = useState(null);
  const [extractedContent, setExtractedContent] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [selectedFileForAttach, setSelectedFileForAttach] = useState(null);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [storesNextPageToken, setStoresNextPageToken] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async (pageToken = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFiles(20, pageToken);
      if (pageToken) {
        setFiles(prev => [...prev, ...(response.files || [])]);
      } else {
        setFiles(response.files || []);
      }
      setNextPageToken(response.nextPageToken || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      await uploadFile(selectedFile, fileDisplayName || selectedFile.name);
      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      setFileDisplayName('');
      await loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleExtractContent = async (file) => {
    try {
      setExtracting(file.name);
      setError(null);
      
      // Always get full file details first to ensure we have downloadUri
      const fileData = await getFile(file.name);
      
      // Check if file is active
      if (fileData.state !== 'ACTIVE') {
        throw new Error(`File is not ready. Current state: ${fileData.state}. Please wait for processing to complete.`);
      }
      
      // Extract content based on file type
      if (fileData.mimeType?.startsWith('text/') || 
          fileData.mimeType === 'application/json') {
        try {
          const content = await extractTextContent(fileData);
          setExtractedContent({
            file: fileData,
            content: content,
            type: 'text',
          });
        } catch (textError) {
          // If text extraction fails, try blob download
          const result = await extractFileContent(fileData);
          setExtractedContent({
            file: fileData,
            content: result.content,
            type: result.mimeType.includes('text') ? 'text' : 'blob',
          });
        }
      } else if (fileData.mimeType === 'application/pdf') {
        // For PDFs, try to extract text using Gemini API first
        try {
          const textContent = await extractTextFromFileUsingGemini(fileData);
          setExtractedContent({
            file: fileData,
            content: textContent,
            type: 'text',
          });
        } catch (geminiError) {
          // If Gemini extraction fails, try downloading as blob
          try {
            const result = await extractFileContent(fileData);
            setExtractedContent({
              file: fileData,
              content: result.content,
              type: 'blob',
            });
          } catch (pdfError) {
            throw new Error(`Failed to extract PDF content: ${geminiError.message}`);
          }
        }
      } else {
        // For other binary files, download as blob
        const result = await extractFileContent(fileData);
        setExtractedContent({
          file: fileData,
          content: result.content,
          type: 'blob',
        });
      }
      
      setShowContentModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setExtracting(null);
    }
  };

  const handleDeleteFile = async (fileName, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName || fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingFile(fileName);
      setError(null);
      await deleteFile(fileName);
      setSuccess('File deleted successfully!');
      await loadFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingFile(null);
    }
  };

  const handleAttachToStore = async (file) => {
    setSelectedFileForAttach(file);
    setShowAttachModal(true);
    setLoadingStores(true);
    try {
      const response = await listFileStores(20); // Maximum page size is 20
      setStores(response.fileSearchStores || []);
      setStoresNextPageToken(response.nextPageToken || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStores(false);
    }
  };

  const loadMoreStores = async () => {
    if (!storesNextPageToken) return;
    try {
      setLoadingStores(true);
      const response = await listFileStores(20, storesNextPageToken);
      setStores(prev => [...prev, ...(response.fileSearchStores || [])]);
      setStoresNextPageToken(response.nextPageToken || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleImportToStore = async (storeName) => {
    if (!selectedFileForAttach) return;

    try {
      setAttaching(true);
      setError(null);
      const response = await importFileToStore(
        storeName,
        selectedFileForAttach.name
      );
      
      // Check if it's a long-running operation
      if (response.name) {
        setSuccess('File import started! The file is being processed.');
      } else {
        setSuccess('File imported successfully!');
      }
      
      setShowAttachModal(false);
      setSelectedFileForAttach(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAttaching(false);
    }
  };

  const handleDownloadContent = () => {
    if (!extractedContent) return;
    
    const blob = extractedContent.type === 'blob' 
      ? extractedContent.content 
      : new Blob([extractedContent.content], { type: extractedContent.file.mimeType });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = extractedContent.file.displayName || extractedContent.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      'ACTIVE': { label: 'Active', className: 'badge-success' },
      'PROCESSING': { label: 'Processing', className: 'badge-warning' },
      'FAILED': { label: 'Failed', className: 'badge-error' },
      'STATE_UNSPECIFIED': { label: 'Unknown', className: 'badge-secondary' },
    };
    const stateInfo = stateMap[state] || stateMap['STATE_UNSPECIFIED'];
    return <span className={`badge ${stateInfo.className}`}>{stateInfo.label}</span>;
  };

  const renderContentPreview = () => {
    if (!extractedContent) return null;

    if (extractedContent.type === 'text') {
      return (
        <pre className="content-preview-text">
          {extractedContent.content}
        </pre>
      );
    } else {
      return (
        <div className="content-preview-binary">
          <p>Binary file content extracted. Use the download button to save the file.</p>
          <p className="file-info">MIME Type: {extractedContent.file.mimeType}</p>
          <p className="file-info">Size: {formatBytes(extractedContent.file.sizeBytes)}</p>
        </div>
      );
    }
  };

  if (loading && files.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-section">
        <div>
          <h2>Files</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Upload and manage files using Google Files API
          </p>
        </div>
        <Link to="/stores" className="btn btn-secondary">
          ← Back to Stores
        </Link>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Upload File</h3>
        
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
                  Size: {formatBytes(selectedFile.size)} | Type: {selectedFile.type || 'Unknown'}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <div>Click to select a file or drag and drop</div>
                <div className="upload-info">
                  Supported formats: PDF, TXT, DOCX, Images, Audio, Video, and more
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

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#374151' }}>Uploaded Files</h3>
          <button
            className="btn btn-secondary"
            onClick={() => loadFiles()}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            <h3>No files found</h3>
            <p>Upload your first file to get started.</p>
          </div>
        ) : (
          <>
            <div className="file-list">
              {files.map((file) => (
                <div key={file.name} className="file-card">
                  <div className="file-info">
                    <div className="file-name-row">
                      <div className="file-name">{file.displayName || file.name}</div>
                      {getStateBadge(file.state)}
                    </div>
                    <div className="file-details">
                      <span>Size: {formatBytes(file.sizeBytes)}</span>
                      {file.mimeType && <span>Type: {file.mimeType}</span>}
                      <span>Created: {formatDate(file.createTime)}</span>
                      {file.expirationTime && <span>Expires: {formatDate(file.expirationTime)}</span>}
                    </div>
                    {file.uri && (
                      <div className="file-uri">
                        <strong>URI:</strong> <code>{file.uri}</code>
                      </div>
                    )}
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleExtractContent(file)}
                      disabled={extracting === file.name || file.state !== 'ACTIVE'}
                    >
                      {extracting === file.name ? 'Extracting...' : 'Extract Content'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleAttachToStore(file)}
                      disabled={file.state !== 'ACTIVE'}
                    >
                      Attach to Store
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteFile(file.name, file.displayName)}
                      disabled={deletingFile === file.name}
                    >
                      {deletingFile === file.name ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {nextPageToken && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => loadFiles(nextPageToken)}
                  disabled={loading}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showContentModal && extractedContent && (
        <div className="modal" onClick={() => setShowContentModal(false)}>
          <div className="modal-content content-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Extracted Content: {extractedContent.file.displayName || extractedContent.file.name}</h3>
              <button className="close-btn" onClick={() => setShowContentModal(false)}>
                ×
              </button>
            </div>
            <div className="content-modal-body">
              <div className="file-metadata-summary">
                <div><strong>MIME Type:</strong> {extractedContent.file.mimeType || 'N/A'}</div>
                <div><strong>Size:</strong> {formatBytes(extractedContent.file.sizeBytes)}</div>
                <div><strong>State:</strong> {getStateBadge(extractedContent.file.state)}</div>
                {extractedContent.file.uri && (
                  <div><strong>URI:</strong> <code style={{ fontSize: '0.85rem' }}>{extractedContent.file.uri}</code></div>
                )}
              </div>
              <div className="content-extracted">
                <h4>Content:</h4>
                {renderContentPreview()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleDownloadContent}
              >
                Download Content
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowContentModal(false);
                  setExtractedContent(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAttachModal && selectedFileForAttach && (
        <div className="modal" onClick={() => setShowAttachModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Attach File to Store</h3>
              <button className="close-btn" onClick={() => setShowAttachModal(false)}>
                ×
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Select a store to attach <strong>{selectedFileForAttach.displayName || selectedFileForAttach.name}</strong> to:
              </p>
              
              {loadingStores ? (
                <div className="loading">Loading stores...</div>
              ) : stores.length === 0 ? (
                <div className="empty-state">
                  <p>No stores available. Create a store first.</p>
                  <Link to="/stores" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Go to Stores
                  </Link>
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {stores.map((store) => (
                    <div
                      key={store.name}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => handleImportToStore(store.name)}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {store.displayName || store.name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {store.name}
                      </div>
                    </div>
                  ))}
                  {storesNextPageToken && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={loadMoreStores}
                        disabled={loadingStores}
                      >
                        {loadingStores ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAttachModal(false);
                  setSelectedFileForAttach(null);
                }}
                disabled={attaching}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;

