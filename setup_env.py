#!/usr/bin/env python3
"""
Environment Setup Script for SC Micro LangGraph Agent
Helps users configure API keys and environment variables
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create a .env file with template configuration"""
    env_content = """# SC Micro LangGraph Agent Environment Configuration

# OpenAI Configuration (Optional)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Configuration (Optional)
# Get your API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Ollama Configuration (Optional - for local LLM)
# Install Ollama from: https://ollama.ai/
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# System Configuration
LOG_LEVEL=INFO
MAX_TOKENS=2000
TEMPERATURE=0.1
"""
    
    env_file = Path('.env')
    if env_file.exists():
        print("⚠️  .env file already exists. Skipping creation.")
        return
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with template configuration")
    print("📝 Please edit the .env file and add your API keys")

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        'langgraph',
        'langchain',
        'langchain-core',
        'langchain-openai',
        'langchain-anthropic'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r langgraph_requirements.txt")
        return False
    
    return True

def test_llm_configuration():
    """Test LLM configuration"""
    print("\n🧪 Testing LLM Configuration...")
    
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️  python-dotenv not installed. Install with: pip install python-dotenv")
    
    # Check for API keys
    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    if openai_key and openai_key != 'your_openai_api_key_here':
        print("✅ OpenAI API key configured")
    else:
        print("❌ OpenAI API key not configured")
    
    if anthropic_key and anthropic_key != 'your_anthropic_api_key_here':
        print("✅ Anthropic API key configured")
    else:
        print("❌ Anthropic API key not configured")
    
    # Test Ollama if available
    try:
        from langchain_community.llms import Ollama
        print("✅ Ollama support available")
    except ImportError:
        print("❌ Ollama support not available")
    
    if not any([openai_key and openai_key != 'your_openai_api_key_here',
                anthropic_key and anthropic_key != 'your_anthropic_api_key_here']):
        print("\n⚠️  No API keys configured. The agent will use template responses.")
        print("💡 To enable full AI capabilities, configure at least one API key in .env")

def main():
    """Main setup function"""
    print("🚀 SC Micro LangGraph Agent Setup")
    print("=" * 40)
    
    # Create .env file
    create_env_file()
    
    # Check dependencies
    print("\n📦 Checking Dependencies...")
    deps_ok = check_dependencies()
    
    # Test configuration
    test_llm_configuration()
    
    print("\n" + "=" * 40)
    if deps_ok:
        print("✅ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Edit .env file and add your API keys")
        print("2. Restart your server: npm run backend")
        print("3. Test the assistant with a message")
    else:
        print("⚠️  Setup completed with warnings")
        print("\n📋 To fix issues:")
        print("1. Install missing packages: pip install -r langgraph_requirements.txt")
        print("2. Configure API keys in .env file")
        print("3. Restart your server: npm run backend")

if __name__ == "__main__":
    main() 