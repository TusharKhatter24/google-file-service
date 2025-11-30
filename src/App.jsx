import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import EmployeeSelection from './components/EmployeeSelection';
import EmployeeDetail from './components/EmployeeDetail';
import EmployeeSettings from './components/EmployeeSettings';
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
              <EmployeeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:employeeId/settings"
          element={
            <ProtectedRoute>
              <EmployeeSettings />
            </ProtectedRoute>
          }
        />
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

