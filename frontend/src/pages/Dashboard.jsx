import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PollCard from '../components/polls/PollCard.jsx';
import Loading from '../components/common/Loading.jsx';
import { apiService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import webSocketService from '../services/websocket.js';
import { ROUTES } from '../utils/constants.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPolls();
    
    // Set up WebSocket event listeners for real-time updates
    const handlePollsUpdated = () => {
      loadPolls();
    };

    webSocketService.on('pollCreated', handlePollsUpdated);
    webSocketService.on('pollUpdated', handlePollsUpdated);
    webSocketService.on('newVote', handlePollsUpdated);

    // Cleanup on unmount
    return () => {
      webSocketService.off('pollCreated', handlePollsUpdated);
      webSocketService.off('pollUpdated', handlePollsUpdated);
      webSocketService.off('newVote', handlePollsUpdated);
    };
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getPolls();
      setPolls(response.data);
    } catch (error) {
      console.error('Error loading polls:', error);
      setError('Failed to load polls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (pollId) => {
    navigate(`${ROUTES.VOTE}?poll=${pollId}`);
  };

  const handleViewResults = (pollId) => {
    navigate(`${ROUTES.RESULTS}?poll=${pollId}`);
  };

  const handleEdit = (pollId) => {
    navigate(`${ROUTES.EDIT_POLL}?poll=${pollId}`);
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deletePoll(pollId);
      await loadPolls(); // Refresh the list
    } catch (error) {
      console.error('Error deleting poll:', error);
      setError('Failed to delete poll. Please try again.');
    }
  };

  const handleManageAccess = async (pollId) => {
    const email = window.prompt('Enter email address to allow access to this private poll:');
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await apiService.allowUser(pollId, email);
      alert(`User ${email} granted access to poll successfully!`);
    } catch (error) {
      console.error('Error granting access:', error);
      const message = error.response?.data?.message || 'Failed to grant access';
      alert(message);
    }
  };

  if (loading) {
    return <Loading message="Loading your polls..." />;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here are your available polls.</p>
      </div>

      <div className="page-content">
        {error && (
          <div className="error-container">
            {error}
          </div>
        )}

        {polls.length === 0 && !loading ? (
          <div className="text-center">
            <p>No polls available.</p>
            {isAdmin() && (
              <p>
                <a href={ROUTES.CREATE_POLL}>Create your first poll!</a>
              </p>
            )}
          </div>
        ) : (
          <>
            <h3>Your Available Polls ({polls.length})</h3>
            <div className="grid">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVote={handleVote}
                  onViewResults={handleViewResults}
                  onEdit={isAdmin() ? handleEdit : undefined}
                  onDelete={isAdmin() ? handleDelete : undefined}
                  onManageAccess={isAdmin() ? handleManageAccess : undefined}
                  isAdmin={isAdmin()}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;