import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import { ROUTES } from '../utils/constants.js';

const Vote = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pollId = searchParams.get('poll');

  useEffect(() => {
    loadPolls();
  }, []);

  useEffect(() => {
    if (pollId && polls.length > 0) {
      const poll = polls.find(p => p.id === pollId);
      if (poll) {
        loadPollDetails(pollId);
      }
    }
  }, [pollId, polls]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPolls();
      const allPolls = response.data;
      
      const activePolls = allPolls.filter(poll => {
        const now = new Date();
        const expiresAt = new Date(poll.expiresAt);
        return now < expiresAt;
      });
      
      setPolls(activePolls);
    } catch (error) {
      console.error('Error loading polls:', error);
      setError('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const loadPollDetails = async (pollId) => {
    try {
      setLoading(true);
      const response = await apiService.getPoll(pollId);
      setSelectedPoll(response.data);
      setSelectedOption(null);
    } catch (error) {
      console.error('Error loading poll details:', error);
      setError('Failed to load poll details');
    } finally {
      setLoading(false);
    }
  };

  const handlePollSelect = (poll) => {
    setSelectedPoll(poll);
    setSelectedOption(null);
    setError('');
    setSuccess('');
    // Update URL
    navigate(`${ROUTES.VOTE}?poll=${poll.id}`, { replace: true });
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setError('');
  };

  const handleVoteSubmit = async () => {
    if (!selectedOption || !selectedPoll) {
      setError('Please select an option');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.vote(selectedPoll.id, selectedOption);
      setSuccess('Vote submitted successfully!');
      
      // Navigate to results after successful vote
      setTimeout(() => {
        navigate(`${ROUTES.RESULTS}?poll=${selectedPoll.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error.response?.data?.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToPolls = () => {
    setSelectedPoll(null);
    setSelectedOption(null);
    setError('');
    setSuccess('');
    navigate(ROUTES.VOTE, { replace: true });
  };

  if (!hasPermission('vote')) {
    return (
      <div className="vote">
        <div className="page-content">
          <div className="error">Please log in to vote on polls.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vote">
        <div className="page-header">
          <h1 className="page-title">Vote</h1>
        </div>
        <div className="page-content">
          <Loading />
        </div>
      </div>
    );
  }

  if (selectedPoll) {
    const now = new Date();
    const expiresAt = new Date(selectedPoll.expiresAt);
    const isExpired = now > expiresAt;

    if (isExpired) {
      return (
        <div className="vote">
          <div className="page-header">
            <h1 className="page-title">Vote</h1>
          </div>
          <div className="page-content">
            <div className="poll-card">
              <div className="poll-title">{selectedPoll.title}</div>
              <div className="poll-description">{selectedPoll.description}</div>
              <div className="poll-meta expired">
                This poll has expired
              </div>
              <div className="poll-actions">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate(`${ROUTES.RESULTS}?poll=${selectedPoll.id}`)}
                >
                  View Results
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleBackToPolls}
                >
                  Back to Polls
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="vote">
        <div className="page-header">
          <h1 className="page-title">Vote</h1>
          <p className="page-subtitle">Cast your vote on: {selectedPoll.title}</p>
        </div>
        <div className="page-content">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <div className="poll-card">
            <div className="poll-title">{selectedPoll.title}</div>
            <div className="poll-description">{selectedPoll.description}</div>
            <div className="poll-meta">
              Expires: {new Date(selectedPoll.expiresAt).toLocaleString()}
            </div>
            
            <div className="vote-options">
              <h4>Choose your option:</h4>
              {selectedPoll.options?.map(option => (
                <div
                  key={option.id}
                  className={`vote-option ${selectedOption === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  {option.option}
                </div>
              ))}
            </div>
            
            <div className="poll-actions">
              <Button 
                variant="primary" 
                onClick={handleVoteSubmit}
                disabled={!selectedOption || submitting}
                loading={submitting}
              >
                Submit Vote
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleBackToPolls}
              >
                Back to Polls
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote">
      <div className="page-header">
        <h1 className="page-title">Vote</h1>
        <p className="page-subtitle">Cast your vote on available polls.</p>
      </div>
      <div className="page-content">
        {error && <div className="error">{error}</div>}
        
        {polls.length === 0 ? (
          <div className="no-polls">
            <p>No active polls available for voting.</p>
            <p>Check back later for new polls!</p>
          </div>
        ) : (
          <div className="polls-grid">
            {polls.map(poll => (
              <div key={poll.id} className="poll-card">
                <div className="poll-title">{poll.title}</div>
                <div className="poll-description">{poll.description || 'No description'}</div>
                <div className="poll-meta">
                  Expires: {new Date(poll.expiresAt).toLocaleString()} |
                  {poll.isPublic ? ' Public' : ' Private'}
                </div>
                <div className="poll-actions">
                  <Button 
                    variant="primary" 
                    onClick={() => handlePollSelect(poll)}
                  >
                    Vote on this Poll
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;