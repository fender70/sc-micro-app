// Configuration for API endpoints
const config = {
  // Development - local backend
  development: {
    apiBaseUrl: 'http://localhost:3001'
  },
  // Production - deployed backend
  production: {
    apiBaseUrl: process.env.REACT_APP_API_URL || 'https://sc-micro-app-production.up.railway.app'
  }
};

// Debug logging
console.log('=== CONFIG DEBUG ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('REACT_APP')));
console.log('Using API Base URL:', config[process.env.NODE_ENV || 'development'].apiBaseUrl);
console.log('===================');

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