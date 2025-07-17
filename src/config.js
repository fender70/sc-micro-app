// Configuration for API endpoints
const config = {
  // Development - local backend
  development: {
    apiBaseUrl: 'http://localhost:3001'
  },
  // Production - deployed backend
  production: {
    apiBaseUrl: process.env.REACT_APP_API_URL || 'https://your-app-name-production.up.railway.app'
  }
};

// Debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Using API Base URL:', config[process.env.NODE_ENV || 'development'].apiBaseUrl);

// Get current environment
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.apiBaseUrl;

// API endpoints
export const API_ENDPOINTS = {
  customers: `${API_BASE_URL}/api/customers`,
  workRequests: `${API_BASE_URL}/api/workrequests`,
  projects: `${API_BASE_URL}/api/projects`,
  assistant: `${API_BASE_URL}/api/assistant/chat`,
  csvUpload: `${API_BASE_URL}/api/csv/upload`,
  csvTemplate: `${API_BASE_URL}/api/csv/template`
}; 