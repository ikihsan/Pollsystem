import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import { ROUTES } from '../utils/constants.js';

const ManagePolls = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (hasPermission('manage_polls')) {
      loadPolls();
    }
  }, [hasPermission]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPolls();
      setPolls(response.data);
    } catch (error) {
      console.error('Error loading polls:', error);
      setError('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId, pollTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${pollTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deletePoll(pollId);
      setSuccess(`Poll "${pollTitle}" deleted successfully`);
      loadPolls();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting poll:', error);
      setError(error.response?.data?.message || 'Failed to delete poll');
    }
  };

  const handleManageAccess = async (pollId, pollTitle) => {
    const email = window.prompt(`Enter email address to grant access to "${pollTitle}"`);
    if (!email) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await apiService.allowUser(pollId, email);
      setSuccess(`User ${email} granted access to poll successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error granting access:', error);
      setError(error.response?.data?.message || 'Failed to grant access');
    }
  };

  const handleEditPoll = (pollId) => {
    navigate(`${ROUTES.EDIT_POLL}/${pollId}`);
  };

  const handleViewResults = (pollId) => {
    navigate(`${ROUTES.RESULTS}?poll=${pollId}`);
  };

  if (!hasPermission('manage_polls')) {
    return (
      <div className="manage-polls">
        <div className="page-content">
          <div className="error">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="manage-polls">
        <div className="page-header">
          <h1 className="page-title">Manage Polls</h1>
        </div>
        <div className="page-content">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="manage-polls">
      <div className="page-header">
        <h1 className="page-title">Manage Polls</h1>
        <p className="page-subtitle">Manage all polls in the system.</p>
      </div>
      <div className="page-content">
        <div className="admin-only">⚠️ Admin panel for managing all polls</div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <div className="manage-actions">
          <Button 
            variant="primary" 
            onClick={() => navigate(ROUTES.CREATE_POLL)}
          >
            Create New Poll
          </Button>
        </div>

        {polls.length === 0 ? (
          <div className="no-polls">
            <p>No polls to manage.</p>
            <p>Create your first poll to get started!</p>
          </div>
        ) : (
          <div className="polls-grid">
            {polls.map(poll => {
              const isExpired = new Date(poll.expiresAt) <= new Date();
              return (
                <div key={poll.id} className="poll-card">
                  <div className="poll-title">{poll.title}</div>
                  <div className="poll-description">{poll.description || 'No description'}</div>
                  <div className="poll-meta">
                    Created: {new Date(poll.createdAt).toLocaleDateString()} | 
                    Status: {isExpired ? 'Expired' : 'Active'} |
                    {poll.isPublic ? ' Public' : ' Private'}
                  </div>
                  
                  <div className="poll-actions">
                    <Button 
                      variant="primary" 
                      onClick={() => handleViewResults(poll.id)}
                    >
                      View Results
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEditPoll(poll.id)}
                    >
                      Edit Poll
                    </Button>
                    
                    {!poll.isPublic && (
                      <Button 
                        variant="info" 
                        onClick={() => handleManageAccess(poll.id, poll.title)}
                      >
                        Manage Access
                      </Button>
                    )}
                    
                    <Button 
                      variant="danger" 
                      onClick={() => handleDeletePoll(poll.id, poll.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePolls;