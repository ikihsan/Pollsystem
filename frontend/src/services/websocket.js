import { io } from 'socket.io-client';
import { authService } from './auth.js';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) {
      this.disconnect();
    }

    const token = authService.getToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    try {
      this.socket = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
        this.isConnected = true;
        this.emit('connection', { status: 'connected' });
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        this.isConnected = false;
        this.emit('connection', { status: 'disconnected' });
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.emit('connection', { status: 'error', error });
      });

      // Poll-related events
      this.socket.on('pollCreated', (data) => {
        this.emit('pollCreated', data);
      });

      this.socket.on('pollUpdated', (data) => {
        this.emit('pollUpdated', data);
      });

      this.socket.on('newVote', (data) => {
        this.emit('newVote', data);
      });

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Helper methods
  isConnectedToSocket() {
    return this.isConnected && this.socket?.connected;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;