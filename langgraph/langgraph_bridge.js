#!/usr/bin/env node

/**
 * LangGraph Bridge for SC Micro Assistant
 * Bridges the Python LangGraph agent with the Node.js Express API
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LangGraphBridge {
    constructor() {
        this.pythonProcess = null;
        this.isReady = false;
        this.pendingRequests = new Map();
        this.requestId = 0;
    }

    /**
     * Initialize the Python LangGraph agent
     */
    async initialize() {
        try {
            console.log('🚀 Initializing LangGraph agent...');
            
            // Check if Python is available
            const pythonVersion = await this.checkPythonVersion();
            if (!pythonVersion) {
                throw new Error('Python 3.8+ is required but not found');
            }
            
            // Check if required packages are installed
            const packagesInstalled = await this.checkPackages();
            if (!packagesInstalled) {
                console.log('📦 Installing required Python packages...');
                await this.installPackages();
            }
            
            console.log('✅ LangGraph agent initialized successfully');
            this.isReady = true;
            
        } catch (error) {
            console.error('❌ Failed to initialize LangGraph agent:', error.message);
            this.isReady = false;
        }
    }

    /**
     * Check Python version
     */
    async checkPythonVersion() {
        return new Promise((resolve) => {
            const python = spawn('python3', ['--version']);
            let output = '';
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.on('close', (code) => {
                if (code === 0) {
                    const version = output.trim();
                    console.log(`🐍 Python version: ${version}`);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
            
            python.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Check if required packages are installed
     */
    async checkPackages() {
        return new Promise((resolve) => {
            const python = spawn('python3', ['-c', 'import langgraph, langchain; print("OK")']);
            
            python.on('close', (code) => {
                resolve(code === 0);
            });
            
            python.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Install required Python packages
     */
    async installPackages() {
        return new Promise((resolve, reject) => {
            const pip = spawn('pip3', ['install', '-r', 'requirements.txt']);
            
            pip.stdout.on('data', (data) => {
                console.log(`📦 ${data.toString().trim()}`);
            });
            
            pip.stderr.on('data', (data) => {
                console.error(`❌ ${data.toString().trim()}`);
            });
            
            pip.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Packages installed successfully');
                    resolve();
                } else {
                    reject(new Error('Failed to install packages'));
                }
            });
        });
    }

    /**
     * Process a chat message using the LangGraph agent
     */
    async processMessage(message, currentPage = '/', userRole = 'operator') {
        if (!this.isReady) {
            // Fallback to mock response if LangGraph is not available
            return this.getMockResponse(message);
        }

        return new Promise(async (resolve, reject) => {
            const requestId = ++this.requestId;
            
            // Create a temporary Python script for this request
            const tempScript = await this.createTempScript(message, currentPage, userRole, requestId);
            
            const python = spawn('python3', [tempScript]);
            let output = '';
            let error = '';
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            python.on('close', (code) => {
                // Clean up temp script
                try {
                    import('fs').then(fs => fs.unlinkSync(tempScript));
                } catch (e) {
                    // Ignore cleanup errors
                }
                
                if (code === 0 && output.trim()) {
                    try {
                        const response = JSON.parse(output.trim());
                        resolve(response);
                    } catch (e) {
                        console.error('Failed to parse LangGraph response:', e);
                        resolve(this.getMockResponse(message));
                    }
                } else {
                    console.error('LangGraph agent error:', error);
                    resolve(this.getMockResponse(message));
                }
            });
            
            python.on('error', (err) => {
                console.error('Failed to spawn Python process:', err);
                resolve(this.getMockResponse(message));
            });
        });
    }

    /**
     * Create a temporary Python script for processing a single request
     */
    async createTempScript(message, currentPage, userRole, requestId) {
        const fs = await import('fs');
        const tempScript = `temp_agent_${requestId}.py`;
        
        const scriptContent = `
#!/usr/bin/env python3
import sys
import json
import asyncio
import os

# Add current directory to Python path
sys.path.append('${__dirname}')

try:
    from langgraph_agent import run_agent
    
    async def main():
        response = await run_agent(
            message="${message.replace(/"/g, '\\"')}",
            current_page="${currentPage}",
            user_role="${userRole}"
        )
        print(json.dumps(response))
    
    asyncio.run(main())
    
except Exception as e:
    print(json.dumps({
        "response_message": f"Error: {str(e)}",
        "suggested_actions": [],
        "follow_up_questions": [],
        "intent": "",
        "context": {}
    }))
`;
        
        fs.writeFileSync(tempScript, scriptContent);
        return tempScript;
    }

    /**
     * Get a mock response when LangGraph is not available
     */
    getMockResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview')) {
            return {
                response_message: `📊 **Dashboard Overview** (Mock Response)

• Total Work Requests: 5
• Pending Requests: 2
• Completion Rate: 85.0%
• Average Project Time: 45 days
• Total Revenue: $125,000

🚨 **Attention Needed**: You have 2 pending work requests that require your attention.

*Note: This is a mock response. LangGraph agent is not available.*`,
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
        }
        
        return {
            response_message: `I understand your request: "${message}". 

*Note: This is a mock response. LangGraph agent is not available. To enable full AI capabilities, please set up the Python environment with LangGraph dependencies.*`,
            suggested_actions: [
                { action: 'View Dashboard', description: 'See current metrics', route: '/' },
                { action: 'Create Work Request', description: 'Add new request', route: '/add-work-request' },
                { action: 'View Customers', description: 'Customer overview', route: '/customers' }
            ],
            follow_up_questions: [
                'How do I set up the LangGraph agent?',
                'Show me the dashboard overview',
                'Help me create a work request'
            ],
            intent: 'general',
            context: {}
        };
    }

    /**
     * Test the LangGraph agent
     */
    async test() {
        console.log('🧪 Testing LangGraph agent...');
        
        const testMessages = [
            'Show me the dashboard overview',
            'Create a new work request for TechCorp',
            'What customers do we have?',
            'Help me with project tracking'
        ];
        
        for (const message of testMessages) {
            console.log(`\nTesting: "${message}"`);
            const response = await this.processMessage(message);
            console.log(`Response: ${response.response_message.substring(0, 100)}...`);
            console.log(`Intent: ${response.intent}`);
            console.log(`Actions: ${response.suggested_actions.length}`);
        }
        
        console.log('\n✅ LangGraph agent test completed');
    }
}

// Export the bridge
export default LangGraphBridge;

// Test the bridge if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const bridge = new LangGraphBridge();
    bridge.initialize().then(() => {
        bridge.test();
    });
} 