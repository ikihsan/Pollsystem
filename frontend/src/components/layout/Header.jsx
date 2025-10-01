import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import './Header.css';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActiveRoute = (route) => {
    return location.pathname === route || location.pathname.startsWith(route + '/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to={ROUTES.DASHBOARD} className="logo">
            🗳️ Polling System
          </Link>

          <nav className="nav-buttons">
            <Link 
              to={ROUTES.DASHBOARD} 
              className={`nav-link ${isActiveRoute(ROUTES.DASHBOARD) ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            
            <Link 
              to={ROUTES.VOTE} 
              className={`nav-link ${isActiveRoute(ROUTES.VOTE) ? 'active' : ''}`}
            >
              Vote
            </Link>
            
            <Link 
              to={ROUTES.RESULTS} 
              className={`nav-link ${isActiveRoute(ROUTES.RESULTS) ? 'active' : ''}`}
            >
              Results
            </Link>

            {isAdmin() && (
              <>
                <Link 
                  to={ROUTES.CREATE_POLL} 
                  className={`nav-link admin-link ${isActiveRoute(ROUTES.CREATE_POLL) ? 'active' : ''}`}
                >
                  Create Poll
                </Link>
                
                <Link 
                  to={ROUTES.MANAGE_POLLS} 
                  className={`nav-link admin-link ${isActiveRoute(ROUTES.MANAGE_POLLS) ? 'active' : ''}`}
                >
                  Manage Polls
                </Link>
              </>
            )}

            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className="user-role">({user?.role})</span>
            </div>

            <Button variant="danger" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;