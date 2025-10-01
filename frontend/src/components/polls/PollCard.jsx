import React from 'react';
import Button from '../common/Button.jsx';
import { formatDate, isPollExpired, getRemainingTime } from '../../utils/helpers.js';
import './PollCard.css';

const PollCard = ({ 
  poll, 
  onVote, 
  onViewResults, 
  onEdit, 
  onDelete, 
  onManageAccess,
  showActions = true,
  isAdmin = false 
}) => {
  const expired = isPollExpired(poll.expiresAt);

  return (
    <div className="poll-card">
      <div className="poll-header">
        <h3 className="poll-title">{poll.title}</h3>
        <div className="poll-status">
          <span className={`status-badge ${poll.isPublic ? 'public' : 'private'}`}>
            {poll.isPublic ? 'Public' : 'Private'}
          </span>
          <span className={`status-badge ${expired ? 'expired' : 'active'}`}>
            {expired ? 'Expired' : 'Active'}
          </span>
        </div>
      </div>

      {poll.description && (
        <p className="poll-description">{poll.description}</p>
      )}

      <div className="poll-meta">
        <div className="meta-item">
          <strong>Created:</strong> {formatDate(poll.createdAt)}
        </div>
        <div className="meta-item">
          <strong>Status:</strong> {expired ? 'Expired' : getRemainingTime(poll.expiresAt)}
        </div>
        {poll.options && (
          <div className="meta-item">
            <strong>Options:</strong> {poll.options.length}
          </div>
        )}
      </div>

      {showActions && (
        <div className="poll-actions">
          {!expired && onVote && (
            <Button 
              variant="primary" 
              size="small"
              onClick={() => onVote(poll.id)}
            >
              Vote
            </Button>
          )}
          
          {onViewResults && (
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => onViewResults(poll.id)}
            >
              View Results
            </Button>
          )}

          {isAdmin && (
            <>
              {onEdit && (
                <Button 
                  variant="success" 
                  size="small"
                  onClick={() => onEdit(poll.id)}
                >
                  Edit
                </Button>
              )}
              
              {!poll.isPublic && onManageAccess && (
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => onManageAccess(poll.id)}
                >
                  Manage Access
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => onDelete(poll.id)}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PollCard;