#!/usr/bin/env node

// Simple backend server starter for SC Micro Enterprise System
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main API routes
import apiRoutes from './api/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SC Micro API Server',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SC Micro Enterprise API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      workRequests: '/api/workrequests',
      customers: '/api/customers',
      projects: '/api/projects',
      assistant: '/api/assistant/chat'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SC Micro API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🤖 Assistant: http://localhost:${PORT}/api/assistant/chat`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SC Micro API Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down SC Micro API Server...');
  process.exit(0);
}); 