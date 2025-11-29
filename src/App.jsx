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
              <h1>AI Concierge</h1>
            </Link>
            <nav className="main-nav">
              <Link to="/ask" className="nav-link nav-link-primary">
                Ask AI Concierge 
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

