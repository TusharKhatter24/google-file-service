import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
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
} from '../services/aiNotesService';
import './NotesEditor.css';

function NotesEditor({ isOpen, onClose, storeName, onSuccess }) {
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

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setError(null);
      setFileName('');
      setShowFileNameDialog(false);
      setSelectedText('');
      setSelectedRange(null);
      setAiSuggestions(null);
      setTranscriptionText('');
      loadFileStores();
    }
    
    // Cleanup on close
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [isOpen]);

  const loadFileStores = async () => {
    try {
      const response = await listFileStores(50);
      setAvailableStores(response.fileSearchStores || []);
      // Pre-select the current store if provided
      if (storeName) {
        const decodedStoreName = decodeURIComponent(storeName);
        const store = (response.fileSearchStores || []).find(
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
    } catch (err) {
      setError(err.message || 'Failed to improve text.');
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

      // Step 2: Upload PDF to files
      const uploadedFile = await uploadFile(pdfFile, finalFileName);
      
      if (!uploadedFile || !uploadedFile.name) {
        throw new Error('Failed to upload file: No file name returned');
      }

      const uploadedFileName = uploadedFile.name;

      // Step 3: Import file to store
      const decodedStoreName = decodeURIComponent(storeName);
      const importResponse = await importFileToStore(decodedStoreName, uploadedFileName);

      // Check if it's a long-running operation (has a name property)
      // If so, it will complete in the background
      if (importResponse.name) {
        // Long-running operation - it will complete in the background
        // Show success message and close
        setShowFileNameDialog(false);
        setContent('');
        setFileName('');
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } else {
        // Immediate success
        setShowFileNameDialog(false);
        setContent('');
        setFileName('');
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
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

  if (!isOpen) return null;

  return (
    <motion.div 
      className="notes-editor-modal" 
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
        <motion.div 
          className="notes-editor-content" 
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
        <div className="notes-editor-header">
          <h3>Smart Notes Taker</h3>
          <div className="notes-editor-header-actions">
            <button
              className="btn btn-icon"
              onClick={() => setShowAIPanel(!showAIPanel)}
              title={showAIPanel ? 'Hide AI Tools' : 'Show AI Tools'}
            >
              {showAIPanel ? '🤖' : '🤖'}
            </button>
            <button className="close-btn" onClick={onClose} disabled={saving}>
              ×
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="notes-editor-error"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Tools Panel */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div 
              className="ai-tools-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
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
                {[
                  { handler: handleSummarize, icon: '📝', loadingIcon: '⏳', text: 'Summarize', loadingType: 'summarize', title: selectedText.trim() ? "Summarize selected text" : "Summarize all text" },
                  { handler: handleRewrite, icon: '✏️', loadingIcon: '⏳', text: 'Rewrite', loadingType: 'rewrite', title: selectedText.trim() ? "Rewrite/improve selected text" : "Rewrite/improve all text" },
                  { handler: handleExtractKeyPoints, icon: '🔑', loadingIcon: '⏳', text: 'Extract Key Points', loadingType: 'extract', title: selectedText.trim() ? "Extract key points from selected text" : "Extract key points from all text" },
                  { handler: handleImproveText, icon: '✨', loadingIcon: '⏳', text: 'Improve', loadingType: 'improve', title: selectedText.trim() ? "Improve selected text" : "Improve all text" },
                  { handler: handleAutoComplete, icon: '⚡', loadingIcon: '⏳', text: 'Auto-Complete', loadingType: 'autocomplete', title: "Auto-complete text" },
                  { handler: isRecording ? handleStopRecording : handleStartRecording, icon: isRecording ? '🔴' : '🎤', loadingIcon: '⏳', text: isRecording ? 'Stop' : 'Voice', loadingType: null, title: isRecording ? 'Stop recording' : 'Start voice transcription', special: isRecording }
                ].map((btn, index) => (
                  <motion.button
                    key={btn.text}
                    className={`ai-btn ${btn.special ? 'recording' : ''}`}
                    onClick={btn.handler}
                    disabled={aiLoading || (btn.loadingType !== 'autocomplete' && btn.loadingType !== null && !content.trim())}
                    title={btn.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: !aiLoading ? 1.05 : 1 }}
                    whileTap={{ scale: !aiLoading ? 0.95 : 1 }}
                  >
                    {aiLoadingType === btn.loadingType ? btn.loadingIcon : btn.icon} {btn.text}
                  </motion.button>
                ))}
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
              <AnimatePresence>
                {aiSuggestions && (
                  <motion.div 
                    className="ai-suggestions"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="notes-editor-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
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
        </motion.div>

        <motion.div 
          className="notes-editor-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="footer-info">
            {selectedText && (
              <span className="selection-info">
                {selectedText.length} character{selectedText.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="footer-actions">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !content.trim()}
            >
              Save as PDF
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* File Name Dialog */}
      <AnimatePresence>
        {showFileNameDialog && (
          <motion.div 
            className="notes-editor-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="notes-editor-dialog" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
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
                <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                  The file will be saved as a PDF. You can omit the .pdf extension.
                </small>
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
                disabled={saving || !fileName.trim()}
              >
                {saving ? 'Saving...' : 'Save & Upload'}
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default NotesEditor;
