"""
SC Micro Enterprise Assistant - LangGraph Implementation
A comprehensive AI assistant for the SC Micro Enterprise Management System
"""

import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import pandas as pd

# Mock data for demonstration
MOCK_WORK_REQUESTS = [
    {
        "id": "1",
        "customer": "TechCorp",
        "project_type": "wirebond",
        "status": "in-progress",
        "priority": "high",
        "description": "High-frequency wirebond assembly",
        "created_date": "2024-01-15",
        "target_date": "2024-02-15"
    },
    {
        "id": "2", 
        "customer": "MicroTech",
        "project_type": "die_attach",
        "status": "pending",
        "priority": "medium",
        "description": "Die attach for sensor package",
        "created_date": "2024-01-20",
        "target_date": "2024-03-01"
    }
]

MOCK_CUSTOMERS = [
    {
        "id": "1",
        "name": "TechCorp",
        "tier": "Premium",
        "total_projects": 15,
        "completion_rate": 0.95,
        "total_value": 250000
    },
    {
        "id": "2",
        "name": "MicroTech", 
        "tier": "Gold",
        "total_projects": 8,
        "completion_rate": 0.88,
        "total_value": 120000
    }
]

class SCMicroAssistant:
    """Main assistant class for SC Micro Enterprise Management System"""
    
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(api_key=openai_api_key, temperature=0.1)
        self.graph = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        
        # Define the state schema
        workflow = StateGraph({
            "user_message": str,
            "current_page": str,
            "user_role": str,
            "session_history": List[Dict],
            "work_requests": List[Dict],
            "customers": List[Dict], 
            "projects": List[Dict],
            "node_outputs": Dict,
            "final_response": Dict
        })
        
        # Add nodes
        workflow.add_node("user_input_processor", self._process_user_input)
        workflow.add_node("dashboard_analyzer", self._analyze_dashboard)
        workflow.add_node("work_request_assistant", self._assist_work_requests)
        workflow.add_node("customer_relationship_manager", self._manage_customer_relationships)
        workflow.add_node("project_optimizer", self._optimize_projects)
        workflow.add_node("data_import_export_helper", self._help_data_operations)
        workflow.add_node("report_generator", self._generate_reports)
        workflow.add_node("navigation_helper", self._help_navigation)
        workflow.add_node("error_troubleshooter", self._troubleshoot_errors)
        workflow.add_node("response_generator", self._generate_response)
        
        # Add edges with conditional routing
        workflow.add_conditional_edges(
            "user_input_processor",
            self._route_to_specialist,
            {
                "dashboard_analyzer": "dashboard_analyzer",
                "work_request_assistant": "work_request_assistant", 
                "customer_relationship_manager": "customer_relationship_manager",
                "project_optimizer": "project_optimizer",
                "data_import_export_helper": "data_import_export_helper",
                "report_generator": "report_generator",
                "navigation_helper": "navigation_helper",
                "error_troubleshooter": "error_troubleshooter"
            }
        )
        
        # All specialist nodes route to response generator
        for node in ["dashboard_analyzer", "work_request_assistant", "customer_relationship_manager",
                    "project_optimizer", "data_import_export_helper", "report_generator", 
                    "navigation_helper", "error_troubleshooter"]:
            workflow.add_edge(node, "response_generator")
            
        workflow.add_edge("response_generator", END)
        
        return workflow.compile()
    
    async def _process_user_input(self, state: Dict) -> Dict:
        """Process and categorize user input"""
        user_message = state["user_message"]
        
        # Use LLM to classify intent
        classification_prompt = f"""
        Classify the user's intent from their message: "{user_message}"
        
        Choose from:
        - dashboard_analysis: Questions about dashboard, metrics, overview
        - work_request_management: Creating, updating, searching work requests
        - customer_management: Customer info, relationships, tiering
        - project_tracking: Project planning, optimization, timelines
        - data_import_export: CSV operations, data import/export
        - reporting: Generating reports, analytics
        - navigation: Help with app navigation, finding features
        - error_troubleshooting: Error messages, technical issues
        
        Return only the intent category.
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=classification_prompt)])
        intent = response.content.strip().lower()
        
        # Extract entities
        entities = self._extract_entities(user_message)
        
        return {
            **state,
            "node_outputs": {
                "intent": intent,
                "entities": entities,
                "confidence": 0.9
            }
        }
    
    def _extract_entities(self, message: str) -> Dict:
        """Extract entities from user message"""
        entities = {}
        
        # Simple entity extraction (in production, use NER models)
        if "customer" in message.lower():
            # Extract customer names
            pass
        if "project" in message.lower():
            # Extract project types
            pass
        if "status" in message.lower():
            # Extract status values
            pass
            
        return entities
    
    def _route_to_specialist(self, state: Dict) -> str:
        """Route to appropriate specialist based on intent"""
        intent = state["node_outputs"]["intent"]
        return intent
    
    async def _analyze_dashboard(self, state: Dict) -> Dict:
        """Analyze dashboard data and provide insights"""
        work_requests = MOCK_WORK_REQUESTS
        customers = MOCK_CUSTOMERS
        
        # Calculate metrics
        total_requests = len(work_requests)
        pending_requests = len([wr for wr in work_requests if wr["status"] == "pending"])
        completion_rate = 0.85  # Mock calculation
        
        insights = []
        if pending_requests > 5:
            insights.append({
                "type": "alert",
                "message": f"You have {pending_requests} pending work requests that need attention",
                "severity": "medium",
                "action_needed": True
            })
        
        recommendations = [
            "Review high-priority pending requests",
            "Check customer tier assignments for new projects"
        ]
        
        return {
            **state,
            "node_outputs": {
                "insights": insights,
                "recommendations": recommendations,
                "metrics_summary": {
                    "total_requests": total_requests,
                    "pending_requests": pending_requests,
                    "completion_rate": completion_rate,
                    "average_project_time": 45  # days
                }
            }
        }
    
    async def _assist_work_requests(self, state: Dict) -> Dict:
        """Assist with work request management"""
        user_message = state["user_message"]
        
        # Analyze work request needs
        suggestions = []
        if "create" in user_message.lower():
            suggestions.append({
                "field": "customer",
                "suggestion": "Select from existing customers or create new one",
                "reason": "Customer association is required"
            })
            suggestions.append({
                "field": "priority",
                "suggestion": "Consider project timeline and customer tier",
                "reason": "Priority affects resource allocation"
            })
        
        similar_requests = MOCK_WORK_REQUESTS[:2]  # Mock similar requests
        
        return {
            **state,
            "node_outputs": {
                "suggestions": suggestions,
                "validation_errors": [],
                "similar_requests": similar_requests,
                "estimated_completion": "2-3 weeks based on project type"
            }
        }
    
    async def _manage_customer_relationships(self, state: Dict) -> Dict:
        """Manage customer relationships and provide insights"""
        # Mock customer analysis
        customer_tier = "Premium"
        relationship_score = 0.92
        
        recommendations = [
            "Maintain regular communication with TechCorp",
            "Consider upselling opportunities for MicroTech"
        ]
        
        risk_factors = [
            "No recent projects from MicroTech"
        ]
        
        opportunities = [
            "TechCorp shows interest in advanced packaging",
            "MicroTech may need die attach services"
        ]
        
        return {
            **state,
            "node_outputs": {
                "customer_tier": customer_tier,
                "relationship_score": relationship_score,
                "recommendations": recommendations,
                "risk_factors": risk_factors,
                "opportunities": opportunities
            }
        }
    
    async def _optimize_projects(self, state: Dict) -> Dict:
        """Optimize project planning and resource allocation"""
        # Mock project optimization
        optimized_timeline = {
            "start_date": "2024-02-01",
            "end_date": "2024-03-15",
            "milestones": [
                {"date": "2024-02-15", "milestone": "Design review complete"},
                {"date": "2024-03-01", "milestone": "Prototype ready"}
            ]
        }
        
        resource_allocation = {
            "team_members": ["John Smith", "Sarah Johnson"],
            "equipment": ["Wirebond machine #3", "Die attach station #1"],
            "materials": ["Gold wire", "Die attach epoxy"]
        }
        
        risk_assessment = {
            "high_risk_factors": ["Material availability", "Equipment maintenance"],
            "mitigation_strategies": ["Order materials early", "Schedule maintenance"]
        }
        
        return {
            **state,
            "node_outputs": {
                "optimized_timeline": optimized_timeline,
                "resource_allocation": resource_allocation,
                "risk_assessment": risk_assessment
            }
        }
    
    async def _help_data_operations(self, state: Dict) -> Dict:
        """Assist with CSV import/export operations"""
        validation_results = {
            "valid_rows": 45,
            "invalid_rows": 2,
            "errors": ["Missing customer ID in row 23", "Invalid date format in row 47"]
        }
        
        mapping_suggestions = {
            "field_mappings": {
                "Customer Name": "customer_name",
                "Project Type": "project_type",
                "Priority": "priority"
            },
            "data_transformations": [
                "Convert date strings to ISO format",
                "Standardize project type values"
            ]
        }
        
        return {
            **state,
            "node_outputs": {
                "validation_results": validation_results,
                "mapping_suggestions": mapping_suggestions,
                "import_preview": MOCK_WORK_REQUESTS[:3]
            }
        }
    
    async def _generate_reports(self, state: Dict) -> Dict:
        """Generate custom reports and analytics"""
        report_data = {
            "total_revenue": 370000,
            "projects_completed": 12,
            "average_project_time": 45,
            "customer_satisfaction": 0.94
        }
        
        visualizations = [
            {
                "type": "bar_chart",
                "data": {"labels": ["Wirebond", "Die Attach", "Flip Chip"], "values": [8, 5, 2]},
                "config": {"title": "Projects by Type"}
            }
        ]
        
        insights = [
            "Wirebond projects are most common",
            "Average completion time is within target",
            "Customer satisfaction is high"
        ]
        
        return {
            **state,
            "node_outputs": {
                "report_data": report_data,
                "visualizations": visualizations,
                "insights": insights,
                "recommendations": ["Focus on expanding die attach capabilities"]
            }
        }
    
    async def _help_navigation(self, state: Dict) -> Dict:
        """Help users navigate the application"""
        navigation_path = [
            {
                "step": 1,
                "action": "Go to Dashboard",
                "description": "View overview of all activities",
                "route": "/"
            },
            {
                "step": 2,
                "action": "Create Work Request",
                "description": "Add new work request",
                "route": "/add-work-request"
            }
        ]
        
        shortcuts = [
            "Use Ctrl+N for new work request",
            "Use Ctrl+S for quick save"
        ]
        
        tips = [
            "Use the search bar to find specific items",
            "Filter by status to focus on pending items"
        ]
        
        return {
            **state,
            "node_outputs": {
                "navigation_path": navigation_path,
                "shortcuts": shortcuts,
                "tips": tips
            }
        }
    
    async def _troubleshoot_errors(self, state: Dict) -> Dict:
        """Help troubleshoot errors and issues"""
        diagnosis = "CSV import validation error"
        
        solution_steps = [
            {
                "step": 1,
                "action": "Check CSV format",
                "explanation": "Ensure all required columns are present"
            },
            {
                "step": 2,
                "action": "Validate data types",
                "explanation": "Check that dates are in YYYY-MM-DD format"
            }
        ]
        
        prevention_tips = [
            "Use the provided CSV template",
            "Validate data before import"
        ]
        
        return {
            **state,
            "node_outputs": {
                "diagnosis": diagnosis,
                "solution_steps": solution_steps,
                "prevention_tips": prevention_tips,
                "escalation_needed": False
            }
        }
    
    async def _generate_response(self, state: Dict) -> Dict:
        """Generate final user-friendly response"""
        node_outputs = state["node_outputs"]
        user_message = state["user_message"]
        
        # Generate contextual response based on node outputs
        response_prompt = f"""
        User asked: "{user_message}"
        
        Analysis results: {json.dumps(node_outputs, indent=2)}
        
        Generate a helpful, conversational response that:
        1. Addresses the user's question directly
        2. Provides actionable insights from the analysis
        3. Suggests next steps or actions
        4. Uses a professional but friendly tone
        
        Keep the response concise and focused.
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=response_prompt)])
        
        # Generate suggested actions
        suggested_actions = []
        if "dashboard" in user_message.lower():
            suggested_actions.append({
                "action": "View Dashboard",
                "description": "See current metrics and status",
                "route": "/"
            })
        
        return {
            **state,
            "final_response": {
                "response_message": response.content,
                "suggested_actions": suggested_actions,
                "follow_up_questions": [
                    "Would you like me to help you create a new work request?",
                    "Should I generate a detailed report for you?"
                ]
            }
        }
    
    async def process_message(self, message: str, current_page: str = "/", user_role: str = "operator") -> Dict:
        """Process a user message and return response"""
        initial_state = {
            "user_message": message,
            "current_page": current_page,
            "user_role": user_role,
            "session_history": [],
            "work_requests": MOCK_WORK_REQUESTS,
            "customers": MOCK_CUSTOMERS,
            "projects": [],
            "node_outputs": {},
            "final_response": {}
        }
        
        result = await self.graph.ainvoke(initial_state)
        return result["final_response"]

# Example usage
async def main():
    """Example usage of the SC Micro Assistant"""
    
    # Initialize assistant (you'll need to provide your OpenAI API key)
    assistant = SCMicroAssistant("your-openai-api-key-here")
    
    # Example queries
    queries = [
        "What's the current status of my work requests?",
        "I need to create a new work request for TechCorp",
        "How are my customers performing?",
        "Help me navigate to the CSV upload page",
        "I'm getting an error when importing data"
    ]
    
    for query in queries:
        print(f"\nUser: {query}")
        response = await assistant.process_message(query)
        print(f"Assistant: {response['response_message']}")
        if response['suggested_actions']:
            print("Suggested actions:")
            for action in response['suggested_actions']:
                print(f"  - {action['action']}: {action['description']}")

if __name__ == "__main__":
    # Run the example
    asyncio.run(main()) 