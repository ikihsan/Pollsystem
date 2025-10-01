import { apiService } from './api.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('pollToken');
    this.user = null;
    this.initializeUser();
  }

  async initializeUser() {
    if (this.token) {
      try {
        this.user = this.parseJWT(this.token);
      } catch (error) {
        console.error('Error parsing JWT:', error);
        this.logout();
      }
    }
  }

  parseJWT(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role || 'USER'
      };
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  async login(credentials) {
    try {
      const response = await apiService.login(credentials);
      const token = response.data.token || response.data.access_token;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      this.token = token;
      this.user = this.parseJWT(token);
      localStorage.setItem('pollToken', token);
      
      return { success: true, user: this.user };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  }

  async register(userData) {
    try {
      const response = await apiService.register(userData);
      return { success: true, message: response.data.message || 'Registration successful' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('pollToken');
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  isAdmin() {
    return this.user?.role === 'ADMIN';
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }
}

export const authService = new AuthService();
export default authService;