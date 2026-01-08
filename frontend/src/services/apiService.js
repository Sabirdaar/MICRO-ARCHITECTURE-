import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User service API calls
export const userService = {
  // Register with email/password
  register: async (userData) => {
    const response = await apiClient.post('/api/users/register', userData);
    return response.data;
  },

  // Login with email/password
  login: async (credentials) => {
    const response = await apiClient.post('/api/users/login', credentials);
    return response.data;
  },

  // Google authentication
  googleAuth: async (idToken, email, firstName, lastName) => {
    const response = await apiClient.post('/api/users/google-auth', { idToken, email, firstName, lastName });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get("/api/users/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (updates) => {
    const response = await apiClient.put('/api/users/profile', updates);
    return response.data;
  },
};