import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listFileStores } from '../services/fileStoreService';
import { generateInsights, generateRecommendations, detectPatterns } from '../services/conciergeService';
import { analyzeStoreDocuments, extractTopics, extractActionItems } from '../services/documentAnalysisService';
import { getPersonalizedRecommendations, getWritingStyleProfile, getTopicPreferences, getWorkPatterns } from '../services/personalizationService';
import './ConciergeDashboard.css';

function ConciergeDashboard() {
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const isAnalyzingRef = useRef(false);
  const lastSelectedStoresRef = useRef([]);
  
  // Dashboard data
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [topics, setTopics] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [styleProfile, setStyleProfile] = useState(null);
  const [workPatterns, setWorkPatterns] = useState(null);

  useEffect(() => {
    loadStores();
    loadPersonalization();
  }, []);

  useEffect(() => {
    // Only analyze if stores changed and we're not already analyzing
    const storesChanged = JSON.stringify(selectedStores) !== JSON.stringify(lastSelectedStoresRef.current);
    if (selectedStores.length > 0 && storesChanged && !isAnalyzingRef.current) {
      lastSelectedStoresRef.current = [...selectedStores];
      analyzeKnowledge();
    }
  }, [selectedStores]);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFileStores(20);
      setStores(response.fileSearchStores || []);
      
      // Auto-select all stores by default (only if not already set)
      if (response.fileSearchStores && response.fileSearchStores.length > 0 && selectedStores.length === 0) {
        const storeNames = response.fileSearchStores.map(s => s.name);
        setSelectedStores(storeNames);
        lastSelectedStoresRef.current = storeNames;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalization = () => {
    const profile = getWritingStyleProfile();
    const patterns = getWorkPatterns();
    setStyleProfile(profile);
    setWorkPatterns(patterns);
    
    // Load personalized recommendations only if stores are selected
    if (selectedStores.length > 0) {
      getPersonalizedRecommendations(selectedStores).then(setPersonalizedRecs).catch(console.error);
    }
  };

  const analyzeKnowledge = async () => {
    if (selectedStores.length === 0 || isAnalyzingRef.current) return;

    try {
      isAnalyzingRef.current = true;
      setAnalyzing(true);
      setError(null);

      // Run analyses in parallel
      const [
        insightsData,
        recommendationsData,
        topicsData,
        actionItemsData,
        patternsData,
        analysisData,
      ] = await Promise.all([
        generateInsights(selectedStores).catch(err => ({ error: err.message })),
        generateRecommendations(selectedStores).catch(err => []),
        extractTopics(selectedStores[0]).catch(err => []),
        extractActionItems(selectedStores[0]).catch(err => []),
        detectPatterns(selectedStores).catch(err => null),
        analyzeStoreDocuments(selectedStores[0]).catch(err => null),
      ]);

      setInsights(insightsData);
      setRecommendations(Array.isArray(recommendationsData) ? recommendationsData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setActionItems(Array.isArray(actionItemsData) ? actionItemsData : []);
      setPatterns(patternsData);
      setAnalysis(analysisData);
    } catch (err) {
      setError(err.message || 'Failed to analyze knowledge');
    } finally {
      setAnalyzing(false);
      isAnalyzingRef.current = false;
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="concierge-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Calculate metrics
  const totalDocuments = stores.reduce((sum, store) => sum + (store.activeDocumentsCount || 0), 0);
  const totalSegments = stores.length;
  const totalSize = stores.reduce((sum, store) => sum + (parseInt(store.sizeBytes) || 0), 0);
  const pendingDocuments = stores.reduce((sum, store) => sum + (store.pendingDocumentsCount || 0), 0);
  const failedDocuments = stores.reduce((sum, store) => sum + (store.failedDocumentsCount || 0), 0);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="concierge-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Knowledge base analytics and insights</p>
        </div>
        <Link to="/ask" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
          Ask Question →
        </Link>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* Knowledge Health Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📚</div>
          <div className="metric-content">
            <div className="metric-value">{totalSegments}</div>
            <div className="metric-label">Knowledge Segments</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📄</div>
          <div className="metric-content">
            <div className="metric-value">{totalDocuments}</div>
            <div className="metric-label">Total Documents</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💾</div>
          <div className="metric-content">
            <div className="metric-value">{formatBytes(totalSize)}</div>
            <div className="metric-label">Total Size</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{totalDocuments - pendingDocuments - failedDocuments}</div>
            <div className="metric-label">Active Documents</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Quick Actions</h2>
          <Link to="/segments" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            Manage Segments →
          </Link>
        </div>
        <div className="quick-actions-grid">
          <Link to="/ask" className="quick-action-card">
            <div className="quick-action-icon">💬</div>
            <h3>Ask Question</h3>
            <p>Get instant answers from your knowledge base</p>
          </Link>
          <Link to="/segments" className="quick-action-card">
            <div className="quick-action-icon">📁</div>
            <h3>View Segments</h3>
            <p>Browse and manage your knowledge segments</p>
          </Link>
          <Link to="/files" className="quick-action-card">
            <div className="quick-action-icon">📤</div>
            <h3>Upload Files</h3>
            <p>Add new documents to your knowledge base</p>
          </Link>
          <Link to="/knowledge-graph" className="quick-action-card">
            <div className="quick-action-icon">🕸️</div>
            <h3>Knowledge Graph</h3>
            <p>Visualize document relationships</p>
          </Link>
        </div>
      </div>

      {/* Knowledge Segments Overview */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Knowledge Segments</h2>
          <Link to="/segments" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            View All →
          </Link>
        </div>
        {stores.length === 0 ? (
          <div className="empty-state">
            <p>No knowledge segments available. <Link to="/segments">Create one</Link> to get started.</p>
          </div>
        ) : (
          <div className="segments-overview">
            {stores.slice(0, 6).map(store => (
              <div key={store.name} className="segment-overview-card">
                <div className="segment-overview-header">
                  <h3>{store.displayName || store.name}</h3>
                  <span className="badge badge-success">{store.activeDocumentsCount || 0} docs</span>
                </div>
                <div className="segment-overview-details">
                  <span>{formatBytes(store.sizeBytes)}</span>
                  {store.pendingDocumentsCount > 0 && (
                    <span style={{ color: '#f59e0b' }}>⏳ {store.pendingDocumentsCount} pending</span>
                  )}
                </div>
                <div className="segment-overview-actions">
                  <Link
                    to={`/ask?segments=${encodeURIComponent(store.name)}`}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                  >
                    Ask
                  </Link>
                  <Link
                    to={`/store/${encodeURIComponent(store.name)}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Section */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Knowledge Analysis</h2>
          {stores.length > 0 && (
            <div className="store-selection-mini">
              <select
                className="store-select-mini"
                value={selectedStores[0] || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedStores([e.target.value]);
                  } else {
                    setSelectedStores([]);
                  }
                }}
              >
                <option value="">Select segment to analyze</option>
                {stores.map(store => (
                  <option key={store.name} value={store.name}>
                    {store.displayName || store.name}
                  </option>
                ))}
              </select>
              {selectedStores.length > 0 && (
                <button
                  className="btn-analyze"
                  onClick={analyzeKnowledge}
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              )}
            </div>
          )}
        </div>

        {analyzing && (
          <div className="analyzing-indicator">
            <div className="spinner"></div>
            <span>Analyzing your knowledge base...</span>
          </div>
        )}
      </div>

      {/* Insights Panel */}
      {insights && !insights.error && (
        <div className="dashboard-section">
          <h2>Knowledge Insights</h2>
          <div className="insights-grid">
            {insights.topics && (
              <div className="insight-card">
                <h3>Key Topics</h3>
                <div className="insight-content">
                  {Array.isArray(insights.topics) ? (
                    <ul>
                      {insights.topics.slice(0, 5).map((topic, idx) => (
                        <li key={idx}>{typeof topic === 'string' ? topic : topic.name || topic}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{insights.topics}</p>
                  )}
                </div>
              </div>
            )}
            {insights.relationships && (
              <div className="insight-card">
                <h3>Document Relationships</h3>
                <div className="insight-content">
                  <p>{insights.relationships}</p>
                </div>
              </div>
            )}
            {insights.knowledgeGaps && (
              <div className="insight-card">
                <h3>Knowledge Gaps</h3>
                <div className="insight-content">
                  <p>{insights.knowledgeGaps}</p>
                </div>
              </div>
            )}
            {insights.trends && (
              <div className="insight-card">
                <h3>Trends & Patterns</h3>
                <div className="insight-content">
                  <p>{insights.trends}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="dashboard-section">
          <h2>Recommendations</h2>
          <div className="recommendations-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="recommendation-card">
                <div className="recommendation-header">
                  <span className={`rec-type rec-type-${rec.type || 'general'}`}>
                    {rec.type || 'general'}
                  </span>
                  <span className={`rec-priority rec-priority-${rec.priority || 'medium'}`}>
                    {rec.priority || 'medium'} priority
                  </span>
                </div>
                <h3>{rec.title || 'Recommendation'}</h3>
                <p>{rec.description || rec}</p>
                {rec.actionItems && rec.actionItems.length > 0 && (
                  <ul className="action-items">
                    {rec.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div className="dashboard-section">
          <h2>Key Topics</h2>
          <div className="topics-grid">
            {topics.slice(0, 12).map((topic, idx) => (
              <div key={idx} className="topic-card">
                <h3>{typeof topic === 'string' ? topic : topic.name || `Topic ${idx + 1}`}</h3>
                {typeof topic === 'object' && topic.description && (
                  <p>{topic.description}</p>
                )}
                {typeof topic === 'object' && topic.frequency && (
                  <span className="topic-frequency">{topic.frequency}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="dashboard-section">
          <h2>Action Items</h2>
          <div className="action-items-list">
            {actionItems.map((item, idx) => (
              <div key={idx} className="action-item-card">
                <div className="action-item-header">
                  <span className={`priority-badge priority-${item.priority || 'medium'}`}>
                    {item.priority || 'medium'}
                  </span>
                  {item.dueDate && (
                    <span className="due-date">Due: {formatDate(item.dueDate)}</span>
                  )}
                </div>
                <p>{typeof item === 'string' ? item : item.description || item}</p>
                {typeof item === 'object' && item.document && (
                  <span className="source-doc">From: {item.document}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {patterns && (
        <div className="dashboard-section">
          <h2>Detected Patterns</h2>
          <div className="patterns-grid">
            {patterns.contentPatterns && (
              <div className="pattern-card">
                <h3>Content Patterns</h3>
                <ul>
                  {Array.isArray(patterns.contentPatterns) ? (
                    patterns.contentPatterns.slice(0, 5).map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))
                  ) : (
                    <li>{patterns.contentPatterns}</li>
                  )}
                </ul>
              </div>
            )}
            {patterns.writingPatterns && (
              <div className="pattern-card">
                <h3>Writing Patterns</h3>
                <ul>
                  {Array.isArray(patterns.writingPatterns) ? (
                    patterns.writingPatterns.slice(0, 5).map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))
                  ) : (
                    <li>{patterns.writingPatterns}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personalization */}
      {(styleProfile || workPatterns || personalizedRecs.length > 0) && (
        <div className="dashboard-section">
          <h2>Personalized Insights</h2>
          {styleProfile && (
            <div className="personalization-card">
              <h3>Writing Style Profile</h3>
              <p>Preferred styles: {styleProfile.preferredStyles.join(', ') || 'Not yet determined'}</p>
              <p>Consistency: {styleProfile.consistency}</p>
            </div>
          )}
          {workPatterns && (
            <div className="personalization-card">
              <h3>Work Patterns</h3>
              <p>Pattern: {workPatterns.pattern.replace('_', ' ')}</p>
              <p>Peak hour: {workPatterns.peakHour}:00</p>
            </div>
          )}
          {personalizedRecs.length > 0 && (
            <div className="personalized-recs">
              <h3>Personalized Recommendations</h3>
              {personalizedRecs.map((rec, idx) => (
                <div key={idx} className="rec-card-small">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analysis Summary */}
      {analysis && (
        <div className="dashboard-section">
          <h2>Analysis Summary</h2>
          <div className="analysis-summary">
            {analysis.summaries && analysis.summaries.length > 0 && (
              <p><strong>{analysis.summaries.length}</strong> documents analyzed</p>
            )}
            {analysis.topics && analysis.topics.length > 0 && (
              <p><strong>{analysis.topics.length}</strong> topics identified</p>
            )}
            {analysis.relationships && analysis.relationships.length > 0 && (
              <p><strong>{analysis.relationships.length}</strong> relationships mapped</p>
            )}
            {analysis.actionItems && analysis.actionItems.length > 0 && (
              <p><strong>{analysis.actionItems.length}</strong> action items found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConciergeDashboard;

