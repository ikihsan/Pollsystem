import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import { ROUTES } from '../utils/constants.js';

const EditPoll = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { pollId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [poll, setPoll] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    isPublic: true
  });

  useEffect(() => {
    if (!pollId) {
      setError('Poll ID is required');
      setLoading(false);
      return;
    }

    if (!hasPermission('manage_polls')) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    loadPoll();
  }, [pollId, hasPermission]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPoll(pollId);
      const pollData = response.data;
      
      setPoll(pollData);
      setFormData({
        title: pollData.title || '',
        description: pollData.description || '',
        duration: pollData.duration || 60,
        isPublic: pollData.isPublic !== undefined ? pollData.isPublic : true
      });
    } catch (error) {
      console.error('Error loading poll:', error);
      setError(error.response?.data?.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Poll title is required');
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
    
    setSubmitting(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration),
        isPublic: formData.isPublic
      };
      
      const response = await apiService.editPoll(pollId, updateData);
      
      if (response.status === 200) {
        setSuccess('Poll updated successfully!');
        
   
        setTimeout(() => {
          navigate(ROUTES.MANAGE_POLLS);
        }, 2000);
      }
    } catch (error) {
      console.error('Edit poll error:', error);
      setError(error.response?.data?.message || 'Failed to update poll');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission('manage_polls')) {
    return (
      <div className="edit-poll">
        <div className="page-content">
          <div className="error">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  if (!pollId) {
    return (
      <div className="edit-poll">
        <div className="page-content">
          <div className="error">Poll ID is required. Please go back to Manage Polls and select a poll to edit.</div>
          <Button 
            variant="secondary" 
            onClick={() => navigate(ROUTES.MANAGE_POLLS)}
          >
            Back to Manage Polls
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="edit-poll">
        <div className="page-header">
          <h1 className="page-title">Edit Poll</h1>
        </div>
        <div className="page-content">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="edit-poll">
        <div className="page-header">
          <h1 className="page-title">Edit Poll</h1>
        </div>
        <div className="page-content">
          <div className="error">{error}</div>
          <Button 
            variant="secondary" 
            onClick={() => navigate(ROUTES.MANAGE_POLLS)}
          >
            Back to Manage Polls
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-poll">
      <div className="page-header">
        <h1 className="page-title">Edit Poll</h1>
        <p className="page-subtitle">Update poll details and settings.</p>
      </div>
      
      <div className="page-content">
        <div className="admin-only">⚠️ Only admins can edit polls</div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        {poll && (
          <div className="poll-info">
            <p><strong>Editing:</strong> {poll.title}</p>
            <p><strong>Created:</strong> {new Date(poll.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {new Date(poll.expiresAt) <= new Date() ? 'Expired' : 'Active'}</p>
          </div>
        )}
        
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
          
          <div className="form-actions">
            <Button type="submit" variant="primary" loading={submitting}>
              Update Poll
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate(ROUTES.MANAGE_POLLS)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPoll;