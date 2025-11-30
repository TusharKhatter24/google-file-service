import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { mapDocumentRelationships, analyzeStoreDocuments } from '../services/documentAnalysisService';
import { listFileStores, listDocuments } from '../services/fileStoreService';
import './KnowledgeGraph.css';

function KnowledgeGraph() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const canvasRef = useRef(null);
  const isLoadingRelationshipsRef = useRef(false);
  const lastSelectedStoreRef = useRef(null);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    // Only load if store changed and we're not already loading
    if (selectedStore && selectedStore !== lastSelectedStoreRef.current && !isLoadingRelationshipsRef.current) {
      lastSelectedStoreRef.current = selectedStore;
      loadRelationships();
    }
  }, [selectedStore]);

  useEffect(() => {
    if (relationships.length > 0) {
      drawGraph();
    }
  }, [relationships]);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFileStores(20);
      setStores(response.fileSearchStores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRelationships = async () => {
    if (!selectedStore || isLoadingRelationshipsRef.current) return;

    try {
      isLoadingRelationshipsRef.current = true;
      setAnalyzing(true);
      setError(null);
      
      const analysisData = await analyzeStoreDocuments(selectedStore);
      setAnalysis(analysisData);
      
      if (analysisData.relationships) {
        setRelationships(analysisData.relationships);
      } else {
        // Fallback: get relationships directly
        const docs = await listDocuments(selectedStore, 20);
        const rels = await mapDocumentRelationships(selectedStore, docs.documents || []);
        setRelationships(rels);
      }
    } catch (err) {
      setError(err.message || 'Failed to load relationships');
    } finally {
      setAnalyzing(false);
      isLoadingRelationshipsRef.current = false;
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas || relationships.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Extract unique documents
    const documents = new Set();
    relationships.forEach(rel => {
      if (rel.document1) documents.add(rel.document1);
      if (rel.document2) documents.add(rel.document2);
    });

    const docArray = Array.from(documents);
    const nodeCount = docArray.length;

    if (nodeCount === 0) {
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No relationships found', width / 2, height / 2);
      return;
    }

    // Calculate node positions in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    const nodes = docArray.map((doc, idx) => {
      const angle = (2 * Math.PI * idx) / nodeCount;
      return {
        name: doc,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Draw edges (relationships)
    relationships.forEach(rel => {
      const node1 = nodes.find(n => n.name === rel.document1);
      const node2 = nodes.find(n => n.name === rel.document2);
      
      if (node1 && node2) {
        ctx.strokeStyle = getRelationshipColor(rel.relationshipType);
        ctx.lineWidth = getRelationshipWidth(rel.strength);
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Node label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const label = node.name.split('/').pop().substring(0, 20);
      ctx.fillText(label, node.x, node.y - 15);
    });
  };

  const getRelationshipColor = (type) => {
    const colors = {
      similar: '#3b82f6',
      related: '#10b981',
      sequence: '#f59e0b',
      builds_upon: '#8b5cf6',
      default: '#6b7280',
    };
    return colors[type] || colors.default;
  };

  const getRelationshipWidth = (strength) => {
    const widths = {
      strong: 3,
      medium: 2,
      weak: 1,
      default: 1,
    };
    return widths[strength] || widths.default;
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = Math.max(600, container.clientHeight);
      if (relationships.length > 0) {
        drawGraph();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="knowledge-graph">
        <div className="loading" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="knowledge-graph">
      <div className="graph-header">
        <h1>Knowledge Graph</h1>
        <p className="graph-subtitle">Visualize document relationships and connections</p>
      </div>

      {error && <div className="graph-error">{error}</div>}

      {/* Store Selection */}
      <div className="graph-section">
        <h2>Select Knowledge Segment</h2>
        {stores.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕸️</div>
            <h3>No knowledge segments available</h3>
            <p>Create a knowledge segment first to visualize document relationships.</p>
            <Link to="/segments" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Create Segment
            </Link>
          </div>
        ) : (
          <select
            className="store-select"
            value={selectedStore || ''}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <option value="">-- Select a segment --</option>
            {stores.map(store => (
              <option key={store.name} value={store.name}>
                {store.displayName || store.name}
              </option>
            ))}
          </select>
        )}
        {selectedStore && (
          <button
            className="btn-refresh"
            onClick={loadRelationships}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Refresh Graph'}
          </button>
        )}
      </div>

      {/* Graph Visualization */}
      {selectedStore && (
        <div className="graph-section">
          <h2>Document Relationships</h2>
          {analyzing && (
            <div className="analyzing-indicator">
              <div className="spinner"></div>
              <span>Analyzing relationships...</span>
            </div>
          )}
          
          {relationships.length > 0 ? (
            <div className="graph-container">
              <canvas ref={canvasRef} className="graph-canvas"></canvas>
              
              {/* Legend */}
              <div className="graph-legend">
                <h3>Legend</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#3b82f6' }}></span>
                    <span>Similar Documents</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#10b981' }}></span>
                    <span>Related Documents</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#f59e0b' }}></span>
                    <span>Sequential Documents</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#8b5cf6' }}></span>
                    <span>Builds Upon</span>
                  </div>
                </div>
              </div>

              {/* Relationship List */}
              <div className="relationships-list">
                <h3>Relationships ({relationships.length})</h3>
                {relationships.slice(0, 20).map((rel, idx) => (
                  <div key={idx} className="relationship-item">
                    <div className="relationship-header">
                      <span className="rel-type">{rel.relationshipType || 'related'}</span>
                      <span className="rel-strength">{rel.strength || 'medium'}</span>
                    </div>
                    <div className="relationship-docs">
                      <span className="doc-name">{rel.document1?.split('/').pop() || 'Document 1'}</span>
                      <span className="rel-arrow">→</span>
                      <span className="doc-name">{rel.document2?.split('/').pop() || 'Document 2'}</span>
                    </div>
                    {rel.description && (
                      <p className="rel-description">{rel.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : !analyzing && (
            <div className="no-relationships">
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
                <h3>No relationships found</h3>
                <p>Select a segment and analyze it to visualize document relationships.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Summary */}
      {analysis && (
        <div className="graph-section">
          <h2>Analysis Summary</h2>
          <div className="analysis-summary">
            {analysis.summaries && (
              <p><strong>{analysis.summaries.length}</strong> documents analyzed</p>
            )}
            {analysis.topics && (
              <p><strong>{analysis.topics.length}</strong> topics identified</p>
            )}
            {analysis.relationships && (
              <p><strong>{analysis.relationships.length}</strong> relationships mapped</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;

