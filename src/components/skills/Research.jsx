import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { performResearch, researchExternalTool } from '../../services/researchService';
import './SkillsShared.css';
import './Research.css';

function Research({ employeeName, employeeId }) {
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState(null);
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState(null);
  const [researchType, setResearchType] = useState('general'); // 'general' or 'tool'

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!researchQuery.trim()) {
      setError('Please enter a research query.');
      return;
    }

    try {
      setResearching(true);
      setError(null);
      setResearchResults(null);

      let result;
      if (researchType === 'tool') {
        // Use specialized tool research function
        result = await researchExternalTool(researchQuery.trim());
      } else {
        // Use general research
        result = await performResearch(researchQuery.trim());
      }

      setResearchResults({
        query: researchQuery.trim(),
        result: result,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      setError(err.message || 'Failed to perform research. Please check your API key and try again.');
    } finally {
      setResearching(false);
    }
  };

  const handleQuickResearch = async (query, type = 'general') => {
    setResearchQuery(query);
    setResearchType(type);
    
    // Perform research directly
    if (!query.trim()) {
      setError('Please enter a research query.');
      return;
    }

    try {
      setResearching(true);
      setError(null);
      setResearchResults(null);

      let result;
      if (type === 'tool') {
        result = await researchExternalTool(query.trim());
      } else {
        result = await performResearch(query.trim());
      }

      setResearchResults({
        query: query.trim(),
        result: result,
        timestamp: new Date().toLocaleString()
      });
    } catch (err) {
      setError(err.message || 'Failed to perform research. Please check your API key and try again.');
    } finally {
      setResearching(false);
    }
  };

  const exampleQueries = [
    {
      query: 'Stripe API payment methods endpoints and error codes',
      type: 'tool',
      category: 'API Documentation'
    },
    {
      query: 'React useState hook usage and common errors',
      type: 'tool',
      category: 'Library Documentation'
    },
    {
      query: 'OAuth 2.0 authentication flow and best practices',
      type: 'general',
      category: 'Technical Concepts'
    },
    {
      query: 'REST API rate limiting strategies and implementation',
      type: 'general',
      category: 'Best Practices'
    }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>🔍 Research Tool</h2>
        <p>{employeeName} can research external tools, APIs, errors, and technical documentation</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="research-section">
        <form onSubmit={handleResearch} className="research-form">
          <div className="research-type-selector" style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem', fontWeight: '500' }}>Research Type:</label>
            <label style={{ marginRight: '1rem', cursor: 'pointer' }}>
              <input
                type="radio"
                value="general"
                checked={researchType === 'general'}
                onChange={(e) => setResearchType(e.target.value)}
                disabled={researching}
                style={{ marginRight: '0.5rem' }}
              />
              General Research
            </label>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                value="tool"
                checked={researchType === 'tool'}
                onChange={(e) => setResearchType(e.target.value)}
                disabled={researching}
                style={{ marginRight: '0.5rem' }}
              />
              External Tool/API Research
            </label>
          </div>

          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <textarea
              value={researchQuery}
              onChange={(e) => setResearchQuery(e.target.value)}
              placeholder={
                researchType === 'tool'
                  ? "Research external tools, APIs, payloads, errors, and supported features... (e.g., 'Stripe API payment methods')"
                  : "Ask any research question... (e.g., 'What are the best practices for API rate limiting?')"
              }
              className="research-input"
              rows={3}
              disabled={researching}
            />
            <button type="submit" className="btn-search" disabled={researching || !researchQuery.trim()}>
              {researching ? 'Researching...' : 'Research'}
            </button>
          </div>
        </form>
      </div>

      {researchResults && (
        <div className="research-results">
          <div className="research-results-header">
            <h3>Research Results</h3>
            <div className="research-meta">
              <span>Query: "{researchResults.query}"</span>
              <span>•</span>
              <span>{researchResults.timestamp}</span>
            </div>
          </div>
          <div className="research-results-content">
            <ReactMarkdown>{researchResults.result}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>External Tool Research</h3>
          <p>Research APIs, endpoints, payloads, and supported features</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚠️</div>
          <h3>Error Analysis</h3>
          <p>Find information about error codes and troubleshooting</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Technical Documentation</h3>
          <p>Access up-to-date documentation and best practices</p>
        </div>
      </div>

      <div className="example-queries-section">
        <h3>Example Research Queries</h3>
        <div className="example-queries-list">
          {exampleQueries.map((example, idx) => (
            <div
              key={idx}
              className="example-query-item"
              onClick={() => handleQuickResearch(example.query, example.type)}
            >
              <div className="example-query-content">
                <div className="example-query-text">
                  <div className="example-query-title">{example.query}</div>
                  <div className="example-query-category">{example.category}</div>
                </div>
                <span className="example-query-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Research;

