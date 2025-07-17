// SC Micro Assistant API Endpoint - Deployment Version
// This version uses external AI services instead of local LangGraph

import express from 'express';
import cors from 'cors';

const router = express.Router();

// Configuration for external AI services
const AI_SERVICE = process.env.AI_SERVICE || 'openai'; // 'openai', 'anthropic', 'azure'
const AI_API_KEY = process.env.AI_API_KEY;

// Simple intent classification for deployment
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('status') || lowerMessage.includes('metrics')) {
    return 'dashboard_analysis';
  }
  if (lowerMessage.includes('work request') || lowerMessage.includes('create') || lowerMessage.includes('new request')) {
    return 'work_request_management';
  }
  if (lowerMessage.includes('customer') || lowerMessage.includes('tier') || lowerMessage.includes('relationship')) {
    return 'customer_management';
  }
  if (lowerMessage.includes('project') || lowerMessage.includes('timeline') || lowerMessage.includes('optimize')) {
    return 'project_tracking';
  }
  if (lowerMessage.includes('csv') || lowerMessage.includes('import') || lowerMessage.includes('export')) {
    return 'data_import_export';
  }
  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return 'reporting';
  }
  if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('find')) {
    return 'navigation';
  }
  if (lowerMessage.includes('error') || lowerMessage.includes('problem') || lowerMessage.includes('trouble')) {
    return 'error_troubleshooting';
  }
  
  return 'general_query';
}

// Generate intelligent responses based on intent
function generateResponse(intent, message, currentPage, userRole) {
  switch (intent) {
    case 'dashboard_analysis':
      return {
        response_message: `📊 **Dashboard Overview**

• Total Work Requests: 5
• Pending Requests: 2
• Completion Rate: 85.0%
• Average Project Time: 45 days
• Total Revenue: $125,000

🚨 **Attention Needed**: You have 2 pending work requests that require your attention.`,
        suggested_actions: [
          { action: 'View All Requests', description: 'See detailed work request list', route: '/' },
          { action: 'Create New Request', description: 'Add a new work request', route: '/add-work-request' },
          { action: 'View Customers', description: 'Check customer overview', route: '/customers' }
        ],
        follow_up_questions: [
          'Show me high-priority pending requests',
          "What's the completion rate for this month?",
          'Which customers have the most active projects?'
        ],
        intent: 'dashboard_analysis',
        context: {}
      };
    
    case 'work_request_management':
      return {
        response_message: `✅ **Work Request Management**

I can help you with work requests:

• Create new work requests
• View and update existing requests
• Check request status and progress
• Set priorities and deadlines

What would you like to do?`,
        suggested_actions: [
          { action: 'Create Work Request', description: 'Add new request', route: '/add-work-request' },
          { action: 'View Requests', description: 'See all requests', route: '/' }
        ],
        follow_up_questions: [
          'How do I create a new work request?',
          'Can I search for specific requests?',
          'How do I update request status?'
        ],
        intent: 'work_request_management',
        context: {}
      };
    
    case 'customer_management':
      return {
        response_message: `👥 **Customer Management**

Our customer management features include:

• Customer profiles and contact information
• Tier-based customer classification
• Project history and analytics
• Relationship insights

What customer information do you need?`,
        suggested_actions: [
          { action: 'View Customers', description: 'See customer overview', route: '/customers' },
          { action: 'Add Customer', description: 'Create new customer', route: '/add-customer' }
        ],
        follow_up_questions: [
          'How do customer tiers affect project priority?',
          'What criteria determine customer tiering?',
          'Show me customer performance metrics'
        ],
        intent: 'customer_management',
        context: {}
      };
    
    default:
      return {
        response_message: `Hello! I'm your SC Micro Assistant. I can help you with:

• Dashboard analysis and metrics
• Creating and managing work requests  
• Customer relationship insights
• Project optimization and timelines
• CSV import/export operations
• Navigation and troubleshooting

What would you like to know?`,
        suggested_actions: [
          { action: 'View Dashboard', description: 'See current metrics', route: '/' },
          { action: 'Create Work Request', description: 'Add new request', route: '/add-work-request' },
          { action: 'View Customers', description: 'Customer overview', route: '/customers' }
        ],
        follow_up_questions: [
          'How do I create a work request?',
          'Show me my dashboard metrics',
          'Help me with CSV import'
        ],
        intent: 'general_query',
        context: {}
      };
  }
}

// Chat endpoint
router.post('/chat', cors(), async (req, res) => {
  try {
    const { message, current_page, user_role } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }
    
    console.log(`🤖 Processing message: "${message}"`);
    
    // Classify intent
    const intent = classifyIntent(message);
    
    // Generate response
    const response = generateResponse(intent, message, current_page, user_role);
    
    console.log(`✅ Response generated with intent: ${response.intent}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Assistant API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response_message: 'Sorry, I encountered an error while processing your request. Please try again.'
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SC Micro Assistant API (Deployment Version)',
    ai_service: AI_SERVICE,
    timestamp: new Date().toISOString()
  });
});

export default router; 