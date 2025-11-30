import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { listDocuments, listFileStores, getDocument } from '../services/fileStoreService';
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
import { uploadFile } from '../services/filesService';
import { getEmployeeConfig } from '../services/employeeConfigService';
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
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const [selectedStoresForSave, setSelectedStoresForSave] = useState([]);

  useEffect(() => {
    // Load file stores and set up store from settings
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

  const loadFileStores = async () => {
    try {
      const response = await listFileStores(20);
      const stores = response.fileSearchStores || [];
      setAvailableStores(stores);
      
      // Get selected stores from config
      let storesFromConfig = [];
      if (employeeId) {
        try {
          const config = getEmployeeConfig(employeeId);
          storesFromConfig = config.chat?.selectedStores || [];
        } catch (e) {
          console.log('Could not get employee stores from config');
        }
      }
      
      // Use first selected store, route store, or first available
      let targetStore = null;
      if (storesFromConfig.length > 0) {
        targetStore = stores.find(s => storesFromConfig.includes(s.name));
      }
      
      if (!targetStore && routeStoreName) {
        const decodedStoreName = decodeURIComponent(routeStoreName);
        targetStore = stores.find(s => s.name === decodedStoreName);
      }
      
      if (!targetStore && stores.length > 0) {
        targetStore = stores[0];
      }
      
      if (targetStore) {
        setStoreName(targetStore.name);
        loadDocuments(targetStore.name);
        // Use selected stores from config, or fallback to target store
        setSelectedStores(storesFromConfig.length > 0 ? storesFromConfig : [targetStore.name]);
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

      // Extract text directly from file using browser FileReader API and pdf.js
      // This section does NOT use Google APIs - only local browser extraction
      let extractedText;
      const fileName = fileObj.name;
      const fileType = fileObj.type || 'unknown';
      const isPDF = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      
      try {
        extractedText = await extractTextFromFile(fileObj.file);
      } catch (extractionError) {
        console.error('Extraction error:', extractionError);
        
        // For PDFs, preserve the specific error message from extractTextFromPDF
        if (isPDF) {
          throw extractionError; // Re-throw PDF-specific errors as-is
        }
        
        // For unsupported formats (DOCX, images), show helpful error
        if (fileType.includes('wordprocessingml') || fileName.toLowerCase().endsWith('.docx')) {
          throw new Error(
            `DOCX files cannot be extracted locally. ` +
            `Please convert to PDF or text format (.txt) or use AI Notes Generator ` +
            `to extract content from DOCX files in your knowledge source.`
          );
        } else if (fileType.startsWith('image/')) {
          throw new Error(
            `Image files cannot be converted to text locally. ` +
            `Please provide a text version or use AI Notes Generator ` +
            `to extract content from images in your knowledge source.`
          );
        } else {
          // Generic error for other file types
          throw new Error(
            `Cannot extract text from "${fileName}". ` +
            `Supported formats: .txt, .md, .json, .csv, .html, .xml, .pdf, and other text files. ` +
            `For DOCX and images, use AI Notes Generator instead.`
          );
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
      const errorMessage = err.message || 
                          'Failed to extract content from file. Please try again.';
      setError(errorMessage);
      console.error('Extract content error:', err);
    } finally {
      setExtractingFile(null);
    }
  };


  const handleClearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      setNotes('');
      const quill = quillRef.current?.getEditor();
      if (quill) {
        quill.setContents([]);
      }
      setError(null);
      setSuccess(null);
      setSelectedText('');
      setSelectedRange(null);
      setAiSuggestions(null);
    }
  };

  const handleSaveNotesClick = () => {
    if (!notes.trim()) {
      setError('Please generate or write notes before saving.');
      return;
    }

    if (availableStores.length === 0) {
      setError('No knowledge sources available. Please create a knowledge source in Settings first.');
      return;
    }

    // Initialize selected stores for save with current selected stores or all available
    const storesToSelect = selectedStores.length > 0 ? selectedStores : availableStores.map(s => s.name);
    setSelectedStoresForSave(storesToSelect);

    // Show file name modal
    const defaultFileName = `smart-notes-${new Date().toISOString().split('T')[0]}`;
    setFileNameInput(defaultFileName);
    setShowFileNameModal(true);
  };

  const handleSaveNotes = async () => {
    if (!fileNameInput.trim()) {
      setError('Please enter a file name.');
      return;
    }

    // Ensure file name ends with .pdf
    const displayName = fileNameInput.trim().endsWith('.pdf') 
      ? fileNameInput.trim() 
      : `${fileNameInput.trim()}.pdf`;

    setShowFileNameModal(false);

    try {
      setGeneratingNotes(true);
      setError(null);
      setSuccess(null);

      // Generate PDF from notes
      const quill = quillRef.current?.getEditor();
      const htmlContent = quill ? quill.root.innerHTML : notes;

      console.log('Generating PDF...');
      const pdfFile = await generatePDFFromHTML(htmlContent, displayName);
      
      if (!pdfFile) {
        throw new Error('Failed to generate PDF file');
      }

      // Upload PDF to Google Files
      console.log('Uploading PDF to Google Files...');
      const uploadedFileResponse = await uploadFile(pdfFile, displayName);
      
      if (!uploadedFileResponse) {
        throw new Error('Failed to upload file to Google Files - no response received');
      }

      console.log('Upload response:', uploadedFileResponse);

      // The uploadFile API returns the file object directly
      // It should have a 'name' property with format "files/{file_id}"
      let fileResourceName = null;
      
      if (uploadedFileResponse.name) {
        fileResourceName = uploadedFileResponse.name;
      } else if (uploadedFileResponse.file && uploadedFileResponse.file.name) {
        fileResourceName = uploadedFileResponse.file.name;
      } else {
        console.error('Uploaded file response structure:', uploadedFileResponse);
        throw new Error('Uploaded file does not have a resource name. Response: ' + JSON.stringify(uploadedFileResponse));
      }

      // Ensure file name is in correct format (should already be "files/{file_id}")
      const fileName = fileResourceName.startsWith('files/') 
        ? fileResourceName 
        : `files/${fileResourceName}`;

      // Import file to all selected stores
      if (selectedStoresForSave.length === 0) {
        throw new Error('Please select at least one knowledge source to save notes to.');
      }

      const importPromises = selectedStoresForSave.map(async (storeName) => {
        try {
          const decodedStoreName = decodeURIComponent(storeName);
          const importResult = await importFileToStore(decodedStoreName, fileName);
          return { storeName, success: true, result: importResult };
        } catch (err) {
          return { storeName, success: false, error: err.message };
        }
      });

      const results = await Promise.all(importPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (failed.length > 0) {
        const errorMessages = failed.map(f => `${f.storeName.split('/').pop()}: ${f.error}`).join(', ');
        throw new Error(`Failed to save to some stores: ${errorMessages}`);
      }

      // Check if any import returned an operation (long-running)
      const hasOperations = successful.some(r => 
        r.result?.name && r.result.name.includes('operations/')
      );

      if (hasOperations) {
        setSuccess(`Notes import started to ${successful.length} knowledge source(s)! The file is being processed...`);
      } else {
        setSuccess(`Notes saved successfully to ${successful.length} knowledge source(s)!`);
      }

      // Reload documents from first selected store
      if (selectedStoresForSave.length > 0) {
        await loadDocuments(selectedStoresForSave[0]);
      }
    } catch (err) {
      console.error('Save notes error:', err);
      const errorMessage = err.response?.data?.error?.message || 
                          err.message || 
                          'Failed to save notes. Please try again.';
      setError(errorMessage);
    } finally {
      setGeneratingNotes(false);
    }
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
          <p className="header-description">
            Create and organize knowledge content that powers your AI assistant's responses
          </p>
          {storeName && (
            <p className="knowledge-source-info">
              📚 Knowledge Source: {storeName.split('/').pop()}
            </p>
          )}
        </div>
        {!storeName && availableStores.length > 0 && (
          <div className="header-actions">
            <select
              value={storeName || ''}
              onChange={(e) => handleStoreSelect(e.target.value)}
              className="store-select"
            >
              <option value="">Select Knowledge Source</option>
              {availableStores.map(store => (
                <option key={store.name} value={store.name}>
                  {store.displayName || store.name.split('/').pop()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Primary Section: AI Notes Generator */}
      <div className="workflow-section section-ai-notes">
        <div className="section-header">
          <h2 className="section-title">AI Notes Generator</h2>
          <p className="section-description">
            Create intelligent notes that enhance your AI assistant's knowledge base. 
            Use AI tools to summarize, improve, and structure content that will help your assistant 
            provide better, more accurate responses.
          </p>
        </div>

        <div className="smart-note-layout">
          {/* Left Panel - Extract Content */}
          <div className="left-panel">
            <div className="panel-section">
              <h3 className="panel-title">Extract Content</h3>
              <p className="section-hint">
                Upload documents to extract text content. Extracted content will be added to your notes 
                and can be enhanced with AI tools before saving to your knowledge source.
              </p>
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
                  <h4>Drop files here</h4>
                  <p className="upload-hint">.txt, .md, .json, .csv, .html, .xml, .pdf</p>
                </div>
                <input
                  ref={extractFileInputRef}
                  type="file"
                  multiple
                  onChange={handleExtractFileInput}
                  className="file-input"
                  accept=".txt,.md,.markdown,.json,.csv,.html,.htm,.xml,.js,.jsx,.ts,.tsx,.css,.scss,.yaml,.yml,.pdf"
                />
              </div>

              {extractFiles.length > 0 && (
                <div className="files-to-upload">
                  <div className="files-list">
                    {extractFiles.map((fileObj) => (
                      <div key={fileObj.id} className="file-item">
                        <div className="file-info">
                          <div className="file-name">{fileObj.name}</div>
                          <div className="file-meta">{formatFileSize(fileObj.size)}</div>
                        </div>
                        <div className="file-actions">
                          <button
                            onClick={() => handleUploadForExtraction(fileObj)}
                            className="btn btn-primary btn-sm"
                            disabled={extractingFile === fileObj.id}
                          >
                            {extractingFile === fileObj.id ? 'Extracting...' : 'Extract'}
                          </button>
                          <button
                            onClick={() => handleRemoveExtractFile(fileObj.id)}
                            className="remove-btn"
                            disabled={extractingFile === fileObj.id}
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
          </div>

          {/* Right Panel - Notes Editor with AI Tools */}
          <div className="right-panel">
            <div className="panel-section">

            {showAIPanel && (
              <div className="ai-tools-panel">
                <div className="ai-tools-header">
                  <span className="ai-tools-title">AI Tools</span>
                  <button
                    className="btn-toggle-ai"
                    onClick={() => setShowAIPanel(false)}
                    title="Hide AI Tools"
                  >
                    −
                  </button>
                </div>
                
                <div className="ai-tools-content">
                  <div className="ai-actions">
                    <button
                      className="ai-btn"
                      onClick={handleSummarize}
                      disabled={aiLoading || !notes.trim()}
                    >
                      {aiLoadingType === 'summarize' ? '⏳' : '📝'} Summarize
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleRewrite}
                      disabled={aiLoading || !notes.trim()}
                    >
                      {aiLoadingType === 'rewrite' ? '⏳' : '✏️'} Rewrite
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleExtractKeyPoints}
                      disabled={aiLoading || !notes.trim()}
                    >
                      {aiLoadingType === 'extract' ? '⏳' : '🔑'} Key Points
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleImproveText}
                      disabled={aiLoading || !notes.trim()}
                    >
                      {aiLoadingType === 'improve' ? '⏳' : '✨'} Improve
                    </button>
                    <button
                      className="ai-btn"
                      onClick={handleAutoComplete}
                      disabled={aiLoading}
                    >
                      {aiLoadingType === 'autocomplete' ? '⏳' : '⚡'} Complete
                    </button>
                    <button
                      className={`ai-btn ${isRecording ? 'recording' : ''}`}
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={aiLoading}
                    >
                      {isRecording ? '🔴 Stop' : '🎤 Voice'}
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
                placeholder="Create notes that will enhance your AI assistant's knowledge. Extract content from documents, write manually, or use AI tools to improve and structure your notes. These notes will be saved to your knowledge source and used by your AI assistant to answer questions."
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

              {!showAIPanel && (
                <div className="notes-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAIPanel(true)}
                  >
                    Show AI Tools
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Notes */}
      <div className="workflow-section section-save-notes">
        <div className="section-header">
          <h3 className="section-title">Save to Knowledge Source</h3>
          <p className="section-description">
            Save your notes to your knowledge source. Once saved, this content will be available 
            to your AI assistant, enabling it to answer questions and provide information based on these notes.
          </p>
        </div>
        <div className="save-notes-actions">
          <button
            onClick={handleClearNotes}
            className="btn btn-secondary"
            disabled={!notes.trim() || generatingNotes}
            title="Clear all notes"
          >
            Clear Notes
          </button>
          <button
            onClick={handleSaveNotesClick}
            className="btn btn-success btn-large"
            disabled={!notes.trim() || generatingNotes || availableStores.length === 0}
          >
            {generatingNotes ? 'Saving...' : 'Save to Knowledge Source'}
          </button>
        </div>
        {availableStores.length === 0 && (
          <p className="save-hint">
            Please create a knowledge source in Settings to save notes. 
            Your notes will be converted to PDF and added to your AI assistant's knowledge base.
          </p>
        )}
      </div>

      {/* File Name Modal */}
      {showFileNameModal && (
        <div className="modal-overlay" onClick={() => setShowFileNameModal(false)}>
          <div className="modal-content file-name-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Save Notes</h3>
              <button
                className="modal-close"
                onClick={() => setShowFileNameModal(false)}
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="fileNameInput" className="modal-label">
                Enter a name for your notes file:
              </label>
              <input
                id="fileNameInput"
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveNotes();
                  } else if (e.key === 'Escape') {
                    setShowFileNameModal(false);
                  }
                }}
                className="modal-input"
                placeholder="Enter file name..."
                autoFocus
              />
              <p className="modal-hint" style={{ marginBottom: '1rem' }}>File will be saved as PDF (.pdf extension will be added automatically)</p>
              
              <label className="modal-label" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                Select Knowledge Sources ({selectedStoresForSave.length} selected):
              </label>
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px', 
                padding: '0.5rem',
                background: '#f9fafb'
              }}>
                {availableStores.length === 0 ? (
                  <p style={{ padding: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    No knowledge sources available. Please create one in Settings first.
                  </p>
                ) : (
                  availableStores.map((store) => {
                    const isSelected = selectedStoresForSave.includes(store.name);
                    return (
                      <label
                        key={store.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.5rem',
                          marginBottom: '0.25rem',
                          border: `1px solid ${isSelected ? '#667eea' : 'transparent'}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f0f4ff' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedStoresForSave(prev => 
                              prev.includes(store.name)
                                ? prev.filter(name => name !== store.name)
                                : [...prev, store.name]
                            );
                          }}
                          style={{
                            marginRight: '0.5rem',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '0.875rem', flex: 1 }}>
                          {store.displayName || store.name.split('/').pop()}
                        </span>
                        {isSelected && (
                          <span style={{ color: '#667eea', fontSize: '1rem' }}>✓</span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
              {selectedStoresForSave.length === 0 && availableStores.length > 0 && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                  Please select at least one knowledge source to save notes to.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowFileNameModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveNotes}
                disabled={!fileNameInput.trim() || selectedStoresForSave.length === 0}
              >
                Save {selectedStoresForSave.length > 0 && `(${selectedStoresForSave.length} store${selectedStoresForSave.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartNoteMaker;

