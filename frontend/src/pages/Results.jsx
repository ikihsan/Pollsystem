import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import { ROUTES } from '../utils/constants.js';

const Results = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for specific poll in URL params
  const [chartData, setChartData] = useState([]);

  const pollId = searchParams.get('poll');

  useEffect(() => {
    if (pollId) {
      loadPollResults(pollId);
    } else {
      loadPolls();
    }
  }, [pollId]);

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

  const loadPollResults = async (pollId) => {
    try {
      setLoading(true);
      const [pollResponse, resultsResponse] = await Promise.all([
        apiService.getPoll(pollId),
        apiService.getPollResults(pollId)
      ]);
      
      setSelectedPoll(pollResponse.data);
      setResults(resultsResponse.data);
    } catch (error) {
      console.error('Error loading poll results:', error);
      setError('Failed to load poll results');
    } finally {
      setLoading(false);
    }
  };

  const handlePollSelect = (poll) => {
    navigate(`${ROUTES.RESULTS}?poll=${poll.id}`);
  };

  const handleBackToList = () => {
    setSelectedPoll(null);
    setResults([]);
    setError('');
    navigate(ROUTES.RESULTS, { replace: true });
    loadPolls();
  };

  if (!hasPermission('view_results')) {
    return (
      <div className="results">
        <div className="page-content">
          <div className="error">Please log in to view poll results.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="results">
        <div className="page-header">
          <h1 className="page-title">Results</h1>
        </div>
        <div className="page-content">
          <Loading />
        </div>
      </div>
    );
  }

  // Show results for selected poll
  if (selectedPoll && results.length > 0) {
    const totalVotes = results.reduce((sum, option) => sum + option.votes, 0);

    return (
      <div className="results">
        <div className="page-header">
          <h1 className="page-title">Poll Results</h1>
          <p className="page-subtitle">{selectedPoll.title}</p>
        </div>
        <div className="page-content">
          {error && <div className="error">{error}</div>}
          
          <div className="poll-card">
            <div className="poll-title">{selectedPoll.title}</div>
            <div className="poll-description">{selectedPoll.description}</div>
            <div className="poll-meta">
              Created: {new Date(selectedPoll.createdAt).toLocaleDateString()} | 
              Expires: {new Date(selectedPoll.expiresAt).toLocaleDateString()} |
              Status: {new Date(selectedPoll.expiresAt) > new Date() ? 'Active' : 'Expired'}
            </div>
            
            <div className="results-summary">
              <h3>Results Summary</h3>
              <p><strong>Total Votes:</strong> {totalVotes}</p>
            </div>
            
            <div className="results-details">
              {results.map(option => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100) : 0;
                return (
                  <div key={option.id} className="result-item">
                    <div className="result-text">
                      <span className="option-name">{option.option}</span>
                      <span className="vote-count">{option.votes} votes ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="result-bar">
                      <div 
                        className="result-fill" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="poll-actions">
              <Button 
                variant="secondary" 
                onClick={handleBackToList}
              >
                Back to Results List
              </Button>
              {new Date(selectedPoll.expiresAt) > new Date() && (
                <Button 
                  variant="primary" 
                  onClick={() => navigate(`${ROUTES.VOTE}?poll=${selectedPoll.id}`)}
                >
                  Vote on this Poll
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="page-header">
        <h1 className="page-title">Results</h1>
        <p className="page-subtitle">View poll results and statistics.</p>
      </div>
      <div className="page-content">
        {error && <div className="error">{error}</div>}
        
        {polls.length === 0 ? (
          <div className="no-polls">
            <p>No polls available to view results.</p>
          </div>
        ) : (
          <div className="polls-grid">
            <h3>Select a poll to view results:</h3>
            {polls.map(poll => (
              <div key={poll.id} className="poll-card">
                <div className="poll-title">{poll.title}</div>
                <div className="poll-description">{poll.description || 'No description'}</div>
                <div className="poll-meta">
                  Created: {new Date(poll.createdAt).toLocaleDateString()} | 
                  Status: {new Date(poll.expiresAt) > new Date() ? 'Active' : 'Expired'} |
                  {poll.isPublic ? ' Public' : ' Private'}
                </div>
                <div className="poll-actions">
                  <Button 
                    variant="primary" 
                    onClick={() => handlePollSelect(poll)}
                  >
                    View Results
                  </Button>
                  {new Date(poll.expiresAt) > new Date() && (
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate(`${ROUTES.VOTE}?poll=${poll.id}`)}
                    >
                      Vote
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;