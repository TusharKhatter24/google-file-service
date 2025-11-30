import React, { useState } from 'react';
import './CreateEmployeeModal.css';

function CreateEmployeeModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    icon: '🤖',
    color: '#667eea',
    defaultSystemPrompt: '',
  });

  const [errors, setErrors] = useState({});

  const predefinedColors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3', '#ff9a9e',
    '#fad0c4', '#ffd1ff', '#a1c4fd', '#c2e9fb', '#fbc2eb'
  ];

  const commonIcons = [
    '🤖', '🦸', '🦸‍♀️', '🦸‍♂️', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻',
    '👨‍🔧', '👩‍🔧', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍🎨', '👩‍🎨',
    '💼', '📊', '📈', '📉', '🎯', '🚀', '💡', '⭐'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.defaultSystemPrompt.trim()) {
      newErrors.defaultSystemPrompt = 'System prompt is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Generate a unique ID
    const id = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    
    const newEmployee = {
      ...formData,
      id,
      name: formData.name.trim(),
      role: formData.role.trim(),
      description: formData.description.trim(),
      defaultSystemPrompt: formData.defaultSystemPrompt.trim(),
    };

    // Save to localStorage
    const customEmployeesJson = localStorage.getItem('customEmployees');
    let customEmployees = [];
    
    if (customEmployeesJson) {
      try {
        customEmployees = JSON.parse(customEmployeesJson);
      } catch (e) {
        console.error('Failed to parse custom employees:', e);
      }
    }
    
    customEmployees.push(newEmployee);
    localStorage.setItem('customEmployees', JSON.stringify(customEmployees));

    // Call the save callback
    onSave(newEmployee);
    
    // Reset form
    setFormData({
      name: '',
      role: '',
      description: '',
      icon: '🤖',
      color: '#667eea',
      defaultSystemPrompt: '',
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      role: '',
      description: '',
      icon: '🤖',
      color: '#667eea',
      defaultSystemPrompt: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Build a New Team Member</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., Alex"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Role <span className="required">*</span>
            </label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className={`form-input ${errors.role ? 'error' : ''}`}
              placeholder="e.g., AI Sales Manager"
            />
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="A brief description of what this AI employee does..."
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icon" className="form-label">
                Icon
              </label>
              <div className="icon-selector">
                <input
                  id="icon"
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  className="form-input icon-input"
                  placeholder="🤖"
                  maxLength="2"
                />
                <div className="icon-preview">{formData.icon}</div>
              </div>
              <div className="icon-suggestions">
                {commonIcons.map((icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="icon-option"
                    onClick={() => handleChange('icon', icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="color" className="form-label">
                Color
              </label>
              <div className="color-selector">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="color-input"
                />
                <div className="color-preview" style={{ backgroundColor: formData.color }}></div>
              </div>
              <div className="color-presets">
                {predefinedColors.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="color-preset"
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange('color', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="defaultSystemPrompt" className="form-label">
              System Prompt <span className="required">*</span>
              <span className="form-help">
                This defines the AI's personality, role, and behavior
              </span>
            </label>
            <textarea
              id="defaultSystemPrompt"
              value={formData.defaultSystemPrompt}
              onChange={(e) => handleChange('defaultSystemPrompt', e.target.value)}
              className={`form-textarea ${errors.defaultSystemPrompt ? 'error' : ''}`}
              placeholder="You are [Name], an AI [Role]. Your primary role is to..."
              rows="8"
            />
            {errors.defaultSystemPrompt && <span className="error-message">{errors.defaultSystemPrompt}</span>}
            <div className="form-hint">
              Tip: Include instructions about using only knowledge base information and how to respond when information is not available.
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Team Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployeeModal;

