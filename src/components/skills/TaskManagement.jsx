import React, { useState } from 'react';

function TaskManagement({ employeeName, employeeId }) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review pull requests', priority: 'High', status: 'In Progress', dueDate: 'Today' },
    { id: 2, title: 'Update documentation', priority: 'Medium', status: 'To Do', dueDate: 'Tomorrow' },
    { id: 3, title: 'Team meeting prep', priority: 'Low', status: 'To Do', dueDate: 'This Week' }
  ]);

  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Task Management</h2>
        <p>{employeeName} helps you organize and track your tasks</p>
      </div>

      <div className="task-actions">
        <button className="btn-primary" onClick={() => setShowCreateTask(true)}>
          + Create Task
        </button>
      </div>

      <div className="skill-features-grid">
        <div className="feature-card">
          <div className="feature-icon">⏰</div>
          <h3>Smart Reminders</h3>
          <p>Get reminded at the right time</p>
          <button className="btn-feature" disabled>Set Reminders</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Priority Management</h3>
          <p>Auto-prioritize based on deadlines</p>
          <button className="btn-feature" disabled>Configure</button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Productivity Insights</h3>
          <p>Track your task completion rate</p>
          <button className="btn-feature" disabled>View Stats</button>
        </div>
      </div>

      <div className="tasks-section">
        <h3>Your Tasks</h3>
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <div className="task-checkbox">
                <input type="checkbox" />
              </div>
              <div className="task-info">
                <h4>{task.title}</h4>
                <div className="task-meta">
                  <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className="task-due-date">Due: {task.dueDate}</span>
                </div>
              </div>
              <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
        <p className="placeholder-note">
          This is a preview. Tasks will sync with your project management tools.
        </p>
      </div>

      {showCreateTask && (
        <div className="modal" onClick={() => setShowCreateTask(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Task</h3>
              <button className="close-btn" onClick={() => setShowCreateTask(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" placeholder="Enter task title..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" placeholder="Task description..."></textarea>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <p className="placeholder-note">
                Task creation feature coming soon!
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateTask(false)}>Cancel</button>
              <button className="btn-primary" disabled>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManagement;

