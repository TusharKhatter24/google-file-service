import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FileStoreList from './components/FileStoreList';
import FileStoreDetail from './components/FileStoreDetail';
import Files from './components/Files';
import ConciergeDashboard from './components/ConciergeDashboard';
import WorkflowAssistant from './components/WorkflowAssistant';
import KnowledgeGraph from './components/KnowledgeGraph';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" className="app-title">
              <h1>Google File Manager</h1>
            </Link>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                Stores
              </Link>
              <Link to="/files" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                Files
              </Link>
              <Link to="/concierge" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                AI Concierge
              </Link>
              <Link to="/workflow" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                Workflow
              </Link>
              <Link to="/knowledge-graph" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                Knowledge Graph
              </Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<FileStoreList />} />
            <Route path="/store/:storeName" element={<FileStoreDetail />} />
            <Route path="/files" element={<Files />} />
            <Route path="/concierge" element={<ConciergeDashboard />} />
            <Route path="/workflow" element={<WorkflowAssistant />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

