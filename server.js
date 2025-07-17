#!/usr/bin/env node

// Load environment variables from .env file
try {
    import('dotenv/config');
} catch (error) {
    console.log('dotenv not installed, continuing without .env loading');
}

import app from './api/index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 SC Micro API Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🤖 Assistant chat at http://localhost:${PORT}/api/assistant/chat`);
  console.log(`📊 Test endpoint at http://localhost:${PORT}/api/test`);
}); 