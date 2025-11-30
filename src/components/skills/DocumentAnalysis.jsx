import React, { useState } from 'react';

function DocumentAnalysis({ employeeName, employeeId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setAnalyzing(false);
      alert('Document analysis feature coming soon!');
    }, 2000);
  };

  const analysisTypes = [
    { id: 1, name: 'Summarization', icon: '📝', description: 'Get concise summaries of documents' },
    { id: 2, name: 'Key Insights', icon: '💡', description: 'Extract important insights and findings' },
    { id: 3, name: 'Entity Extraction', icon: '🏷️', description: 'Identify people, places, and organizations' },
    { id: 4, name: 'Sentiment Analysis', icon: '😊', description: 'Analyze tone and sentiment' }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Document Analysis</h2>
        <p>{employeeName} can analyze and extract insights from documents</p>
      </div>

      <div className="upload-section">
        <h3>Upload Document</h3>
        <div className="file-upload-area" style={{ textAlign: 'center', padding: '2rem', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
          <input
            type="file"
            id="docAnalysisFile"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt"
          />
          <label htmlFor="docAnalysisFile" style={{ cursor: 'pointer' }}>
            {selectedFile ? (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <strong>{selectedFile.name}</strong>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Click to select a different file
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                <div>Click to select a document</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  PDF, DOC, DOCX, TXT supported
                </div>
              </div>
            )}
          </label>
        </div>
        {selectedFile && (
          <button 
            className="btn-analyze" 
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Document'}
          </button>
        )}
      </div>

      <div className="analysis-types-section">
        <h3>Analysis Types</h3>
        <div className="skill-features-grid">
          {analysisTypes.map(type => (
            <div key={type.id} className="feature-card">
              <div className="feature-icon">{type.icon}</div>
              <h3>{type.name}</h3>
              <p>{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-analysis">
        <h3>Recent Analyses</h3>
        <p className="placeholder-note">
          Your document analysis history will appear here
        </p>
      </div>
    </div>
  );
}

export default DocumentAnalysis;

