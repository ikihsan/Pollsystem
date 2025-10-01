import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.js';
import Button from '../components/common/Button.jsx';
import { ROUTES } from '../utils/constants.js';

const CreatePoll = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    isPublic: true,
    options: ['', '']
  });

  // Redirect if not admin
  if (!hasPermission('create_poll')) {
    return (
      <div className="create-poll">
        <div className="page-content">
          <div className="error">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const addOption = () => {
    if (formData.options.length >= 10) {
      setError('Maximum 10 options allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setError('At least 2 options are required');
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Poll title is required');
      return false;
    }
    
    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return false;
    }
    
    if (formData.duration < 5 || formData.duration > 120) {
      setError('Duration must be between 5 and 120 minutes');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const pollData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration),
        isPublic: formData.isPublic,
        options: formData.options.filter(option => option.trim())
      };
      
      const response = await apiService.createPoll(pollData);
      
      if (response.status === 201) {
        setSuccess('Poll created successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          duration: 60,
          isPublic: true,
          options: ['', '']
        });
        
        // Redirect to manage polls after a short delay
        setTimeout(() => {
          navigate(ROUTES.MANAGE_POLLS);
        }, 2000);
      }
    } catch (error) {
      console.error('Create poll error:', error);
      setError(error.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll">
      <div className="page-header">
        <h1 className="page-title">Create New Poll</h1>
        <p className="page-subtitle">Create a new poll for users to vote on.</p>
      </div>
      
      <div className="page-content">
        <div className="admin-only">⚠️ Only admins can create polls</div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="poll-form">
          <div className="form-group">
            <label htmlFor="title">Poll Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional):</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">Duration (minutes, 5-120):</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="5"
              max="120"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span>Public Poll</span>
            </label>
          </div>
          
          <div className="form-group">
            <label>Poll Options:</label>
            <div className="options-container">
              {formData.options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeOption(index)}
                    disabled={formData.options.length <= 2}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addOption}
              disabled={formData.options.length >= 10}
            >
              Add Option
            </Button>
          </div>
          
          <div className="form-actions">
            <Button type="submit" variant="primary" loading={loading}>
              Create Poll
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;