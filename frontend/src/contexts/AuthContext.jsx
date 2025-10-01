import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.js';
import { webSocketService } from '../services/websocket.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          setUser(userData);
          setIsAuthenticated(true);
          webSocketService.connect();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        webSocketService.connect();
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    webSocketService.disconnect();
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const getUserInfo = () => {
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'USER'
    } : null;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    if (user.role === 'ADMIN') return true;
    
    const permissions = {
      'create_poll': user.role === 'ADMIN',
      'manage_polls': user.role === 'ADMIN',
      'delete_poll': user.role === 'ADMIN',
      'edit_poll': user.role === 'ADMIN',
      'view_all_polls': user.role === 'ADMIN',
      'vote': true,
      'view_results': true
    };
    
    return permissions[permission] || false;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    isAdmin,
    getUserInfo,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};