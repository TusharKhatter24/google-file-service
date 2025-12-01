import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import EmployeeSelection from './components/EmployeeSelection';
import EmployeeWorkspaceLayout from './components/EmployeeWorkspaceLayout';
import OverviewPage from './components/workspace/OverviewPage';
import KnowledgeBasePage from './components/workspace/KnowledgeBasePage';
import ConversationsPage from './components/workspace/ConversationsPage';
import NotesPage from './components/workspace/NotesPage';
import SkillsPage from './components/workspace/SkillsPage';
import SettingsPage from './components/workspace/SettingsPage';
import ActivityLogPage from './components/workspace/ActivityLogPage';
import IntegrationsPage from './components/workspace/IntegrationsPage';
import OrganizationSettings from './components/OrganizationSettings';
import FileStoreList from './components/FileStoreList';
import FileStoreDetail from './components/FileStoreDetail';
import Files from './components/Files';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeeSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:employeeId"
          element={
            <ProtectedRoute>
              <EmployeeWorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
        </Route>
        <Route
          path="/organization/settings"
          element={
            <ProtectedRoute>
              <OrganizationSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <FileStoreList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store/:storeName"
          element={
            <ProtectedRoute>
              <FileStoreDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <Files />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

