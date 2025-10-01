import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vote from './pages/Vote.jsx';
import Results from './pages/Results.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import ManagePolls from './pages/ManagePolls.jsx';
import EditPoll from './pages/EditPoll.jsx';
import { ROUTES } from './utils/constants.js';
import './styles/polls.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.LOGIN} element={<LoginForm />} />
          <Route path={ROUTES.REGISTER} element={<RegisterForm />} />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                    <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                    <Route path={ROUTES.VOTE} element={<Vote />} />
                    <Route path="/vote/:pollId" element={<Vote />} />
                    <Route path={ROUTES.RESULTS} element={<Results />} />
                    <Route path="/results/:pollId" element={<Results />} />
                    
                    {/* Admin routes */}
                    <Route
                      path={ROUTES.CREATE_POLL}
                      element={
                        <ProtectedRoute requireAdmin>
                          <CreatePoll />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTES.MANAGE_POLLS}
                      element={
                        <ProtectedRoute requireAdmin>
                          <ManagePolls />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-poll/:pollId"
                      element={
                        <ProtectedRoute requireAdmin>
                          <EditPoll />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;