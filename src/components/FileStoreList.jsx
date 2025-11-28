import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createFileStore, listFileStores, deleteFileStore } from '../services/fileStoreService';
import './FileStoreList.css';

function FileStoreList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listFileStores();
      setStores(response.fileSearchStores || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      setError('Store name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createFileStore(newStoreName.trim());
      setNewStoreName('');
      setShowCreateModal(false);
      await loadStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStore = async (storeName, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(storeName);
      setError(null);
      await deleteFileStore(storeName, true); // Force delete to remove documents too
      await loadStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(2)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading file stores...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-section">
        <h2>File Search Stores</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New Store
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {stores.length === 0 ? (
        <div className="empty-state">
          <h3>No file stores found</h3>
          <p>Create your first file search store to get started.</p>
        </div>
      ) : (
        <div className="store-list">
          {stores.map((store) => (
            <div key={store.name} className="store-card">
              <div className="store-info">
                <div className="store-name">{store.displayName || store.name}</div>
                <div className="store-details">
                  <span>Created: {formatDate(store.createTime)}</span>
                  <span>Active Docs: {store.activeDocumentsCount || 0}</span>
                  <span>Pending: {store.pendingDocumentsCount || 0}</span>
                  <span>Failed: {store.failedDocumentsCount || 0}</span>
                  <span>Size: {formatBytes(store.sizeBytes)}</span>
                </div>
              </div>
              <div className="store-actions">
                <Link
                  to={`/store/${encodeURIComponent(store.name)}`}
                  className="btn btn-primary"
                >
                  View
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteStore(store.name, store.displayName)}
                  disabled={deleting === store.name}
                >
                  {deleting === store.name ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New File Store</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label htmlFor="storeName">Store Display Name</label>
                <input
                  id="storeName"
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g., My Document Store"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileStoreList;

