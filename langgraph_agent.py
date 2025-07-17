#!/usr/bin/env python3
"""
SC Micro LangGraph Agent Implementation
A comprehensive agent for enterprise work request management, customer relationship tracking, and project analytics.
"""

import os
import json
import asyncio
from typing import Dict, List, Any, TypedDict, Annotated
from datetime import datetime, timedelta
import logging
import re
import requests

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, continue without it

# LangGraph and LangChain imports
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from langchain_core.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# State definition for the agent
class AgentState(TypedDict):
    messages: Annotated[List, "The messages in the conversation"]
    current_page: Annotated[str, "Current page the user is on"]
    user_role: Annotated[str, "User's role in the system"]
    intent: Annotated[str, "Detected intent from user message"]
    context: Annotated[Dict, "Additional context and data"]
    response: Annotated[Dict, "Final response to user"]
    suggested_actions: Annotated[List, "Suggested actions for user"]
    follow_up_questions: Annotated[List, "Follow-up questions to ask"]

# Initialize LLM (supports multiple providers)
def get_llm():
    """Initialize LLM based on environment configuration"""
    logger.info("Checking LLM configuration...")
    
    # Try OpenAI first
    if os.getenv("OPENAI_API_KEY"):
        logger.info("Using OpenAI LLM")
        return ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.1,
            max_tokens=2000
        )
    # Try Anthropic Claude
    elif os.getenv("ANTHROPIC_API_KEY"):
        logger.info("Using Anthropic LLM")
        return ChatAnthropic(
            model="claude-3-sonnet-20240229",
            temperature=0.1,
            max_tokens=2000
        )
    # Fallback to local Ollama
    else:
        logger.info("No API keys found, trying Ollama...")
        try:
            from langchain_community.llms import Ollama
            llm = Ollama(model="llama2", temperature=0.1)
            logger.info("Ollama LLM initialized successfully")
            return llm
        except Exception as e:
            logger.warning(f"No LLM configured. Using template responses. Error: {e}")
            return None

# Tools for the agent
@tool
def get_work_requests() -> str:
    """Get all work requests from the system"""
    try:
        response = requests.get('http://localhost:3001/api/database/work-requests', timeout=5)
        if response.status_code == 200:
            work_requests = response.json()
            return json.dumps(work_requests, indent=2)
        else:
            logger.error(f"Failed to fetch work requests: {response.status_code}")
            return json.dumps([], indent=2)
    except Exception as e:
        logger.error(f"Error fetching work requests: {e}")
        return json.dumps([], indent=2)

@tool
def get_customers() -> str:
    """Get all customers from the system"""
    try:
        response = requests.get('http://localhost:3001/api/database/customers', timeout=5)
        if response.status_code == 200:
            customers = response.json()
            return json.dumps(customers, indent=2)
        else:
            logger.error(f"Failed to fetch customers: {response.status_code}")
            return json.dumps([], indent=2)
    except Exception as e:
        logger.error(f"Error fetching customers: {e}")
        return json.dumps([], indent=2)

@tool
def get_projects() -> str:
    """Get all projects from the system"""
    try:
        response = requests.get('http://localhost:3001/api/database/projects', timeout=5)
        if response.status_code == 200:
            projects = response.json()
            return json.dumps(projects, indent=2)
        else:
            logger.error(f"Failed to fetch projects: {response.status_code}")
            return json.dumps([], indent=2)
    except Exception as e:
        logger.error(f"Error fetching projects: {e}")
        return json.dumps([], indent=2)

@tool
def get_dashboard_metrics() -> str:
    """Get current dashboard metrics and KPIs"""
    try:
        response = requests.get('http://localhost:3001/api/database/dashboard/metrics', timeout=5)
        if response.status_code == 200:
            metrics = response.json()
            return json.dumps(metrics, indent=2)
        else:
            logger.error(f"Failed to fetch dashboard metrics: {response.status_code}")
            # Fallback to mock metrics
            metrics = {
                "total_work_requests": 5,
                "pending_requests": 2,
                "completed_requests": 3,
                "completion_rate": 0.85,
                "average_project_time": 45,
                "total_revenue": 125000,
                "active_customers": 3,
                "high_priority_items": 1
            }
            return json.dumps(metrics, indent=2)
    except Exception as e:
        logger.error(f"Error fetching dashboard metrics: {e}")
        # Fallback to mock metrics
        metrics = {
            "total_work_requests": 5,
            "pending_requests": 2,
            "completed_requests": 3,
            "completion_rate": 0.85,
            "average_project_time": 45,
            "total_revenue": 125000,
            "active_customers": 3,
            "high_priority_items": 1
        }
        return json.dumps(metrics, indent=2)

@tool
def create_work_request(customer: str, project_type: str, description: str, priority: str, target_date: str) -> str:
    """Create a new work request"""
    try:
        # First, find the customer ID
        customers_response = requests.get('http://localhost:3001/api/database/customers', timeout=5)
        if customers_response.status_code != 200:
            return json.dumps({"success": False, "error": "Failed to fetch customers"}, indent=2)
        
        customers = customers_response.json()
        customer_obj = next((c for c in customers if c['name'].lower() == customer.lower()), None)
        
        if not customer_obj:
            return json.dumps({"success": False, "error": f"Customer '{customer}' not found"}, indent=2)
        
        # Create the work request
        work_request_data = {
            "customer_id": customer_obj['id'],
            "customer_name": customer_obj['name'],
            "project_type": project_type,
            "description": description,
            "priority": priority,
            "target_date": target_date,
            "status": "pending"
        }
        
        response = requests.post('http://localhost:3001/api/database/work-requests', 
                               json=work_request_data, timeout=5)
        
        if response.status_code == 201:
            new_request = response.json()
            return json.dumps({"success": True, "work_request": new_request}, indent=2)
        else:
            return json.dumps({"success": False, "error": f"Failed to create work request: {response.status_code}"}, indent=2)
    except Exception as e:
        logger.error(f"Error creating work request: {e}")
        return json.dumps({"success": False, "error": str(e)}, indent=2)

@tool
def update_work_request(request_id: str, status: str, notes: str = "") -> str:
    """Update an existing work request"""
    try:
        # Get the current work request
        response = requests.get(f'http://localhost:3001/api/database/work-requests/{request_id}', timeout=5)
        if response.status_code != 200:
            return json.dumps({"success": False, "error": "Work request not found"}, indent=2)
        
        current_request = response.json()
        
        # Update the work request
        update_data = {
            **current_request,
            "status": status,
            "notes": notes
        }
        
        update_response = requests.put(f'http://localhost:3001/api/database/work-requests/{request_id}', 
                                     json=update_data, timeout=5)
        
        if update_response.status_code == 200:
            return json.dumps({
                "success": True,
                "message": f"Work request {request_id} updated to status: {status}",
                "updated_at": datetime.now().isoformat()
            }, indent=2)
        else:
            return json.dumps({"success": False, "error": f"Failed to update work request: {update_response.status_code}"}, indent=2)
    except Exception as e:
        logger.error(f"Error updating work request: {e}")
        return json.dumps({"success": False, "error": str(e)}, indent=2)

# Node definitions
def intent_classifier(state: AgentState) -> AgentState:
    """Classify user intent from the message"""
    llm = get_llm()
    if not llm:
        # Fallback to rule-based classification
        message = state["messages"][-1].content.lower()
        # Check for customer queries first (before general queries)
        if any(word in message for word in ["customer", "tier", "relationship", "techcorp", "innovate", "microtech", "about", "tell me about"]):
            intent = "customer_management"
        elif any(word in message for word in ["what is", "how much", "calculate", "+", "-", "*", "/", "math", "number", "answer", "sum", "total", "equals", "?", "please give me a simple answer"]):
            intent = "general_query"
        elif any(word in message for word in ["dashboard", "status", "metrics", "overview"]):
            intent = "dashboard_analysis"
        elif any(word in message for word in ["work request", "create", "new request"]):
            intent = "work_request_management"
        elif any(word in message for word in ["project", "timeline", "optimize"]):
            intent = "project_tracking"
        elif any(word in message for word in ["csv", "import", "export"]):
            intent = "data_import_export"
        elif any(word in message for word in ["report", "analytics"]):
            intent = "reporting"
        elif any(word in message for word in ["navigate", "go to", "find"]):
            intent = "navigation"
        elif any(word in message for word in ["error", "problem", "trouble", "help", "fix"]):
            intent = "error_troubleshooting"
        else:
            intent = "general_query"
    else:
        # Use LLM for intent classification
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an intent classifier for an enterprise management system. \
            Classify the user's intent into one of these categories:\
            - dashboard_analysis: Questions about metrics, status, overview\
            - work_request_management: Creating, updating, or managing work requests\
            - customer_management: Customer-related questions, asking about specific customers (like "TechCorp Industries"), customer tiers, relationships\
            - project_tracking: Project timeline, optimization, tracking\
            - data_import_export: CSV operations, data import/export\
            - reporting: Analytics, reports, insights\
            - navigation: Help with finding pages or features\
            - error_troubleshooting: Problems, errors, issues\
            - general_query: General questions, math, or unrelated queries\
            
            IMPORTANT: If the user asks about a specific company/customer (like "TechCorp Industries", "Innovate Solutions", etc.), classify as customer_management.
            
            Respond with only the intent category."""),
            ("user", "{message}")
        ])
        chain = prompt | llm
        intent = chain.invoke({"message": state["messages"][-1].content}).content.strip()
    state["intent"] = intent
    return state

def context_gatherer(state: AgentState) -> AgentState:
    """Gather relevant context based on intent"""
    context = {}
    
    if state["intent"] in ["dashboard_analysis", "work_request_management"]:
        try:
            context["work_requests"] = json.loads(get_work_requests.invoke(""))
            context["metrics"] = json.loads(get_dashboard_metrics.invoke(""))
        except Exception as e:
            logger.error(f"Error gathering work request context: {e}")
    
    if state["intent"] in ["customer_management", "dashboard_analysis"]:
        try:
            context["customers"] = json.loads(get_customers.invoke(""))
        except Exception as e:
            logger.error(f"Error gathering customer context: {e}")
    
    if state["intent"] in ["project_tracking", "dashboard_analysis"]:
        try:
            context["projects"] = json.loads(get_projects.invoke(""))
        except Exception as e:
            logger.error(f"Error gathering project context: {e}")
    
    state["context"] = context
    return state

def response_generator(state: AgentState) -> AgentState:
    """Generate response based on intent and context"""
    llm = get_llm()
    
    if not llm:
        logger.info("No LLM available, using template response")
        # Fallback to template responses
        response = generate_template_response(state)
    else:
        logger.info("LLM available, using LLM response generation")
        # Use LLM for response generation
        response = generate_llm_response(state, llm)
    
    state["response"] = response
    return state

def generate_template_response(state: AgentState) -> Dict:
    """Generate template-based response when LLM is not available"""
    intent = state["intent"]
    context = state["context"]
    user_message = state["messages"][-1].content.lower()
    
    if intent == "general_query":
        # Handle simple math and general questions
        if "what is 2+2" in user_message or "2+2" in user_message:
            return {
                "response_message": """The answer to 2+2 is **4**. 

I'm your SC Micro Assistant, and I can help you with much more than just math! I can assist with:

• Dashboard analysis and metrics
• Creating and managing work requests  
• Customer relationship insights
• Project optimization and timelines
• CSV import/export operations

What would you like to know about your enterprise system?""",
                "suggested_actions": [
                    {"action": "View Dashboard", "description": "See current metrics", "route": "/"},
                    {"action": "Create Work Request", "description": "Add new request", "route": "/add-work-request"},
                    {"action": "View Customers", "description": "Customer overview", "route": "/customers"}
                ],
                "follow_up_questions": [
                    "Show me the dashboard overview",
                    "How do I create a work request?",
                    "What customers do we have?"
                ]
            }
        else:
            return {
                "response_message": f"""I understand you're asking: "{state['messages'][-1].content}"

I'm your SC Micro Assistant, and I'm here to help you with your enterprise management system. I can assist with:

• Dashboard analysis and metrics
• Creating and managing work requests  
• Customer relationship insights
• Project optimization and timelines
• CSV import/export operations

What would you like to know about your system?""",
                "suggested_actions": [
                    {"action": "View Dashboard", "description": "See current metrics", "route": "/"},
                    {"action": "Create Work Request", "description": "Add new request", "route": "/add-work-request"},
                    {"action": "View Customers", "description": "Customer overview", "route": "/customers"}
                ],
                "follow_up_questions": [
                    "Show me the dashboard overview",
                    "How do I create a work request?",
                    "What customers do we have?"
                ]
            }
    
    elif intent == "customer_management":
        customers = context.get("customers", [])
        user_message = state["messages"][-1].content.lower()
        
        # Look for any customer name in the user message
        for customer in customers:
            customer_name = customer.get("name", "").lower()
            # Use a simple substring match or token match for robustness
            if customer_name in user_message or any(token in user_message for token in customer_name.split() if len(token) > 2):
                return {
                    "response_message": f"""🏢 **{customer.get('name', 'Unknown')} Customer Profile**\n\n• **Tier**: {customer.get('tier', 'Unknown')}\n• **Total Projects**: {customer.get('total_projects', 0)}\n• **Completion Rate**: {customer.get('completion_rate', 0) * 100:.1f}%\n• **Total Value**: ${customer.get('total_value', 0):,}\n• **Contact**: {customer.get('contact', 'N/A')}\n• **Email**: {customer.get('email', 'N/A')}\n• **Phone**: {customer.get('phone', 'N/A')}\n• **Address**: {customer.get('address', 'N/A')}\n\n**Customer Status**: {customer.get('name', 'Unknown')} is a {customer.get('tier', 'Unknown')} tier customer with {customer.get('total_projects', 0)} total projects and ${customer.get('total_value', 0):,} in total value.""",
                    "suggested_actions": [
                        {"action": "View All Customers", "description": "See complete customer list", "route": "/customers"},
                        {"action": "Create Work Request", "description": f"Add new request for {customer.get('name', 'Unknown')}", "route": "/add-work-request"},
                        {"action": "View Dashboard", "description": "See overall metrics", "route": "/"}
                    ],
                    "follow_up_questions": [
                        f"What work requests does {customer.get('name', 'Unknown')} have?",
                        f"Show me {customer.get('name', 'Unknown')}'s project history",
                        f"How does {customer.get('name', 'Unknown')} compare to other customers?"
                    ]
                }
        # General customer overview
        return {
            "response_message": f"""🏢 **Customer Management Overview**\n\nYou have {len(customers)} customers in the system:\n\n{chr(10).join([f"• **{c.get('name', 'Unknown')}** - {c.get('tier', 'Unknown')} Tier (${c.get('total_value', 0):,} total value)" for c in customers[:5]])}\n\n**Customer Tiers:**\n• Premium: High-value customers with excellent track record\n• Gold: Regular customers with good performance  \n• Silver: Developing relationships with potential\n• Bronze: New or occasional customers\n\n**Top Customers by Value:**\n{chr(10).join([f"• {c.get('name', 'Unknown')}: ${c.get('total_value', 0):,}" for c in sorted(customers, key=lambda x: x.get('total_value', 0), reverse=True)[:3]])}""",
            "suggested_actions": [
                {"action": "View All Customers", "description": "See complete customer list", "route": "/customers"},
                {"action": "Create Work Request", "description": "Add new request", "route": "/add-work-request"},
                {"action": "View Dashboard", "description": "See overall metrics", "route": "/"}
            ],
            "follow_up_questions": [
                "Tell me about TechCorp Industries",
                "Show me our Premium customers",
                "Which customer has the most projects?"
            ]
        }
    
    elif intent == "dashboard_analysis":
        metrics = context.get("metrics", {})
        return {
            "response_message": f"""📊 **Dashboard Overview**

• Total Work Requests: {metrics.get('total_work_requests', 0)}
• Pending Requests: {metrics.get('pending_requests', 0)}
• Completion Rate: {metrics.get('completion_rate', 0.85) * 100:.1f}%
• Average Project Time: {metrics.get('average_project_time', 45)} days
• Total Revenue: ${metrics.get('total_revenue', 0):,}

🚨 **Attention Needed**: You have {metrics.get('pending_requests', 0)} pending work requests that require your attention.""",
            "suggested_actions": [
                {"action": "View All Requests", "description": "See detailed work request list", "route": "/"},
                {"action": "Create New Request", "description": "Add a new work request", "route": "/add-work-request"},
                {"action": "View Customers", "description": "Check customer overview", "route": "/customers"}
            ],
            "follow_up_questions": [
                "Show me high-priority pending requests",
                "What's the completion rate for this month?",
                "Which customers have the most active projects?"
            ]
        }
    
    # Add more template responses for other intents...
    return {
        "response_message": "I understand your request. Let me help you with that.",
        "suggested_actions": [],
        "follow_up_questions": []
    }

def clean_json_response(text):
    """Remove markdown code block formatting from LLM output."""
    cleaned = re.sub(r"^```json\s*|^```\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)
    return cleaned.strip()

def generate_llm_response(state: AgentState, llm) -> Dict:
    """Generate LLM-based response"""
    intent = state["intent"]
    context = state["context"]
    user_message = state["messages"][-1].content
    # Create system prompt based on intent
    system_prompts = {
        "general_query": """You are a helpful enterprise management assistant for SC Micro. For general questions, provide clear and helpful answers.
        If it's a simple question like math, answer it directly but also briefly mention that you can help with enterprise management.
        IMPORTANT: Only suggest actions and routes that actually exist in the SC Micro system:
        - Available routes: "/", "/customers", "/add-work-request", "/csv-upload"
        - Available actions: "View Dashboard", "View Customers", "Create Work Request", "Upload CSV"
        Do not invent routes or features that don't exist.""",
        
        "dashboard_analysis": """You are an enterprise management assistant for SC Micro. Analyze the dashboard data and provide insights. 
        Be concise, professional, and actionable. Include metrics, trends, and recommendations.
        IMPORTANT: Only suggest actions and routes that actually exist in the SC Micro system:
        - Available routes: "/", "/customers", "/add-work-request", "/csv-upload"
        - Available actions: "View Dashboard", "View Customers", "Create Work Request", "Upload CSV"
        Do not invent routes or features that don't exist.""",
        
        "work_request_management": """You are a work request management assistant for SC Micro. Help users create, update, and manage work requests. 
        Provide clear guidance and actionable steps.
        IMPORTANT: Only suggest actions and routes that actually exist in the SC Micro system:
        - Available routes: "/", "/customers", "/add-work-request", "/csv-upload"
        - Available actions: "View Dashboard", "View Customers", "Create Work Request", "Upload CSV"
        Do not invent routes or features that don't exist.""",
        
        "customer_management": """You are a customer relationship management assistant for SC Micro. Help users understand customer data, 
        relationships, and opportunities. Provide insights and recommendations.
        
        When asked about a specific customer, provide detailed information including:
        - Customer tier and status
        - Total projects and completion rate
        - Total value and contact information
        - Current relationship status and opportunities
        
        IMPORTANT: Only suggest actions and routes that actually exist in the SC Micro system:
        - Available routes: "/", "/customers", "/add-work-request", "/csv-upload"
        - Available actions: "View Dashboard", "View Customers", "Create Work Request", "Upload CSV"
        Do not invent routes or features that don't exist.""",
        
        "project_tracking": """You are a project management assistant for SC Micro. Help users track projects, timelines, and optimization opportunities. 
        Provide clear project insights and recommendations.
        IMPORTANT: Only suggest actions and routes that actually exist in the SC Micro system:
        - Available routes: "/", "/customers", "/add-work-request", "/csv-upload"
        - Available actions: "View Dashboard", "View Customers", "Create Work Request", "Upload CSV"
        Do not invent routes or features that don't exist."""
    }
    system_prompt = system_prompts.get(intent, "You are a helpful enterprise management assistant for SC Micro.")
    # Use a single string template for the prompt
    prompt = ChatPromptTemplate.from_template(
        "{system_prompt}\nCurrent context: {context}\nRespond in JSON format with: response_message, suggested_actions (array of objects with action, description, route), and follow_up_questions (array of strings)\nUser: {message}"
    )
    try:
        chain = prompt | llm
        response = chain.invoke({
            "system_prompt": system_prompt,
            "context": json.dumps(context, indent=2),
            "message": user_message
        })
        # Parse JSON response
        try:
            cleaned_content = clean_json_response(response.content)
            parsed_response = json.loads(cleaned_content)
            return parsed_response
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "response_message": response.content,
                "suggested_actions": [],
                "follow_up_questions": []
            }
    except Exception as e:
        logger.error(f"Error generating LLM response: {e}")
        return generate_template_response(state)

# Create the LangGraph workflow
def create_agent():
    """Create the LangGraph agent workflow"""
    
    # Create the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("intent_classifier", intent_classifier)
    workflow.add_node("context_gatherer", context_gatherer)
    workflow.add_node("response_generator", response_generator)
    
    # Add edges
    workflow.set_entry_point("intent_classifier")
    workflow.add_edge("intent_classifier", "context_gatherer")
    workflow.add_edge("context_gatherer", "response_generator")
    workflow.add_edge("response_generator", END)
    
    # Compile the graph
    app = workflow.compile()
    
    return app

# Main function to run the agent
async def run_agent(message: str, current_page: str = "/", user_role: str = "operator") -> Dict:
    """Run the LangGraph agent with a user message"""
    
    # Create the agent
    agent = create_agent()
    
    # Initialize state
    state = {
        "messages": [HumanMessage(content=message)],
        "current_page": current_page,
        "user_role": user_role,
        "intent": "",
        "context": {},
        "response": {},
        "suggested_actions": [],
        "follow_up_questions": []
    }
    
    try:
        # Run the agent
        result = await agent.ainvoke(state)
        
        # Extract the response
        response = result["response"]
        
        return {
            "response_message": response.get("response_message", "I'm sorry, I couldn't process your request."),
            "suggested_actions": response.get("suggested_actions", []),
            "follow_up_questions": response.get("follow_up_questions", []),
            "intent": result.get("intent", ""),
            "context": result.get("context", {})
        }
        
    except Exception as e:
        logger.error(f"Error running agent: {e}")
        return {
            "response_message": "I encountered an error while processing your request. Please try again.",
            "suggested_actions": [],
            "follow_up_questions": [],
            "intent": "",
            "context": {}
        }

# Test function
async def test_agent():
    """Test the agent with sample messages"""
    test_messages = [
        "Show me the dashboard overview",
        "Create a new work request for TechCorp",
        "What customers do we have?",
        "Help me with project tracking"
    ]
    
    print("🧪 Testing LangGraph Agent...\n")
    
    for message in test_messages:
        print(f"User: {message}")
        response = await run_agent(message)
        print(f"Agent: {response['response_message'][:100]}...")
        print(f"Intent: {response['intent']}")
        print(f"Actions: {len(response['suggested_actions'])}")
        print(f"Follow-ups: {len(response['follow_up_questions'])}")
        print("-" * 50)

if __name__ == "__main__":
    # Run test if executed directly
    asyncio.run(test_agent()) 