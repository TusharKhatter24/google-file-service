import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generatePDFFromHTML } from '../utils/pdfGenerator';
import { uploadFile } from '../services/filesService';
import { importFileToStore } from '../services/fileStoreService';
import './NotesEditor.css';

function NotesEditor({ isOpen, onClose, storeName, onSuccess }) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showFileNameDialog, setShowFileNameDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const quillRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setError(null);
      setFileName('');
      setShowFileNameDialog(false);
    }
  }, [isOpen]);

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
      const uploadResponse = await uploadFile(pdfFile, finalFileName);
      
      if (!uploadResponse.file || !uploadResponse.file.name) {
        throw new Error('Failed to upload file: No file name returned');
      }

      const uploadedFileName = uploadResponse.file.name;

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

  if (!isOpen) return null;

  return (
    <div className="notes-editor-modal" onClick={onClose}>
      <div className="notes-editor-content" onClick={(e) => e.stopPropagation()}>
        <div className="notes-editor-header">
          <h3>Write Notes</h3>
          <button className="close-btn" onClick={onClose} disabled={saving}>
            ×
          </button>
        </div>

        {error && <div className="notes-editor-error">{error}</div>}

        <div className="notes-editor-body">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Start writing your notes here..."
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
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesEditor;

