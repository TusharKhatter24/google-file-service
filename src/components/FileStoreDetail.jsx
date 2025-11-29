import React, { useState, useEffect, useRef } from 'react';
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
  generateAudioWithStore,
} from '../services/fileStoreService';
import { listFiles } from '../services/filesService';
import { synthesizeKnowledge } from '../services/documentAnalysisService';
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
  const pollingIntervalRef = useRef(null);
  const isProcessingDoneRef = useRef(false);
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
  const [showSources, setShowSources] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'audio'
  const [outputMode, setOutputMode] = useState('text'); // 'text' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [synthesisMode, setSynthesisMode] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const isLoadingStoreDetailsRef = useRef(false);
  const isLoadingDocumentsRef = useRef(false);

  useEffect(() => {
    loadStoreDetails();
    loadDocuments();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      isProcessingDoneRef.current = false;
      isLoadingStoreDetailsRef.current = false;
      isLoadingDocumentsRef.current = false;
    };
  }, [storeName]);

  const loadStoreDetails = async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingStoreDetailsRef.current) return;
    
    try {
      isLoadingStoreDetailsRef.current = true;
      setLoading(true);
      setError(null);
      const storeData = await getFileStore(decodeURIComponent(storeName));
      setStore(storeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      isLoadingStoreDetailsRef.current = false;
    }
  };

  const loadDocuments = async (pageToken = null) => {
    // Prevent multiple simultaneous calls (unless it's pagination)
    if (isLoadingDocumentsRef.current && !pageToken) return;
    
    try {
      isLoadingDocumentsRef.current = true;
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
      isLoadingDocumentsRef.current = false;
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
    // Prevent multiple simultaneous calls when operation is done
    if (isProcessingDoneRef.current) {
      return;
    }

    try {
      const status = await getOperationStatus(operationName);
      setOperationStatus(status);

      if (status.done) {
        // Mark as processing to prevent duplicate calls
        isProcessingDoneRef.current = true;
        
        // Clear interval immediately
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
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
      // Mark as processing to prevent duplicate calls
      isProcessingDoneRef.current = true;
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
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
        // Reset processing flag
        isProcessingDoneRef.current = false;
        setOperationStatus(response);
        const interval = setInterval(() => {
          pollOperationStatus(response.name);
        }, 2000);
        pollingIntervalRef.current = interval;
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
        // Reset processing flag
        isProcessingDoneRef.current = false;
        setSuccess('File import started! The file is being processed.');
        setOperationStatus(response);
        const interval = setInterval(() => {
          pollOperationStatus(response.name);
        }, 2000);
        pollingIntervalRef.current = interval;
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

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await handleAudioInput();
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleAudioInput = async () => {
    try {
      setChatLoading(true);
      setError(null);

      // Use Web Speech API for speech-to-text
      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        setError('Speech recognition not supported in this browser. Please use text input.');
        setChatLoading(false);
        setIsRecording(false);
        return;
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
      setError('Could not transcribe audio: ' + err.message + '. Please try typing your message.');
      setChatLoading(false);
      setIsRecording(false);
    }
  };

  const processMessage = async (userMessage, inputType = 'text') => {
    // Add user message to chat
    const newUserMessage = { 
      id: Date.now(),
      role: 'user', 
      text: userMessage,
      inputType: inputType
    };
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

      // Enhanced search: Use knowledge synthesis if enabled
      if (synthesisMode) {
        try {
          const synthesized = await synthesizeKnowledge(decodedStoreName, userMessage);
          
          // Add synthesized response
          const synthesizedMessage = {
            id: Date.now(),
            role: 'model',
            text: synthesized,
            outputType: 'text',
            sources: [],
            synthesized: true,
          };
          setChatMessages(prev => [...prev, synthesizedMessage]);
          setChatLoading(false);
          return;
        } catch (err) {
          console.error('Synthesis failed, falling back to regular search:', err);
          setError('Synthesis failed: ' + err.message + '. Using regular search.');
          // Fall through to regular search
        }
      }
      
      let response;
      
      if (outputMode === 'audio') {
        // Step 1: Generate text response first (this includes FileSearchStore search)
        const textResponse = await generateContentWithStore(
          decodedStoreName,
          userMessage,
          conversationHistory
        );

        // Extract text response
        const candidate = textResponse.candidates?.[0];
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

        // Step 2: Show text response immediately with "Generating audio..." indicator
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

        // Step 3: Generate audio from the text response
        try {
          response = await generateAudioWithStore(
            decodedStoreName,
            responseText, // Use the generated text
            [], // No conversation history for TTS
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
          // Update message to show audio generation failed
          setChatMessages(prev => prev.map(msg => 
            msg.id === textMessageId
              ? {
                  ...msg,
                  generatingAudio: false,
                  audioError: audioError.message
                }
              : msg
          ));
          throw audioError;
        }
      } else {
        // Generate text response
        response = await generateContentWithStore(
          decodedStoreName,
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
          id: Date.now(),
          role: 'model', 
          text: responseText,
          sources: sources,
          outputType: 'text',
          synthesized: false
        };
        setChatMessages(prev => [...prev, modelMessage]);
        
        // Extract related documents from sources
        if (sources.length > 0) {
          setRelatedDocuments(sources.map(s => s.title || s.fileSearchStore).filter(Boolean));
        }
        
        // Extract related documents from sources
        if (sources.length > 0) {
          setRelatedDocuments(sources.map(s => s.title || s.fileSearchStore).filter(Boolean));
        }
      }
    } catch (err) {
      setError(err.message);
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
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    await processMessage(userMessage, 'text');
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/notes/${encodeURIComponent(storeName)}`)}
            >
              Take Notes
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleOpenImportModal}
              disabled={importing}
            >
              Import from Files
            </button>
          </div>
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
                      {msg.generatingAudio && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.75rem', 
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>●</span>
                          Generating audio...
                        </div>
                      )}
                      {msg.outputType === 'audio' && msg.audioUrl && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <audio
                            controls
                            src={msg.audioUrl}
                            style={{ width: '100%', maxWidth: '300px' }}
                          />
                        </div>
                      )}
                      {msg.audioError && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.75rem', 
                          color: '#dc2626',
                          opacity: 0.8
                        }}>
                          Audio generation failed: {msg.audioError}
                        </div>
                      )}
                      {msg.synthesized && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f0f9ff', borderRadius: '4px', fontSize: '0.75rem', color: '#1e40af' }}>
                          ✨ Synthesized from multiple documents
                        </div>
                      )}
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
              {/* Knowledge Synthesis Toggle */}
              <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#4b5563' }}>
                  <input
                    type="checkbox"
                    checked={synthesisMode}
                    onChange={(e) => setSynthesisMode(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Knowledge Synthesis Mode</span>
                </label>
                {synthesisMode && (
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontStyle: 'italic' }}>
                    (Combining information from multiple documents)
                  </span>
                )}
              </div>
              {/* Mode Toggles */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#6b7280' }}>Input:</span>
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    style={{
                      padding: '0.25rem 0.75rem',
                      border: `1px solid ${inputMode === 'text' ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '4px',
                      backgroundColor: inputMode === 'text' ? '#3b82f6' : 'transparent',
                      color: inputMode === 'text' ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('audio')}
                    style={{
                      padding: '0.25rem 0.75rem',
                      border: `1px solid ${inputMode === 'audio' ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '4px',
                      backgroundColor: inputMode === 'audio' ? '#3b82f6' : 'transparent',
                      color: inputMode === 'audio' ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Audio
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#6b7280' }}>Output:</span>
                  <button
                    type="button"
                    onClick={() => setOutputMode('text')}
                    style={{
                      padding: '0.25rem 0.75rem',
                      border: `1px solid ${outputMode === 'text' ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '4px',
                      backgroundColor: outputMode === 'text' ? '#3b82f6' : 'transparent',
                      color: outputMode === 'text' ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputMode('audio')}
                    style={{
                      padding: '0.25rem 0.75rem',
                      border: `1px solid ${outputMode === 'audio' ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '4px',
                      backgroundColor: outputMode === 'audio' ? '#3b82f6' : 'transparent',
                      color: outputMode === 'audio' ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Audio
                  </button>
                </div>
              </div>

              {inputMode === 'text' ? (
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={synthesisMode ? "Ask a question - I'll synthesize information from all documents..." : "Ask a question about your documents..."}
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
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn btn-primary"
                    disabled={chatLoading || isRecording}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    🎤 Speak
                  </button>
                  {isRecording && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#dc2626',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: '#dc2626',
                        animation: 'pulse 1s ease-in-out infinite'
                      }}></span>
                      Listening...
                    </div>
                  )}
                </div>
              )}
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

