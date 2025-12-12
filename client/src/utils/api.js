import axios from 'axios';
import { DEMO_MODE } from '../config/demo';
import { demoApi } from './demoApi';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Demo API wrapper
const demoApiWrapper = {
  get: (url) => {
    if (url.includes('/api/auth/me')) {
      return demoApi.getUser ? demoApi.getUser() : Promise.resolve({ data: null });
    }
    if (url.includes('/api/dashboard')) return demoApi.getDashboard();
    if (url.includes('/api/analytics')) return demoApi.getAnalytics();
    if (url.includes('/api/predict')) return demoApi.getPredictions();
    return Promise.reject(new Error('Demo API endpoint not implemented'));
  },
  post: (url, data) => {
    if (url.includes('/api/auth/login')) {
      return demoApi.login ? demoApi.login(data) : Promise.reject(new Error('Demo login not available'));
    }
    if (url.includes('/api/auth/register')) {
      return demoApi.register ? demoApi.register(data) : Promise.reject(new Error('Demo register not available'));
    }
    if (url.includes('/api/generate-test')) return demoApi.generateTest(data);
    if (url.includes('/api/submit-test')) return demoApi.submitTest(data.testId, data.answers);
    return Promise.reject(new Error('Demo API endpoint not implemented'));
  }
};

// Debug logging
console.log('Demo mode status:', DEMO_MODE);
console.log('Environment:', process.env.NODE_ENV);

// Create a hybrid API that can fallback to demo mode
const hybridApi = {
  get: async (url) => {
    if (DEMO_MODE) {
      console.log('Using demo API for GET:', url);
      return demoApiWrapper.get(url);
    }

    try {
      console.log('Trying real API for GET:', url);
      return await api.get(url);
    } catch (error) {
      console.log('Real API failed, falling back to demo for GET:', url);
      return demoApiWrapper.get(url);
    }
  },

  post: async (url, data) => {
    if (DEMO_MODE) {
      console.log('Using demo API for POST:', url);
      return demoApiWrapper.post(url, data);
    }

    try {
      console.log('Trying real API for POST:', url);
      return await api.post(url, data);
    } catch (error) {
      console.log('Real API failed, falling back to demo for POST:', url);
      return demoApiWrapper.post(url, data);
    }
  }
};

export default hybridApi;
