import React, { useState, useEffect } from 'react';
import { listFileStores } from '../services/fileStoreService';
import { extractTasks, calculateTaskPriorities, generateWorkflowTemplate, estimateTaskTime, recommendDocumentsForTask } from '../services/taskService';
import './WorkflowAssistant.css';

function WorkflowAssistant() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Tasks
  const [tasks, setTasks] = useState([]);
  const [prioritizedTasks, setPrioritizedTasks] = useState([]);
  
  // Workflow
  const [workflowType, setWorkflowType] = useState('general');
  const [workflowTemplate, setWorkflowTemplate] = useState(null);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  
  // Task details
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDocuments, setTaskDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

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

  const handleExtractTasks = async () => {
    if (!selectedStore) {
      setError('Please select a store');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const extractedTasks = await extractTasks(selectedStore);
      setTasks(extractedTasks);
      
      // Calculate priorities
      const prioritized = await calculateTaskPriorities(selectedStore, extractedTasks);
      setPrioritizedTasks(prioritized);
    } catch (err) {
      setError(err.message || 'Failed to extract tasks');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!selectedStore) {
      setError('Please select a store');
      return;
    }

    try {
      setGeneratingTemplate(true);
      setError(null);
      
      const template = await generateWorkflowTemplate(selectedStore, workflowType);
      setWorkflowTemplate(template);
    } catch (err) {
      setError(err.message || 'Failed to generate workflow template');
    } finally {
      setGeneratingTemplate(false);
    }
  };

  const handleEstimateTime = async () => {
    if (!selectedStore || tasks.length === 0) {
      setError('Please extract tasks first');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const tasksWithEstimates = await estimateTaskTime(selectedStore, tasks);
      setTasks(tasksWithEstimates);
      setPrioritizedTasks(tasksWithEstimates);
    } catch (err) {
      setError(err.message || 'Failed to estimate time');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewTaskDetails = async (task) => {
    setSelectedTask(task);
    setLoadingDocuments(true);
    
    try {
      const documents = await recommendDocumentsForTask(selectedStore, task.description);
      setTaskDocuments(documents);
    } catch (err) {
      setError(err.message || 'Failed to load task documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="workflow-assistant loading">Loading...</div>;
  }

  return (
    <div className="workflow-assistant">
      <div className="workflow-header">
        <h1>Workflow Assistant</h1>
        <p className="workflow-subtitle">Extract tasks, manage priorities, and optimize workflows</p>
      </div>

      {error && <div className="workflow-error">{error}</div>}

      {/* Store Selection */}
      <div className="workflow-section">
        <h2>Select Knowledge Store</h2>
        <select
          className="store-select"
          value={selectedStore || ''}
          onChange={(e) => setSelectedStore(e.target.value)}
        >
          <option value="">-- Select a store --</option>
          {stores.map(store => (
            <option key={store.name} value={store.name}>
              {store.displayName || store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task Extraction */}
      {selectedStore && (
        <div className="workflow-section">
          <h2>Task Management</h2>
          <div className="workflow-actions">
            <button
              className="btn-primary"
              onClick={handleExtractTasks}
              disabled={processing}
            >
              {processing ? 'Extracting...' : 'Extract Tasks from Documents'}
            </button>
            {tasks.length > 0 && (
              <button
                className="btn-secondary"
                onClick={handleEstimateTime}
                disabled={processing}
              >
                {processing ? 'Estimating...' : 'Estimate Time'}
              </button>
            )}
          </div>

          {/* Tasks List */}
          {prioritizedTasks.length > 0 && (
            <div className="tasks-list">
              <h3>Extracted Tasks ({prioritizedTasks.length})</h3>
              {prioritizedTasks.map((task, idx) => (
                <div key={task.id || idx} className="task-card">
                  <div className="task-header">
                    <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                      {task.priority || 'medium'}
                    </span>
                    {task.estimatedHours && (
                      <span className="time-estimate">
                        ~{task.estimatedHours} hours
                      </span>
                    )}
                    {task.complexity && (
                      <span className="complexity-badge">
                        {task.complexity}
                      </span>
                    )}
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    {task.dueDate && (
                      <span>Due: {formatDate(task.dueDate)}</span>
                    )}
                    {task.source && (
                      <span>Source: {task.source}</span>
                    )}
                    <span className={`status-badge status-${task.status || 'pending'}`}>
                      {task.status || 'pending'}
                    </span>
                  </div>
                  {task.priorityReasoning && (
                    <div className="priority-reasoning">
                      <strong>Priority reasoning:</strong> {task.priorityReasoning}
                    </div>
                  )}
                  <button
                    className="btn-link"
                    onClick={() => handleViewTaskDetails(task)}
                  >
                    View Related Documents
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="task-detail">
                <h4>{selectedTask.description}</h4>
                <div className="task-detail-meta">
                  <span>Priority: {selectedTask.priority}</span>
                  {selectedTask.estimatedHours && (
                    <span>Estimated: {selectedTask.estimatedHours} hours</span>
                  )}
                  {selectedTask.complexity && (
                    <span>Complexity: {selectedTask.complexity}</span>
                  )}
                </div>
              </div>
              
              {loadingDocuments ? (
                <div className="loading">Loading documents...</div>
              ) : taskDocuments.length > 0 ? (
                <div className="task-documents">
                  <h4>Recommended Documents</h4>
                  {taskDocuments.map((doc, idx) => (
                    <div key={idx} className="document-recommendation">
                      <h5>{doc.documentName || 'Document'}</h5>
                      <p className="relevance">Relevance: {doc.relevance || 'High'}</p>
                      {doc.keyInfo && (
                        <p className="key-info">{doc.keyInfo}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recommended documents found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Templates */}
      {selectedStore && (
        <div className="workflow-section">
          <h2>Workflow Templates</h2>
          <div className="template-controls">
            <select
              className="template-type-select"
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
            >
              <option value="general">General Workflow</option>
              <option value="meeting">Meeting</option>
              <option value="project">Project</option>
              <option value="document">Document Creation</option>
              <option value="review">Review Process</option>
            </select>
            <button
              className="btn-primary"
              onClick={handleGenerateTemplate}
              disabled={generatingTemplate}
            >
              {generatingTemplate ? 'Generating...' : 'Generate Template'}
            </button>
          </div>

          {workflowTemplate && (
            <div className="workflow-template">
              <h3>{workflowTemplate.name || 'Workflow Template'}</h3>
              <p className="template-description">{workflowTemplate.description}</p>
              
              {workflowTemplate.steps && workflowTemplate.steps.length > 0 && (
                <div className="template-steps">
                  <h4>Steps</h4>
                  <ol>
                    {workflowTemplate.steps.map((step, idx) => (
                      <li key={idx}>
                        <strong>{step.name || `Step ${step.order || idx + 1}`}</strong>
                        {step.description && <p>{step.description}</p>}
                        {step.estimatedTime && (
                          <span className="step-time">⏱ {step.estimatedTime}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {workflowTemplate.resources && workflowTemplate.resources.length > 0 && (
                <div className="template-resources">
                  <h4>Resources</h4>
                  <ul>
                    {workflowTemplate.resources.map((resource, idx) => (
                      <li key={idx}>{resource}</li>
                    ))}
                  </ul>
                </div>
              )}

              {workflowTemplate.milestones && workflowTemplate.milestones.length > 0 && (
                <div className="template-milestones">
                  <h4>Milestones</h4>
                  <ul>
                    {workflowTemplate.milestones.map((milestone, idx) => (
                      <li key={idx}>{milestone}</li>
                    ))}
                  </ul>
                </div>
              )}

              {workflowTemplate.tips && workflowTemplate.tips.length > 0 && (
                <div className="template-tips">
                  <h4>Tips</h4>
                  <ul>
                    {workflowTemplate.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkflowAssistant;

