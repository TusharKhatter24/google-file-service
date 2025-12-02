import React, { useState } from 'react';
import './SkillsShared.css';

function KnowledgeBaseSearch({ employeeName, employeeId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearching(false);
      alert('Knowledge base search coming soon!');
    }, 1500);
  };

  const recentSearches = [
    'How to deploy to production?',
    'API authentication guide',
    'Database backup procedures'
  ];

  const quickAccess = [
    { id: 1, title: 'Getting Started Guide', category: 'Documentation', views: 234 },
    { id: 2, title: 'API Reference', category: 'Technical', views: 189 },
    { id: 3, title: 'Troubleshooting FAQ', category: 'Support', views: 456 }
  ];

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Knowledge Base Search</h2>
        <p>{employeeName} can search through your company knowledge base</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a question or search for documentation..."
              className="search-input"
            />
            <button type="submit" className="btn-search" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI-Powered Search</h3>
          <p>Natural language understanding</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Quick Answers</h3>
          <p>Instant responses from documentation</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Context Aware</h3>
          <p>Personalized results based on your role</p>
        </div>
      </div>

      <div className="recent-searches-section">
        <h3>Recent Searches</h3>
        <div className="recent-searches-list">
          {recentSearches.map((search, idx) => (
            <div key={idx} className="recent-search-item" onClick={() => setSearchQuery(search)}>
              <span className="recent-search-icon">🕐</span>
              <span>{search}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-access-section">
        <h3>Quick Access</h3>
        <div className="quick-access-list">
          {quickAccess.map(doc => (
            <div key={doc.id} className="quick-access-item">
              <div className="doc-info">
                <h4>{doc.title}</h4>
                <div className="doc-meta">
                  <span className="doc-category">{doc.category}</span>
                  <span className="doc-views">{doc.views} views</span>
                </div>
              </div>
              <button className="btn-view-doc" disabled>View</button>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          Connect your knowledge base to enable search
        </p>
      </div>
    </div>
  );
}

export default KnowledgeBaseSearch;

