#!/bin/bash

# SC Micro LangGraph Setup Script
# This script sets up the Python environment for the LangGraph agent

echo "🚀 Setting up LangGraph Agent for SC Micro..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "🐍 Python version: $PYTHON_VERSION"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

# Upgrade pip
echo "📦 Upgrading pip..."
pip3 install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
if pip3 install -r requirements.txt; then
    echo "✅ Python dependencies installed successfully!"
else
    echo "❌ Failed to install Python dependencies."
    echo "   You can still use the system with mock responses."
    exit 1
fi

# Test LangGraph installation
echo "🧪 Testing LangGraph installation..."
if python3 -c "import langgraph, langchain; print('✅ LangGraph and LangChain imported successfully')"; then
    echo "✅ LangGraph setup completed successfully!"
    echo ""
    echo "🎉 Your SC Micro system now has full AI capabilities!"
    echo ""
    echo "To enable LLM features, set one of these environment variables:"
    echo "  - OPENAI_API_KEY=your_openai_key"
    echo "  - ANTHROPIC_API_KEY=your_anthropic_key"
    echo ""
    echo "Or install Ollama for local LLM support:"
    echo "  - Visit: https://ollama.ai/"
    echo "  - Run: ollama pull llama2"
    echo ""
    echo "The system will work with mock responses if no LLM is configured."
else
    echo "❌ LangGraph test failed. The system will use mock responses."
fi

echo ""
echo "🔄 Restart your server to activate the LangGraph agent:"
echo "   npm run backend" 