#!/usr/bin/env node

// Simple test script to verify the API server is working
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🧪 Testing SC Micro API Server...\n');

  const endpoints = [
    '/api/test',
    '/api/workrequests',
    '/api/customers',
    '/api/projects',
    '/api/assistant/health'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  // Test assistant chat endpoint
  try {
    console.log('Testing /api/assistant/chat...');
    const response = await axios.post(`${BASE_URL}/api/assistant/chat`, {
      message: 'Hello, how are you?',
      current_page: '/',
      user_role: 'operator'
    }, { timeout: 5000 });
    console.log(`✅ /api/assistant/chat - Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
  } catch (error) {
    console.log(`❌ /api/assistant/chat - Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }

  console.log('\n🎉 Test completed!');
}

// Run the test
testEndpoints().catch(console.error); 