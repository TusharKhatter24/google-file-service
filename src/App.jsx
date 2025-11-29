import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import FileStoreList from './components/FileStoreList';
import FileStoreDetail from './components/FileStoreDetail';
import Files from './components/Files';
import ConciergeDashboard from './components/ConciergeDashboard';
import WorkflowAssistant from './components/WorkflowAssistant';
import KnowledgeGraph from './components/KnowledgeGraph';
import AskInterface from './components/AskInterface';
import Settings from './components/Settings';
import NotesEditor from './components/NotesEditor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-container">
            <Link to="/ask" className="app-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img 
                  src="https://cdn.prod.website-files.com/68d14433cd550114f9ff7bf6/68dbeba8eee819e51bbce486_donna-full_body.png" 
                  alt="Donna" 
                  className="header-logo"
                  onLoad={(e) => {
                    // Ensure animation plays even if image loads from cache
                    e.target.style.animation = 'none';
                    setTimeout(() => {
                      e.target.style.animation = '';
                    }, 10);
                  }}
                />
                <div className="header-title-text">
                  <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Ask Donna</h1>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9, fontWeight: 400 }}>Your Intelligent Knowledge Assistant</p>
                </div>
              </div>
            </Link>
            <nav className="main-nav">
              <Link to="/ask" className="nav-link nav-link-primary">
                Ask Donna 
              </Link>
              <Link to="/notes" className="nav-link nav-link-primary">
                Notes Taker
              </Link>
              <Link to="/segments" className="nav-link">
                Knowledge Segments
              </Link>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/files" className="nav-link nav-link-secondary">
                Documents
              </Link>
              <Link to="/settings" className="nav-link nav-link-secondary">
                Settings
              </Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/ask" replace />} />
            <Route path="/ask" element={<AskInterface />} />
            <Route path="/notes" element={<NotesEditor />} />
            <Route path="/notes/:storeName" element={<NotesEditor />} />
            <Route path="/segments" element={<FileStoreList />} />
            <Route path="/store/:storeName" element={<FileStoreDetail />} />
            <Route path="/files" element={<Files />} />
            <Route path="/dashboard" element={<ConciergeDashboard />} />
            <Route path="/workflow" element={<WorkflowAssistant />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

