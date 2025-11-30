import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { listDocuments, listFileStores, getDocument } from '../services/fileStoreService';
import { generateComprehensiveNotes, generateNotesFromDocuments } from '../services/smartNoteService';
import { extractTextFromFileUsingGemini } from '../services/filesService';
import { extractTextFromFile } from '../utils/fileReader';
import {
  summarizeText,
  rewriteText,
  extractKeyPoints,
  improveText,
  autoComplete,
  startSpeechRecognition,
} from '../services/aiNotesService';
import { generatePDFFromHTML } from '../utils/pdfGenerator';
import { importFileToStore } from '../services/fileStoreService';
import './SmartNoteMaker.css';

function SmartNoteMaker({ employeeName, employeeId }) {
  const { storeName: routeStoreName } = useParams();
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [extractFiles, setExtractFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [extractingFile, setExtractingFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [storeName, setStoreName] = useState(routeStoreName ? decodeURIComponent(routeStoreName) : null);
  const [notes, setNotes] = useState('');
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [noteMode, setNoteMode] = useState('comprehensive'); // 'comprehensive', 'custom', 'manual'
  const extractFileInputRef = useRef(null);
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
  const [extractingContent, setExtractingContent] = useState(null);

  useEffect(() => {
    // Use route storeName if available, otherwise try employeeId (for backward compatibility)
    if (routeStoreName) {
      const decodedStoreName = decodeURIComponent(routeStoreName);
      setStoreName(decodedStoreName);
      loadDocuments(decodedStoreName);
    } else if (employeeId) {
      // Backward compatibility: try to get store from employeeId if available
      try {
        const { getEmployeeStore } = require('../services/employeeStoreService');
        const store = getEmployeeStore(employeeId);
        if (store) {
          setStoreName(store);
          loadDocuments(store);
        }
      } catch (e) {
        // employeeStoreService might not exist in lokesh branch
        console.log('Employee store service not available');
      }
    }
    
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
  }, [routeStoreName, employeeId]);

  const loadDocuments = async (store) => {
    try {
      const response = await listDocuments(store, 100);
      setUploadedDocuments(response.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const loadFileStores = async () => {
    try {
      const response = await listFileStores(50);
      const stores = response.fileSearchStores || [];
      setAvailableStores(stores);
      
      // If no store is selected yet, auto-select one
      if (!storeName && stores.length > 0) {
        // Auto-select the first available store
        const firstStore = stores[0];
        setStoreName(firstStore.name);
        loadDocuments(firstStore.name);
        setSelectedStores([firstStore.name]);
      } else if (storeName) {
        // Pre-select the current store if available
        const decodedStoreName = typeof storeName === 'string' ? decodeURIComponent(storeName) : storeName;
        const store = stores.find(
          s => s.name === decodedStoreName
        );
        if (store) {
          setSelectedStores([store.name]);
        }
      }
    } catch (err) {
      console.error('Failed to load file stores:', err);
    }
  };

  const handleStoreSelect = (selectedStoreName) => {
    if (selectedStoreName) {
      setStoreName(selectedStoreName);
      loadDocuments(selectedStoreName);
      setError(null);
    }
  };

  const handleExtractDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleExtractDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleExtractDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleExtractDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleExtractFiles(droppedFiles);
  };

  const handleExtractFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleExtractFiles(selectedFiles);
  };

  const handleExtractFiles = (newFiles) => {
    const fileObjects = newFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));
    setExtractFiles(prev => [...prev, ...fileObjects]);
  };

  const handleRemoveExtractFile = (fileId) => {
    setExtractFiles(extractFiles.filter(file => file.id !== fileId));
  };

  const handleUploadForExtraction = async (fileObj) => {
    try {
      setExtractingFile(fileObj.id);
      setError(null);

      let extractedText;
      
      try {
        // Try to extract text directly from file using browser FileReader API
        extractedText = await extractTextFromFile(fileObj.file);
      } catch (browserError) {
        // If browser extraction fails (e.g., for PDFs), use Gemini API as fallback
        if (browserError.message === 'PDF_EXTRACTION_NEEDED' || 
            fileObj.type === 'application/pdf' || 
            fileObj.name.toLowerCase().endsWith('.pdf')) {
          // For PDFs, upload temporarily to Google Files and use Gemini API
          const { uploadFile } = await import('../services/filesService');
          const uploadedFile = await uploadFile(fileObj.file, fileObj.name);
          
          if (!uploadedFile || !uploadedFile.uri) {
            throw new Error('Failed to upload file for PDF extraction');
          }

          extractedText = await extractTextFromFileUsingGemini({
            uri: uploadedFile.uri,
            mimeType: uploadedFile.mimeType || fileObj.type || 'application/pdf',
          });
        } else {
          throw browserError;
        }
      }

      // Insert extracted text into notes editor
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const currentContent = quill.getText();
        const separator = currentContent.trim() ? '\n\n---\n\n' : '';
        const fileName = fileObj.name;
        const contentToInsert = `${separator}## ${fileName}\n\n${extractedText}\n\n`;
        
        const selection = quill.getSelection();
        const index = selection ? selection.index : quill.getLength();
        quill.insertText(index, contentToInsert);
        quill.setSelection(index + contentToInsert.length);
        
        setSuccess(`Content from "${fileName}" extracted and inserted into notes!`);
      } else {
        // Fallback: just set notes if Quill not available
        const fileName = fileObj.name;
        const separator = notes.trim() ? '\n\n---\n\n' : '';
        setNotes(prev => `${prev}${separator}## ${fileName}\n\n${extractedText}\n\n`);
        setSuccess(`Content from "${fileName}" extracted and inserted into notes!`);
      }

      // Remove file from list (discard - not uploading to store)
      handleRemoveExtractFile(fileObj.id);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to extract content from file. Please try again.';
      setError(errorMessage);
      console.error('Extract content error:', err);
    } finally {
      setExtractingFile(null);
    }
  };

  const handleGenerateNotes = async () => {
    if (!storeName) {
      setError('No knowledge source configured.');
      return;
    }

    const docsToProcess = selectedDocuments.length > 0 
      ? selectedDocuments 
      : uploadedDocuments.map(doc => doc.name);

    if (docsToProcess.length === 0) {
      setError('Please upload documents first or select documents to process.');
      return;
    }

    try {
      setGeneratingNotes(true);
      setError(null);

      let generatedNotes = '';

      if (noteMode === 'comprehensive') {
        const comprehensive = await generateComprehensiveNotes(docsToProcess, storeName);
        generatedNotes = `# Notes Generated from ${comprehensive.documentCount} Document(s)\n\n` +
          `**Generated:** ${new Date(comprehensive.generatedAt).toLocaleString()}\n\n` +
          `## Summary\n\n${comprehensive.summary}\n\n` +
          `## Key Points\n\n${comprehensive.keyPoints}\n\n` +
          `## Insights\n\n${comprehensive.insights}\n\n` +
          `## Action Items\n\n${comprehensive.actionItems}\n\n` +
          `## Topics\n\n${comprehensive.topics}\n\n` +
          `## Synthesis\n\n${comprehensive.synthesis}`;
      } else {
        generatedNotes = await generateNotesFromDocuments(docsToProcess, storeName, {
          includeSummary: true,
          includeKeyPoints: true,
          includeActionItems: true,
          includeTopics: true,
        });
      }

      setNotes(generatedNotes);
      setSuccess('Notes generated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to generate notes. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Note generation error:', err);
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) {
      setError('Please generate or write notes before saving.');
      return;
    }

    if (!storeName) {
      setError('No knowledge source configured.');
      return;
    }

    try {
      setGeneratingNotes(true);
      setError(null);

      const quill = quillRef.current?.getEditor();
      const htmlContent = quill ? quill.root.innerHTML : notes;
      const fileName = `smart-notes-${Date.now()}.pdf`;

      const pdfFile = await generatePDFFromHTML(htmlContent, fileName);
      const uploadedFile = await uploadFile(pdfFile, fileName);
      
      if (!uploadedFile || !uploadedFile.name) {
        throw new Error('Failed to upload file');
      }

      const decodedStoreName = decodeURIComponent(storeName);
      await importFileToStore(decodedStoreName, uploadedFile.name);

      setSuccess('Notes saved successfully!');
      await loadDocuments(storeName);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to save notes. Please try again.';
      setError(errorMessage);
      console.error('Save notes error:', err);
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleDocumentToggle = (docName) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docName)) {
        return prev.filter(name => name !== docName);
      } else {
        return [...prev, docName];
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to summarize text. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Summarize error:', err);
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleRewrite = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

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
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to rewrite text. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Rewrite error:', err);
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleExtractKeyPoints = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

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
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to extract key points. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Extract key points error:', err);
    } finally {
      setAiLoading(false);
      setAiLoadingType(null);
    }
  };

  const handleImproveText = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

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
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to improve text. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Improve text error:', err);
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

    const currentIndex = selection.index;
    const textBefore = quill.getText(0, currentIndex);
    
    let textToComplete = textBefore.split('\n').pop() || textBefore;
    
    if (textToComplete.trim().length < 10) {
      const last500Chars = textBefore.slice(Math.max(0, textBefore.length - 500));
      if (last500Chars.trim().length >= 10) {
        textToComplete = last500Chars;
      } else {
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
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to generate suggestions. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Auto-complete error:', err);
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
    
    if (transcriptionText.trim()) {
      handleInsertAIText(transcriptionText + ' ');
      setTranscriptionText('');
    }
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

  const handleExtractDocumentContent = async (documentName) => {
    if (!storeName) {
      setError('No knowledge source configured.');
      return;
    }

    try {
      setExtractingContent(documentName);
      setError(null);

      // Get document details
      const document = await getDocument(documentName);
      
      if (!document.file || !document.file.uri) {
        throw new Error('Document does not have file URI');
      }

      // Extract text using Gemini API
      const extractedText = await extractTextFromFileUsingGemini({
        uri: document.file.uri,
        mimeType: document.file.mimeType || 'application/pdf',
      });

      // Insert extracted text into editor
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const currentContent = quill.getText();
        const separator = currentContent.trim() ? '\n\n---\n\n' : '';
        const documentTitle = document.displayName || documentName.split('/').pop();
        const contentToInsert = `${separator}## ${documentTitle}\n\n${extractedText}\n\n`;
        
        const selection = quill.getSelection();
        const index = selection ? selection.index : quill.getLength();
        quill.insertText(index, contentToInsert);
        quill.setSelection(index + contentToInsert.length);
        
        setSuccess(`Content from "${documentTitle}" extracted and inserted into notes!`);
      } else {
        // Fallback: just set notes if Quill not available
        const documentTitle = document.displayName || documentName.split('/').pop();
        const separator = notes.trim() ? '\n\n---\n\n' : '';
        setNotes(prev => `${prev}${separator}## ${documentTitle}\n\n${extractedText}\n\n`);
        setSuccess(`Content from "${documentTitle}" extracted and inserted into notes!`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to extract document content. Please try again.';
      setError(errorMessage);
      console.error('Extract content error:', err);
    } finally {
      setExtractingContent(null);
    }
  };

  return (
    <div className="smart-note-maker">
      <div className="smart-note-header">
        <div>
          <h2>Smart AI Note Maker</h2>
          <p>Extract content from documents or generate AI notes from your knowledge source</p>
        </div>
        <div className="header-actions">
          {!storeName && availableStores.length > 0 && (
            <div className="store-selector">
              <label htmlFor="store-select">Select Knowledge Source:</label>
              <select
                id="store-select"
                value={storeName || ''}
                onChange={(e) => handleStoreSelect(e.target.value)}
                className="store-select"
              >
                <option value="">-- Select a store --</option>
                {availableStores.map(store => (
                  <option key={store.name} value={store.name}>
                    {store.displayName || store.name.split('/').pop()}
                  </option>
                ))}
              </select>
            </div>
          )}
          {storeName && (
            <div className="store-info">
              <span>📚 Knowledge Source: {storeName.split('/').pop()}</span>
              {availableStores.length > 1 && (
                <button
                  className="btn-change-store"
                  onClick={() => setStoreName(null)}
                  title="Change knowledge source"
                >
                  Change
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="smart-note-layout">
        {/* Left Panel - Document Upload & Selection */}
        <div className="left-panel">
          <div className="panel-section">
            <h3>Upload Document to Extract Content</h3>
            <p className="section-hint">Upload a document to extract its content and paste into your notes. This does not upload to the knowledge source.</p>
            
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleExtractDragEnter}
              onDragOver={handleExtractDragOver}
              onDragLeave={handleExtractDragLeave}
              onDrop={handleExtractDrop}
              onClick={() => extractFileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📄</div>
                <h4>Drop files here or click to browse</h4>
                <p>Supports PDF, DOCX, TXT, MD, and images</p>
              </div>
              <input
                ref={extractFileInputRef}
                type="file"
                multiple
                onChange={handleExtractFileInput}
                className="file-input"
                accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png"
              />
            </div>

            {extractFiles.length > 0 && (
              <div className="files-to-upload">
                <h4>Files to Extract Content ({extractFiles.length})</h4>
                <div className="files-list">
                  {extractFiles.map((fileObj) => (
                    <div key={fileObj.id} className="file-item">
                      <div className="file-info">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <div className="file-name">{fileObj.name}</div>
                          <div className="file-meta">
                            {formatFileSize(fileObj.size)} • {fileObj.type || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="file-actions">
                        <button
                          onClick={() => handleUploadForExtraction(fileObj)}
                          className="btn btn-primary btn-sm"
                          disabled={extractingFile === fileObj.id}
                          title="Extract content and paste into notes"
                        >
                          {extractingFile === fileObj.id ? '⏳ Extracting...' : '📄 Extract Content'}
                        </button>
                        <button
                          onClick={() => handleRemoveExtractFile(fileObj.id)}
                          className="remove-btn"
                          disabled={extractingFile === fileObj.id}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel-section">
            <h3>Select Documents for Note Generation</h3>
            <p className="section-hint">Choose which documents from your knowledge source to include in AI note generation</p>
            
            {uploadedDocuments.length === 0 ? (
              <div className="empty-state">
                <p>No documents in knowledge source yet. Use the "Upload Documents" tab to add documents to your knowledge source.</p>
              </div>
            ) : (
              <div className="documents-selection">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.name} className="document-item">
                    <label className="document-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.name)}
                        onChange={() => handleDocumentToggle(doc.name)}
                      />
                      <div className="document-info">
                        <div className="document-name">{doc.displayName || doc.name.split('/').pop()}</div>
                        {doc.createTime && (
                          <div className="document-date">
                            {new Date(doc.createTime).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </label>
                    <button
                      className="btn-extract-content"
                      onClick={() => handleExtractDocumentContent(doc.name)}
                      disabled={extractingContent === doc.name || !storeName}
                      title="Extract content and paste into notes editor"
                    >
                      {extractingContent === doc.name ? '⏳ Extracting...' : '📄 Load Content'}
                    </button>
                  </div>
                ))}
                <div className="selection-actions">
                  <button
                    onClick={() => setSelectedDocuments(uploadedDocuments.map(doc => doc.name))}
                    className="btn btn-sm btn-secondary"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedDocuments([])}
                    className="btn btn-sm btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Notes Editor */}
        <div className="right-panel">
          <div className="panel-section">
            <div className="notes-header">
              <h3>Generated Notes</h3>
              <div className="notes-actions">
                <select
                  value={noteMode}
                  onChange={(e) => setNoteMode(e.target.value)}
                  className="mode-select"
                  disabled={generatingNotes}
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="custom">Custom</option>
                  <option value="manual">Manual</option>
                </select>
                <button
                  onClick={handleGenerateNotes}
                  className="btn btn-primary"
                  disabled={generatingNotes || uploadedDocuments.length === 0}
                >
                  {generatingNotes ? 'Generating...' : '🤖 Generate Notes'}
                </button>
              </div>
            </div>

            {/* AI Tools Panel */}
            {showAIPanel && (
              <div className="ai-tools-panel">
                <div className="ai-tools-header">
                  <span className="ai-tools-title">AI Tools</span>
                  {selectedStores.length > 0 && (
                    <span className="context-indicator">
                      Using {selectedStores.length} store{selectedStores.length > 1 ? 's' : ''} for context
                    </span>
                  )}
                </div>
                
                <div className="ai-tools-content">
                  {/* Context Selector */}
                  <div className="context-selector">
                    <label>File Store Context (optional):</label>
                    <div className="store-checkboxes">
                      {availableStores.map(store => (
                        <label key={store.name} className="store-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedStores.includes(store.name)}
                            onChange={() => handleStoreToggle(store.name)}
                          />
                          <span>{store.displayName || store.name}</span>
                        </label>
                      ))}
                      {availableStores.length === 0 && (
                        <span className="no-stores">No file stores available</span>
                      )}
                    </div>
                  </div>

                  {/* AI Action Buttons */}
                  <div className="ai-actions">
                    <button
                      className="ai-btn"
                      onClick={handleSummarize}
                      disabled={aiLoading || !notes.trim()}
                      title={selectedText.trim() ? "Summarize selected text" : "Summarize all text"}
                    >
                      {aiLoadingType === 'summarize' ? '⏳' : '📝'} Summarize
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleRewrite}
                      disabled={aiLoading || !notes.trim()}
                      title={selectedText.trim() ? "Rewrite/improve selected text" : "Rewrite/improve all text"}
                    >
                      {aiLoadingType === 'rewrite' ? '⏳' : '✏️'} Rewrite
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleExtractKeyPoints}
                      disabled={aiLoading || !notes.trim()}
                      title={selectedText.trim() ? "Extract key points from selected text" : "Extract key points from all text"}
                    >
                      {aiLoadingType === 'extract' ? '⏳' : '🔑'} Extract Key Points
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleImproveText}
                      disabled={aiLoading || !notes.trim()}
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
                </div>
              </div>
            )}

            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={notes}
              onChange={setNotes}
              onSelectionChange={handleTextSelection}
              placeholder="Notes will appear here after generation, or start writing manually..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'color': [] }, { 'background': [] }],
                  ['link'],
                  ['clean']
                ],
              }}
            />

            <div className="notes-footer">
              <div className="footer-info">
                {selectedText && (
                  <span className="selection-info">
                    {selectedText.length} character{selectedText.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              <div className="footer-actions">
                <button
                  className="btn btn-icon"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  title={showAIPanel ? 'Hide AI Tools' : 'Show AI Tools'}
                >
                  🤖
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="btn btn-success"
                  disabled={!notes.trim() || generatingNotes || !storeName}
                >
                  💾 Save Notes to Knowledge Source
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartNoteMaker;

