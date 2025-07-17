// SC Micro Assistant API Endpoint
// This file handles chat requests and integrates with the LangGraph agent

import express from 'express';
import cors from 'cors';
import LangGraphBridge from '../langgraph/langgraph_bridge.js';

const router = express.Router();

// Initialize LangGraph bridge
const langGraphBridge = new LangGraphBridge();

// TODO: For deployment, consider replacing LangGraph with:
// - OpenAI API directly
// - Anthropic Claude API
// - Azure OpenAI
// - Google Vertex AI
// This would eliminate Python dependencies and work in serverless environments

// Mock data for demonstration (replace with actual LangGraph agent integration)
const MOCK_WORK_REQUESTS = [
  {
    id: "1",
    customer: "TechCorp",
    project_type: "wirebond",
    status: "in-progress",
    priority: "high",
    description: "High-frequency wirebond assembly",
    created_date: "2024-01-15",
    target_date: "2024-02-15"
  },
  {
    id: "2", 
    customer: "MicroTech",
    project_type: "die_attach",
    status: "pending",
    priority: "medium",
    description: "Die attach for sensor package",
    created_date: "2024-01-20",
    target_date: "2024-03-01"
  }
];

const MOCK_CUSTOMERS = [
  {
    id: "1",
    name: "TechCorp",
    tier: "Premium",
    total_projects: 15,
    completion_rate: 0.95,
    total_value: 250000
  },
  {
    id: "2",
    name: "MicroTech", 
    tier: "Gold",
    total_projects: 8,
    completion_rate: 0.88,
    total_value: 120000
  }
];

// Simple intent classification function
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
  
  return 'dashboard_analysis'; // default
}

// Generate response based on intent
function generateResponse(intent, message, currentPage, userRole) {
  switch (intent) {
    case 'dashboard_analysis':
      return generateDashboardResponse(message);
    case 'work_request_management':
      return generateWorkRequestResponse(message);
    case 'customer_management':
      return generateCustomerResponse(message);
    case 'project_tracking':
      return generateProjectResponse(message);
    case 'data_import_export':
      return generateDataResponse(message);
    case 'reporting':
      return generateReportResponse(message);
    case 'navigation':
      return generateNavigationResponse(message);
    case 'error_troubleshooting':
      return generateTroubleshootingResponse(message);
    default:
      return generateDefaultResponse(message);
  }
}

function generateDashboardResponse(message) {
  const totalRequests = MOCK_WORK_REQUESTS.length;
  const pendingRequests = MOCK_WORK_REQUESTS.filter(wr => wr.status === 'pending').length;
  const completionRate = 0.85;
  
  let response = `📊 **Dashboard Overview**
  
• Total Work Requests: ${totalRequests}
• Pending Requests: ${pendingRequests}
• Completion Rate: ${(completionRate * 100).toFixed(1)}%
• Average Project Time: 45 days

`;

  if (pendingRequests > 0) {
    response += `🚨 **Attention Needed**: You have ${pendingRequests} pending work requests that require your attention.`;
  }

  return {
    response_message: response,
    suggested_actions: [
      { action: 'View All Requests', description: 'See detailed work request list', route: '/' },
      { action: 'Create New Request', description: 'Add a new work request', route: '/add-work-request' },
      { action: 'View Customers', description: 'Check customer overview', route: '/customers' }
    ],
    follow_up_questions: [
      'Show me high-priority pending requests',
      'What\'s the completion rate for this month?',
      'Which customers have the most active projects?'
    ]
  };
}

function generateWorkRequestResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('create') || lowerMessage.includes('new')) {
    return {
      response_message: `✅ **Creating Work Request**
      
I can help you create a new work request. Here's what you'll need:

• **Customer**: Select from existing customers or create new
• **Project Type**: wirebond, die attach, flip chip, or encapsulation
• **Description**: Detailed project requirements
• **Priority**: low, medium, high, or urgent
• **Target Date**: Expected completion date

Would you like me to guide you through the process?`,
      suggested_actions: [
        { action: 'Go to Work Request Form', description: 'Create new work request', route: '/add-work-request' },
        { action: 'View Existing Requests', description: 'See current work requests', route: '/' }
      ],
      follow_up_questions: [
        'What information do I need to create a work request?',
        'How do I set the priority level?',
        'Can I create multiple requests at once?'
      ]
    };
  }
  
  if (lowerMessage.includes('pending') || lowerMessage.includes('status')) {
    const pendingRequests = MOCK_WORK_REQUESTS.filter(wr => wr.status === 'pending');
    
    return {
      response_message: `📋 **Pending Work Requests** (${pendingRequests.length})

${pendingRequests.map(wr => 
  `• **${wr.customer}** - ${wr.project_type} (${wr.priority} priority)
   Due: ${wr.target_date}`
).join('\n\n')}

Would you like to update any of these requests?`,
      suggested_actions: [
        { action: 'View All Requests', description: 'See complete list', route: '/' },
        { action: 'Create New Request', description: 'Add another request', route: '/add-work-request' }
      ],
      follow_up_questions: [
        'How do I update a work request status?',
        'Which requests are overdue?',
        'Show me high-priority requests only'
      ]
    };
  }
  
  return {
    response_message: `I can help you with work request management. You can:

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
    ]
  };
}

function generateCustomerResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('tier') || lowerMessage.includes('premium') || lowerMessage.includes('gold')) {
    return {
      response_message: `🏆 **Customer Tiers**

Our customers are categorized into tiers based on project value and completion rates:

• **Premium**: High-value customers with excellent track record
• **Gold**: Regular customers with good performance
• **Silver**: Developing relationships with potential
• **Bronze**: New or occasional customers

**Current Tier Distribution:**
• Premium: 1 customer (TechCorp)
• Gold: 1 customer (MicroTech)
• Silver: 0 customers
• Bronze: 0 customers

Would you like to see detailed customer analytics?`,
      suggested_actions: [
        { action: 'View Customers', description: 'See customer overview', route: '/customers' },
        { action: 'Add Customer', description: 'Create new customer', route: '/add-customer' }
      ],
      follow_up_questions: [
        'How do customer tiers affect project priority?',
        'What criteria determine customer tiering?',
        'Show me customer performance metrics'
      ]
    };
  }
  
  return {
    response_message: `👥 **Customer Management**

I can help you with customer relationships and insights:

• View customer profiles and history
• Check customer tier assignments
• Analyze customer performance
• Manage customer contacts

**Current Customers:**
• TechCorp (Premium) - 15 projects, 95% completion rate
• MicroTech (Gold) - 8 projects, 88% completion rate

What would you like to know about your customers?`,
    suggested_actions: [
      { action: 'View Customers', description: 'Customer overview', route: '/customers' },
      { action: 'Add Customer', description: 'Create new customer', route: '/add-customer' }
    ],
    follow_up_questions: [
      'How are customers tiered?',
      'Which customers have the most projects?',
      'Show me customer relationship insights'
    ]
  };
}

function generateProjectResponse(message) {
  return {
    response_message: `📈 **Project Tracking & Optimization**

I can help you optimize your projects and resource allocation:

• **Timeline Optimization**: Suggest optimal project schedules
• **Resource Allocation**: Recommend team and equipment assignments
• **Risk Assessment**: Identify potential project risks
• **Performance Analysis**: Track project completion rates

**Current Project Types:**
• Wirebond: 8 projects
• Die Attach: 5 projects  
• Flip Chip: 2 projects
• Encapsulation: 1 project

Would you like me to analyze a specific project or provide optimization recommendations?`,
    suggested_actions: [
      { action: 'Add Project', description: 'Create new project', route: '/add-project' },
      { action: 'View Dashboard', description: 'See project overview', route: '/' }
    ],
    follow_up_questions: [
      'How do I optimize project timelines?',
      'What resources do I need for wirebond projects?',
      'Show me project risk assessment'
    ]
  };
}

function generateDataResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('csv') || lowerMessage.includes('import')) {
    return {
      response_message: `📁 **CSV Import/Export**

I can help you with data operations:

**CSV Import:**
• Upload work request data in bulk
• Automatic validation and error checking
• Field mapping suggestions
• Preview before import

**CSV Export:**
• Export work requests by date range
• Filter by customer, status, or project type
• Multiple format options (CSV, Excel)

**Template Download:**
• Pre-formatted CSV templates
• Field descriptions and examples
• Required vs optional fields

Would you like to import or export data?`,
      suggested_actions: [
        { action: 'CSV Upload', description: 'Import data', route: '/csv-upload' },
        { action: 'Download Template', description: 'Get CSV template', route: '/api/csv/template' }
      ],
      follow_up_questions: [
        'What format should my CSV file be in?',
        'How do I handle import errors?',
        'Can I export filtered data?'
      ]
    };
  }
  
  return {
    response_message: `📊 **Data Management**

I can help you with various data operations:

• **CSV Import**: Bulk upload work requests and customer data
• **CSV Export**: Download filtered data for analysis
• **Data Validation**: Check data integrity before import
• **Template Generation**: Create formatted templates

What type of data operation do you need?`,
    suggested_actions: [
      { action: 'CSV Upload', description: 'Import data', route: '/csv-upload' },
      { action: 'Export Data', description: 'Download data', route: '/' }
    ],
    follow_up_questions: [
      'How do I import CSV files?',
      'What data can I export?',
      'How do I validate my data?'
    ]
  };
}

function generateReportResponse(message) {
  return {
    response_message: `📊 **Reports & Analytics**

I can generate various reports for you:

**Performance Reports:**
• Work request completion rates
• Project timeline analysis
• Resource utilization metrics

**Financial Reports:**
• Revenue by customer
• Project cost analysis
• Budget vs actual tracking

**Customer Reports:**
• Customer tier distribution
• Relationship health scores
• Project history analysis

**Operational Reports:**
• Equipment utilization
• Team performance metrics
• Quality metrics

What type of report would you like to generate?`,
    suggested_actions: [
      { action: 'View Dashboard', description: 'See current metrics', route: '/' },
      { action: 'Export Data', description: 'Download for analysis', route: '/' }
    ],
    follow_up_questions: [
      'How do I generate a performance report?',
      'Can I schedule automated reports?',
      'Show me financial analytics'
    ]
  };
}

function generateNavigationResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('csv') || lowerMessage.includes('upload')) {
    return {
      response_message: `📍 **Navigation to CSV Upload**

To access the CSV upload feature:

1. Click on "CSV Upload" in the main navigation
2. Or use the direct link: /csv-upload

**CSV Upload Features:**
• Drag and drop file upload
• Real-time validation
• Error highlighting
• Import preview
• Template download

Would you like me to guide you through the upload process?`,
      suggested_actions: [
        { action: 'Go to CSV Upload', description: 'Navigate to upload page', route: '/csv-upload' },
        { action: 'Download Template', description: 'Get CSV template', route: '/api/csv/template' }
      ],
      follow_up_questions: [
        'What format should my CSV be in?',
        'How do I handle upload errors?',
        'Can I preview data before importing?'
      ]
    };
  }
  
  return {
    response_message: `🧭 **Navigation Help**

Here are the main sections of the SC Micro system:

**Main Pages:**
• **Dashboard** (/): Overview and metrics
• **Customers** (/customers): Customer management
• **Work Requests** (/add-work-request): Create new requests
• **CSV Upload** (/csv-upload): Import/export data

**Quick Actions:**
• Use the navigation menu at the top
• Click the "+" buttons for quick creation
• Use keyboard shortcuts (Ctrl+N for new request)

Where would you like to go?`,
    suggested_actions: [
      { action: 'Go to Dashboard', description: 'Main overview', route: '/' },
      { action: 'View Customers', description: 'Customer management', route: '/customers' },
      { action: 'Create Work Request', description: 'Add new request', route: '/add-work-request' }
    ],
    follow_up_questions: [
      'How do I get to the customer page?',
      'Where can I find the CSV upload?',
      'What are the keyboard shortcuts?'
    ]
  };
}

function generateTroubleshootingResponse(message) {
  return {
    response_message: `🔧 **Error Troubleshooting**

I can help you resolve common issues:

**Common Problems & Solutions:**

**CSV Import Errors:**
• Check file format (must be CSV)
• Verify required columns are present
• Ensure date format is YYYY-MM-DD
• Check for missing required fields

**Work Request Issues:**
• Verify customer exists before creating request
• Check that all required fields are filled
• Ensure target date is in the future

**Navigation Problems:**
• Try refreshing the page
• Clear browser cache
• Check internet connection

What specific error are you encountering?`,
    suggested_actions: [
      { action: 'View Dashboard', description: 'Check system status', route: '/' },
      { action: 'CSV Upload', description: 'Try import again', route: '/csv-upload' }
    ],
    follow_up_questions: [
      'How do I fix CSV import errors?',
      'What if I can\'t save a work request?',
      'Why can\'t I access certain pages?'
    ]
  };
}

function generateDefaultResponse(message) {
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
    ]
  };
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
    
    // Initialize LangGraph bridge if not already done
    if (!langGraphBridge.isReady) {
      await langGraphBridge.initialize();
    }
    
    // Process message using LangGraph agent
    const response = await langGraphBridge.processMessage(message, current_page, user_role);
    
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
  try {
    // Initialize LangGraph bridge if not already done
    if (!langGraphBridge.isReady) {
      await langGraphBridge.initialize();
    }
    
    res.json({ 
      status: 'healthy', 
      service: 'SC Micro Assistant API',
      langgraph_status: langGraphBridge.isReady ? 'ready' : 'not_available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: 'healthy', 
      service: 'SC Micro Assistant API',
      langgraph_status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 