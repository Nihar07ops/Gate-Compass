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
    if (url.includes('/api/dashboard')) return demoApi.getDashboard();
    if (url.includes('/api/analytics')) return demoApi.getAnalytics();
    if (url.includes('/api/predict')) return demoApi.getPredictions();
    return Promise.reject(new Error('Demo API endpoint not implemented'));
  },
  post: (url, data) => {
    if (url.includes('/api/generate-test')) return demoApi.generateTest(data);
    if (url.includes('/api/submit-test')) return demoApi.submitTest(data.testId, data.answers);
    return Promise.reject(new Error('Demo API endpoint not implemented'));
  }
};

export default DEMO_MODE ? demoApiWrapper : api;
