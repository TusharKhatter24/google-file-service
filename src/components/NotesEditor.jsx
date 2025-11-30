import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generatePDFFromHTML } from '../utils/pdfGenerator';
import { uploadFile } from '../services/filesService';
import { importFileToStore, listFileStores } from '../services/fileStoreService';
import {
  summarizeText,
  rewriteText,
  extractKeyPoints,
  improveText,
  autoComplete,
  startSpeechRecognition,
  generateDocument,
} from '../services/aiNotesService';
import { analyzeWritingStyle, getContextAwareSuggestions } from '../services/conciergeService';
import { trackInteraction } from '../services/personalizationService';
import './NotesEditor.css';

function NotesEditor() {
  const { storeName: storeNameParam } = useParams();
  const navigate = useNavigate();
  const storeName = storeNameParam ? decodeURIComponent(storeNameParam) : null;
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showFileNameDialog, setShowFileNameDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const quillRef = useRef(null);
  
  // AI features state
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingType, setAiLoadingType] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [availableStores, setAvailableStores] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [recognition, setRecognition] = useState(null);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [styleAnalysis, setStyleAnalysis] = useState(null);
  const [contextSuggestions, setContextSuggestions] = useState([]);
  const [showStyleCheck, setShowStyleCheck] = useState(false);
  const [conciergeMode, setConciergeMode] = useState(true);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [documentPrompt, setDocumentPrompt] = useState('');
  const [documentType, setDocumentType] = useState('document');
  const [uploadOption, setUploadOption] = useState('store');
  const [showSegmentSelector, setShowSegmentSelector] = useState(false);
  const [segmentSearchQuery, setSegmentSearchQuery] = useState('');
  const [selectedUploadSegment, setSelectedUploadSegment] = useState('');

  useEffect(() => {
    setContent('');
    setError(null);
    setFileName('');
    setShowFileNameDialog(false);
    setSelectedText('');
    setSelectedRange(null);
    setAiSuggestions(null);
    setTranscriptionText('');
    setUploadOption('store'); // Reset to default
    setShowSegmentSelector(false);
    setSegmentSearchQuery('');
    setSelectedUploadSegment('');
    loadFileStores();
    
    // Cleanup on unmount
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [storeName]);

  // Close segment selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSegmentSelector && !event.target.closest('.segment-selector-wrapper')) {
        setShowSegmentSelector(false);
      }
    };

    if (showSegmentSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSegmentSelector]);

  const loadFileStores = async () => {
    try {
      const response = await listFileStores(20);
      setAvailableStores(response.fileSearchStores || []);
      // Pre-select the current store if provided
      if (storeName) {
        const store = (response.fileSearchStores || []).find(
          s => s.name === storeName
        );
        if (store) {
          setSelectedStores([store.name]);
          setSelectedUploadSegment(storeName);
        }
      }
    } catch (err) {
      console.error('Failed to load file stores:', err);
    }
  };

  const handleTextSelection = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const selection = quill.getSelection();
    if (selection && selection.length > 0) {
      const text = quill.getText(selection.index, selection.length);
      setSelectedText(text);
      setSelectedRange(selection);
    } else {
      setSelectedText('');
      setSelectedRange(null);
    }
  };

  const handleInsertAIText = (aiText, replaceSelection = false) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    if (replaceSelection && selectedRange) {
      // Replace selected text
      quill.deleteText(selectedRange.index, selectedRange.length);
      quill.insertText(selectedRange.index, aiText);
      quill.setSelection(selectedRange.index + aiText.length);
    } else {
      // Insert at cursor
      const selection = quill.getSelection();
      const index = selection ? selection.index : quill.getLength();
      quill.insertText(index, aiText);
      quill.setSelection(index + aiText.length);
    }
    setSelectedText('');
    setSelectedRange(null);
  };

  const handleSummarize = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // Use selected text or all content if nothing is selected
    const textToProcess = selectedText.trim() || quill.getText().trim();
    
    if (!textToProcess) {
      setError('Please enter some text to summarize.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('summarize');
      setError(null);

      const storeNames = selectedStores.length > 0 ? selectedStores : null;
      const summary = await summarizeText(textToProcess, storeNames);
      
      if (selectedText.trim() && selectedRange) {
        handleInsertAIText(`\n\n**Summary:**\n${summary}\n\n`, true);
      } else {
        handleInsertAIText(`\n\n**Summary:**\n${summary}\n\n`, false);
      }
    } catch (err) {
      setError(err.message || 'Failed to summarize text.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleRewrite = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // Use selected text or all content if nothing is selected
    const textToProcess = selectedText.trim() || quill.getText().trim();
    
    if (!textToProcess) {
      setError('Please enter some text to rewrite.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('rewrite');
      setError(null);

      const storeNames = selectedStores.length > 0 ? selectedStores : null;
      const rewritten = await rewriteText(textToProcess, 'improve the writing', storeNames);
      
      if (selectedText.trim() && selectedRange) {
        handleInsertAIText(rewritten, true);
      } else {
        handleInsertAIText(rewritten, false);
      }
    } catch (err) {
      setError(err.message || 'Failed to rewrite text.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleExtractKeyPoints = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // Use selected text or all content if nothing is selected
    const textToProcess = selectedText.trim() || quill.getText().trim();
    
    if (!textToProcess) {
      setError('Please enter some text to extract key points from.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('extract');
      setError(null);

      const storeNames = selectedStores.length > 0 ? selectedStores : null;
      const keyPoints = await extractKeyPoints(textToProcess, storeNames);
      
      if (selectedText.trim() && selectedRange) {
        handleInsertAIText(`\n\n**Key Points:**\n${keyPoints}\n\n`, true);
      } else {
        handleInsertAIText(`\n\n**Key Points:**\n${keyPoints}\n\n`, false);
      }
    } catch (err) {
      setError(err.message || 'Failed to extract key points.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleImproveText = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // Use selected text or all content if nothing is selected
    const textToProcess = selectedText.trim() || quill.getText().trim();
    
    if (!textToProcess) {
      setError('Please enter some text to improve.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('improve');
      setError(null);

      const storeNames = selectedStores.length > 0 ? selectedStores : null;
      const improved = await improveText(textToProcess, storeNames);
      
      if (selectedText.trim() && selectedRange) {
        handleInsertAIText(improved, true);
      } else {
        handleInsertAIText(improved, false);
      }
      
      // Track interaction
      trackInteraction('writing', { type: 'improve', style: 'improved' });
    } catch (err) {
      setError(err.message || 'Failed to improve text.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleCheckStyleConsistency = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const textToCheck = quill.getText().trim();
    
    if (!textToCheck) {
      setError('Please enter some text to check style consistency.');
      return;
    }

    if (selectedStores.length === 0) {
      setError('Please select at least one store for style comparison.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('style');
      setError(null);
      setShowStyleCheck(true);

      const analysis = await analyzeWritingStyle(selectedStores, textToCheck);
      setStyleAnalysis(analysis);
      
      // Track interaction
      trackInteraction('writing', { type: 'style_check' });
    } catch (err) {
      setError(err.message || 'Failed to check style consistency.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleGetContextSuggestions = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const currentText = quill.getText().trim();
    
    if (!currentText) {
      setError('Please enter some text to get context suggestions.');
      return;
    }

    if (selectedStores.length === 0) {
      setError('Please select at least one store for context.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('context');
      setError(null);

      const suggestions = await getContextAwareSuggestions(selectedStores, currentText);
      setContextSuggestions(Array.isArray(suggestions) ? suggestions : []);
      
      // Track interaction
      trackInteraction('concierge', { type: 'context_suggestions' });
    } catch (err) {
      setError(err.message || 'Failed to get context suggestions.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleAutoComplete = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const selection = quill.getSelection();
    if (!selection) return;

    // Get text from the beginning of the current line or paragraph
    const currentIndex = selection.index;
    const textBefore = quill.getText(0, currentIndex);
    
    // Try to get the last paragraph first
    let textToComplete = textBefore.split('\n').pop() || textBefore;
    
    // If the last paragraph is too short, use more context
    // Get the last 500 characters or last 3 paragraphs, whichever is more
    if (textToComplete.trim().length < 10) {
      // Get last 500 characters for better context
      const last500Chars = textBefore.slice(Math.max(0, textBefore.length - 500));
      if (last500Chars.trim().length >= 10) {
        textToComplete = last500Chars;
      } else {
        // If still not enough, use all content
        const allText = quill.getText().trim();
        if (allText.length >= 10) {
          textToComplete = allText;
        } else {
          setError('Please write at least 10 characters for auto-completion.');
          return;
        }
      }
    }

    try {
      setAiLoading(true);
      setAiLoadingType('autocomplete');
      setError(null);

      const storeNames = selectedStores.length > 0 ? selectedStores : null;
      const completion = await autoComplete(textToComplete, storeNames);
      setAiSuggestions(completion);
    } catch (err) {
      setError(err.message || 'Failed to generate suggestions.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleStartRecording = () => {
    try {
      const rec = startSpeechRecognition(
        (result) => {
          setTranscriptionText(result.final + result.interim);
        },
        (err) => {
          setError(err.message || 'Speech recognition error.');
          setIsRecording(false);
        }
      );
      setRecognition(rec);
      setIsRecording(true);
      setTranscriptionText('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Speech recognition is not available.');
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors
      }
    }
    setIsRecording(false);
    
    // Insert transcribed text if available
    if (transcriptionText.trim()) {
      handleInsertAIText(transcriptionText + ' ');
      setTranscriptionText('');
    }
  };

  const handleGenerateDocument = async () => {
    if (!documentPrompt.trim()) {
      setError('Please enter requirements for the document.');
      return;
    }

    try {
      setAiLoading(true);
      setAiLoadingType('document');
      setError(null);

      const storeNames = selectedStores.length > 0 ? selectedStores : null;
      const document = await generateDocument(documentPrompt, documentType, storeNames);
      
      // Replace current content with generated document
      const quill = quillRef.current?.getEditor();
      if (quill) {
        quill.root.innerHTML = document;
      }
      
      // Close dialog and clear prompt
      setShowDocumentDialog(false);
      setDocumentPrompt('');
      
      // Track interaction
      trackInteraction('document', { type: 'generate', documentType });
    } catch (err) {
      setError(err.message || 'Failed to generate document.');
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please enter some content before saving.');
      return;
    }

    // Show file name dialog
    setShowFileNameDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!fileName.trim()) {
      setError('Please enter a file name.');
      return;
    }

    // Validate segment selection if uploading to store
    if (uploadOption === 'store') {
      const segmentToUse = storeName || selectedUploadSegment;
      if (!segmentToUse) {
        setError('Please select a Knowledge Segment to upload to.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      // Stop recording if active
      if (isRecording && recognition) {
        handleStopRecording();
      }

      // Get HTML content from Quill
      const quill = quillRef.current?.getEditor();
      if (!quill) {
        throw new Error('Editor not available');
      }

      const htmlContent = quill.root.innerHTML;

      // Ensure file name has .pdf extension
      const finalFileName = fileName.trim().endsWith('.pdf') 
        ? fileName.trim() 
        : `${fileName.trim()}.pdf`;

      // Step 1: Generate PDF
      const pdfFile = await generatePDFFromHTML(htmlContent, finalFileName);

      // Ensure the PDF file has a name
      if (!pdfFile || !pdfFile.name) {
        throw new Error('Failed to generate PDF: Generated file is missing a name');
      }

      // Step 2: Upload PDF to files
      const uploadedFile = await uploadFile(pdfFile, finalFileName);
      
      // Handle different response structures
      let uploadedFileName = null;
      
      if (uploadedFile?.name) {
        uploadedFileName = uploadedFile.name;
      } else if (uploadedFile?.file?.name) {
        uploadedFileName = uploadedFile.file.name;
      } else {
        // Log the actual response for debugging
        console.error('Upload response structure:', uploadedFile);
        throw new Error(
          `Failed to upload file: No file name returned. Response: ${JSON.stringify(uploadedFile)}`
        );
      }

      // Step 3: Upload based on selected option
      if (uploadOption === 'store') {
        // Import file to store - use storeName if available, otherwise use selectedUploadSegment
        const segmentToUse = storeName || selectedUploadSegment;
        const decodedStoreName = decodeURIComponent(segmentToUse);
        await importFileToStore(decodedStoreName, uploadedFileName);

        // Close dialog and navigate
        setShowFileNameDialog(false);
        setContent('');
        setFileName('');
        setSelectedUploadSegment('');
        
        navigate('/segments');
      } else {
        // Just upload to files, don't import to store
        setShowFileNameDialog(false);
        setContent('');
        setFileName('');
        setSelectedUploadSegment('');
        
        navigate('/segments');
      }
    } catch (err) {
      setError(err.message || 'Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelFileName = () => {
    setShowFileNameDialog(false);
    setFileName('');
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
    if (selectedStores.length === availableStores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(availableStores.map(s => s.name));
    }
  };

  return (
    <div className="notes-editor-page">
      <div className="notes-editor-container">
        <div className="notes-editor-header">
          <div>
            <h3>Knowledge Taker</h3>
            {storeName && (
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Writing notes for: {availableStores.find(s => s.name === storeName)?.displayName || storeName}
              </p>
            )}
          </div>
          <div className="notes-editor-header-actions">
            <button
              className="btn btn-icon"
              onClick={() => setShowAIPanel(!showAIPanel)}
              title={showAIPanel ? 'Hide AI Tools' : 'Show AI Tools'}
            >
              {showAIPanel ? '🤖' : '🤖'}
            </button>
            <Link to="/segments" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              ← Back
            </Link>
          </div>
        </div>

        {error && <div className="notes-editor-error">{error}</div>}

        {/* AI Tools Panel */}
        {showAIPanel && (
          <div className="ai-tools-panel">
            <div className="ai-tools-header">
              <span className="ai-tools-title">AI Tools</span>
              {selectedStores.length > 0 && (
                <span className="context-indicator">
                  {selectedStores.length} segment{selectedStores.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            
            <div className="ai-tools-content">
              {/* Context Selector */}
              <div className="context-selector">
                <div className="context-selector-header">
                  <label>Knowledge Segment Context (optional)</label>
                  <span className="context-help-text">
                    Select segments to provide context for AI suggestions
                  </span>
                </div>
                
                {/* Selected Segments Pills */}
                {selectedStores.length > 0 && (
                  <div className="selected-segments-pills">
                    {selectedStores.map(storeName => {
                      const store = availableStores.find(s => s.name === storeName);
                      return (
                        <div key={storeName} className="segment-pill">
                          <span className="pill-name">
                            {store?.displayName || storeName.split('/').pop()}
                          </span>
                          {store && (
                            <span className="pill-count">
                              {store.activeDocumentsCount || 0} docs
                            </span>
                          )}
                          <button
                            className="pill-remove"
                            onClick={() => handleStoreToggle(storeName)}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Segment Selector Dropdown */}
                <div className="segment-selector-wrapper">
                  <button
                    className="segment-selector-trigger"
                    onClick={() => setShowSegmentSelector(!showSegmentSelector)}
                    type="button"
                  >
                    <span>
                      {selectedStores.length === 0
                        ? 'Select knowledge segments...'
                        : `${selectedStores.length} segment${selectedStores.length !== 1 ? 's' : ''} selected`}
                    </span>
                    <span className="dropdown-icon">
                      {showSegmentSelector ? '▲' : '▼'}
                    </span>
                  </button>

                  {showSegmentSelector && (
                    <div className="segment-selector-dropdown">
                      {availableStores.length > 0 && (
                        <>
                          <div className="segment-search">
                            <input
                              type="text"
                              placeholder="Search segments..."
                              value={segmentSearchQuery}
                              onChange={(e) => setSegmentSearchQuery(e.target.value)}
                              className="segment-search-input"
                              autoFocus
                            />
                          </div>
                          <div className="segment-selector-actions">
                            <button
                              type="button"
                              className="segment-action-btn"
                              onClick={handleSelectAllStores}
                            >
                              {selectedStores.length === availableStores.length ? 'Clear All' : 'Select All'}
                            </button>
                          </div>
                        </>
                      )}
                      
                      <div className="segment-list">
                        {availableStores
                          .filter(store => {
                            if (!segmentSearchQuery) return true;
                            const searchLower = segmentSearchQuery.toLowerCase();
                            const displayName = (store.displayName || store.name).toLowerCase();
                            return displayName.includes(searchLower);
                          })
                          .map(store => (
                            <label
                              key={store.name}
                              className={`segment-option ${selectedStores.includes(store.name) ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedStores.includes(store.name)}
                                onChange={() => handleStoreToggle(store.name)}
                              />
                              <div className="segment-option-content">
                                <div className="segment-option-name">
                                  {store.displayName || store.name.split('/').pop()}
                                </div>
                                <div className="segment-option-meta">
                                  <span>{store.activeDocumentsCount || 0} documents</span>
                                  {store.pendingDocumentsCount > 0 && (
                                    <span className="pending-badge">
                                      {store.pendingDocumentsCount} pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        {availableStores.length === 0 && (
                          <div className="no-segments-message">
                            <p>No knowledge segments available</p>
                            <Link to="/segments" className="create-segment-link">
                              Create your first segment →
                            </Link>
                          </div>
                        )}
                        {availableStores.length > 0 && 
                         availableStores.filter(store => {
                           if (!segmentSearchQuery) return true;
                           const searchLower = segmentSearchQuery.toLowerCase();
                           const displayName = (store.displayName || store.name).toLowerCase();
                           return displayName.includes(searchLower);
                         }).length === 0 && (
                          <div className="no-segments-message">
                            <p>No segments match "{segmentSearchQuery}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Action Buttons */}
              <div className="ai-actions">
                <button
                  className="ai-btn"
                  onClick={handleSummarize}
                  disabled={aiLoading || !content.trim()}
                  title={selectedText.trim() ? "Summarize selected text" : "Summarize all text"}
                >
                  {aiLoadingType === 'summarize' ? '⏳' : '📝'} Summarize
                </button>
                <button
                  className="ai-btn"
                  onClick={handleRewrite}
                  disabled={aiLoading || !content.trim()}
                  title={selectedText.trim() ? "Rewrite/improve selected text" : "Rewrite/improve all text"}
                >
                  {aiLoadingType === 'rewrite' ? '⏳' : '✏️'} Rewrite
                </button>
                <button
                  className="ai-btn"
                  onClick={handleExtractKeyPoints}
                  disabled={aiLoading || !content.trim()}
                  title={selectedText.trim() ? "Extract key points from selected text" : "Extract key points from all text"}
                >
                  {aiLoadingType === 'extract' ? '⏳' : '🔑'} Extract Key Points
                </button>
                <button
                  className="ai-btn"
                  onClick={handleImproveText}
                  disabled={aiLoading || !content.trim()}
                  title={selectedText.trim() ? "Improve selected text" : "Improve all text"}
                >
                  {aiLoadingType === 'improve' ? '⏳' : '✨'} Improve
                </button>
                <button
                  className="ai-btn"
                  onClick={handleAutoComplete}
                  disabled={aiLoading}
                  title="Auto-complete text"
                >
                  {aiLoadingType === 'autocomplete' ? '⏳' : '⚡'} Auto-Complete
                </button>
                <button
                  className={`ai-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={aiLoading}
                  title={isRecording ? 'Stop recording' : 'Start voice transcription'}
                >
                  {isRecording ? '🔴' : '🎤'} {isRecording ? 'Stop' : 'Voice'}
                </button>
              </div>

              {/* Transcription Display */}
              {isRecording && (
                <div className="transcription-display">
                  <div className="recording-indicator">
                    <span className="pulse"></span>
                    Recording...
                  </div>
                  {transcriptionText && (
                    <div className="transcription-text">{transcriptionText}</div>
                  )}
                </div>
              )}

              {/* AI Suggestions */}
              {aiSuggestions && (
                <div className="ai-suggestions">
                  <div className="suggestions-header">
                    <span>Suggestions:</span>
                    <button
                      className="btn-close-suggestions"
                      onClick={() => setAiSuggestions(null)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="suggestions-content">{aiSuggestions}</div>
                  <button
                    className="btn-insert-suggestion"
                    onClick={() => {
                      handleInsertAIText(aiSuggestions);
                      setAiSuggestions(null);
                    }}
                  >
                    Insert
                  </button>
                </div>
              )}

              {/* AI Document Tools */}
              <div className="ai-notes-section">
                <div className="concierge-section-title">AI Documents</div>
                <div className="ai-actions">
                  <button
                    className="ai-btn ai-document-btn"
                    onClick={() => setShowDocumentDialog(true)}
                    disabled={aiLoading}
                    title="Generate a complete document with AI"
                  >
                    📄 Generate Document
                  </button>
                </div>
              </div>

              {/* Concierge Features */}
              {conciergeMode && selectedStores.length > 0 && (
                <div className="concierge-actions">
                  <div className="concierge-section-title">Concierge Features</div>
                  <div className="ai-actions">
                    <button
                      className="ai-btn concierge-btn"
                      onClick={handleCheckStyleConsistency}
                      disabled={aiLoading || !content.trim()}
                      title="Check style consistency with knowledge base"
                    >
                      {aiLoadingType === 'style' ? '⏳' : '🎨'} Check Style
                    </button>
                    <button
                      className="ai-btn concierge-btn"
                      onClick={handleGetContextSuggestions}
                      disabled={aiLoading || !content.trim()}
                      title="Get context-aware suggestions from knowledge base"
                    >
                      {aiLoadingType === 'context' ? '⏳' : '💡'} Context Suggestions
                    </button>
                  </div>
                </div>
              )}

              {/* Style Analysis Results */}
              {showStyleCheck && styleAnalysis && (
                <div className="style-analysis-panel">
                  <div className="style-analysis-header">
                    <span>Style Analysis</span>
                    <button
                      className="btn-close-suggestions"
                      onClick={() => {
                        setShowStyleCheck(false);
                        setStyleAnalysis(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="style-analysis-content">
                    <div className="style-metric">
                      <strong>Consistency:</strong> {styleAnalysis.consistent ? '✓ Consistent' : '⚠ Needs improvement'}
                    </div>
                    {styleAnalysis.suggestions && (
                      <div className="style-suggestions">
                        <strong>Suggestions:</strong>
                        <ul>
                          {Array.isArray(styleAnalysis.suggestions) ? (
                            styleAnalysis.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))
                          ) : (
                            <li>{styleAnalysis.suggestions}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {styleAnalysis.tone && (
                      <div className="style-tone">
                        <strong>Tone:</strong> {styleAnalysis.tone}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Context Suggestions */}
              {contextSuggestions.length > 0 && (
                <div className="context-suggestions-panel">
                  <div className="suggestions-header">
                    <span>Context Suggestions</span>
                    <button
                      className="btn-close-suggestions"
                      onClick={() => setContextSuggestions([])}
                    >
                      ×
                    </button>
                  </div>
                  <div className="context-suggestions-list">
                    {contextSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="context-suggestion-item">
                        <div className="suggestion-type">{suggestion.type || 'general'}</div>
                        <h4>{suggestion.title || 'Suggestion'}</h4>
                        <p>{suggestion.description || suggestion}</p>
                        {suggestion.source && (
                          <span className="suggestion-source">Source: {suggestion.source}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="notes-editor-body">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            onSelectionChange={handleTextSelection}
            placeholder="Start writing your notes here... Use AI tools to enhance your writing!"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
              ],
            }}
            formats={[
              'header',
              'bold', 'italic', 'underline', 'strike',
              'list', 'bullet',
              'color', 'background',
              'align',
              'link', 'image'
            ]}
          />
        </div>

        <div className="notes-editor-footer">
          <div className="footer-info">
            {selectedText && (
              <span className="selection-info">
                {selectedText.length} character{selectedText.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="footer-actions">
            <Link
              to="/segments"
              className="btn btn-secondary"
            >
              Cancel
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !content.trim()}
            >
              Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* File Name Dialog */}
      {showFileNameDialog && (
        <div className="notes-editor-modal-overlay">
          <div className="notes-editor-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="notes-editor-dialog-header">
              <h4>Enter File Name</h4>
            </div>
            <div className="notes-editor-dialog-body">
              <div className="form-group">
                <label htmlFor="fileName">File Name</label>
                <input
                  id="fileName"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g., meeting-notes"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && fileName.trim()) {
                      handleConfirmSave();
                    }
                  }}
                />
                <small style={{ marginTop: '0.25rem', display: 'block' }}>
                  The file will be saved as a PDF. You can omit the .pdf extension.
                </small>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Upload To:</label>
                <div className="upload-options-container">
                  <label 
                    className={`upload-option-card ${uploadOption === 'store' ? 'selected' : ''}`}
                    onClick={(e) => {
                      if (e.target.tagName !== 'SELECT') {
                        setUploadOption('store');
                      }
                    }}
                  >
                    <div className="upload-option-header">
                      <input
                        type="radio"
                        name="uploadOption"
                        value="store"
                        checked={uploadOption === 'store'}
                        onChange={(e) => setUploadOption(e.target.value)}
                      />
                      <div className="upload-option-content">
                        <span className="upload-option-title">Knowledge Segment</span>
                        <span className="upload-option-description">Upload to a knowledge segment for AI context</span>
                      </div>
                    </div>
                    {uploadOption === 'store' && (
                      <div className="upload-option-details">
                        {storeName ? (
                          <div className="selected-segment-display">
                            <span className="segment-icon">📚</span>
                            <div className="segment-info">
                              <span className="segment-name">
                                {availableStores.find(s => s.name === storeName)?.displayName || storeName.split('/').pop()}
                              </span>
                              <span className="segment-meta">
                                {availableStores.find(s => s.name === storeName)?.activeDocumentsCount || 0} documents
                              </span>
                            </div>
                          </div>
                        ) : (
                          <select
                            value={selectedUploadSegment}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedUploadSegment(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="segment-select-dropdown"
                          >
                            <option value="">Select a Knowledge Segment...</option>
                            {availableStores.map(store => (
                              <option key={store.name} value={store.name}>
                                {store.displayName || store.name.split('/').pop()} ({store.activeDocumentsCount || 0} docs)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </label>
                  <label 
                    className={`upload-option-card ${uploadOption === 'files' ? 'selected' : ''}`}
                    onClick={() => setUploadOption('files')}
                  >
                    <div className="upload-option-header">
                      <input
                        type="radio"
                        name="uploadOption"
                        value="files"
                        checked={uploadOption === 'files'}
                        onChange={(e) => setUploadOption(e.target.value)}
                      />
                      <div className="upload-option-content">
                        <span className="upload-option-title">Files Only</span>
                        <span className="upload-option-description">Save to files without adding to knowledge segment</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="notes-editor-dialog-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancelFileName}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmSave}
                disabled={saving || !fileName.trim() || (uploadOption === 'store' && !storeName && !selectedUploadSegment)}
              >
                {saving ? 'Saving...' : 'Save & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Generation Dialog */}
      {showDocumentDialog && (
        <div className="notes-editor-modal-overlay">
          <div className="notes-editor-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="notes-editor-dialog-header">
              <h4>Generate Document</h4>
            </div>
            <div className="notes-editor-dialog-body">
              <div className="form-group">
                <label htmlFor="documentType">Document Type</label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    marginBottom: '1rem'
                  }}
                >
                  <option value="document">General Document</option>
                  <option value="meeting notes">Meeting Notes</option>
                  <option value="report">Report</option>
                  <option value="summary">Summary</option>
                  <option value="proposal">Proposal</option>
                  <option value="memo">Memo</option>
                  <option value="article">Article</option>
                  <option value="essay">Essay</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="documentPrompt">Requirements or Topic</label>
                <textarea
                  id="documentPrompt"
                  value={documentPrompt}
                  onChange={(e) => setDocumentPrompt(e.target.value)}
                  placeholder="e.g., Write a report on Q4 sales performance, Create meeting notes for the team standup, Generate a proposal for the new project..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  autoFocus
                />
                <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                  Describe what you want the document to contain. The AI will generate a complete, well-structured document.
                </small>
              </div>
            </div>
            <div className="notes-editor-dialog-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDocumentDialog(false);
                  setDocumentPrompt('');
                }}
                disabled={aiLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerateDocument}
                disabled={aiLoading || !documentPrompt.trim()}
              >
                {aiLoadingType === 'document' ? 'Generating...' : 'Generate Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesEditor;
