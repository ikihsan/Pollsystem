import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000' || 'https://pollsystem-q2tg.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pollToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pollToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),

  // Poll endpoints
  getPolls: () => api.get('/poll'),
  getPoll: (id) => api.get(`/poll/${id}`),
  createPoll: (pollData) => api.post('/poll/create', pollData),
  editPoll: (id, pollData) => api.patch(`/poll/${id}`, pollData),
  deletePoll: (id) => api.patch(`/poll/delete/${id}`),
  getPollResults: (id) => api.get(`/poll/results/${id}`),
  allowUser: (id, email) => api.post(`/poll/allow/${id}`, { email }),

  // Vote endpoints
  vote: (pollId, optionId) => api.post(`/vote/${pollId}`, { optionId }),
};

export default api;