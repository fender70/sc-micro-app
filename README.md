# SC Micro Enterprise Management System

A modern, full-stack enterprise management application built with React, Node.js, SQLite, and AI integration. This project demonstrates advanced web development skills, database design, and intelligent system automation.

![SC Micro Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0-green)
![SQLite](https://img.shields.io/badge/SQLite-3.0-orange)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## 🚀 Live Demo

[View Live Demo](https://sc-micro-demo.vercel.app)

## 📋 Project Overview

SC Micro is a comprehensive enterprise management system designed for semiconductor manufacturing companies. It provides real-time tracking of work requests, customer relationships, and project analytics with an intelligent AI assistant for enhanced user experience.

### Key Features

- **📊 Real-time Dashboard** - Live metrics and KPI tracking
- **👥 Customer Management** - Complete CRM with relationship analytics
- **🔧 Work Request System** - End-to-end request lifecycle management
- **📈 Project Analytics** - Advanced project tracking and reporting
- **🤖 AI Assistant** - Intelligent chat interface for system queries
- **📁 CSV Operations** - Bulk data import/export functionality
- **📱 Responsive Design** - Mobile-first, modern UI/UX

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **CSS3** - Custom styling with modern design patterns
- **React Router** - Client-side routing

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight, embedded database
- **RESTful APIs** - Clean, scalable API design

### AI Integration
- **Python LangGraph** - Advanced AI agent framework
- **OpenAI GPT-4** - Natural language processing
- **Real-time Chat** - WebSocket-based communication

### Development Tools
- **ESLint** - Code quality and consistency
- **Git** - Version control
- **npm** - Package management

## 🏗️ Architecture

```
sc-micro-app/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React context providers
│   └── assets/            # Static assets
├── api/                   # Express.js backend
│   ├── database.js        # Database operations
│   ├── assistant.js       # AI chat integration
│   └── csv-upload.js      # File upload handling
├── database/              # Database layer
│   ├── db.js             # Database manager
│   └── schema.sql        # Database schema
└── langgraph/langgraph_agent.py    # AI agent implementation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fender70/sc-micro-app.git
   cd sc-micro-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

4. **Initialize the database**
   ```bash
   npm run setup-db
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run backend
   
   # Terminal 3: AI Agent (optional)
   python3 langgraph/langgraph_agent.py
   ```

6. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend: http://localhost:3001
   ```

## 📖 Usage Guide

### Dashboard
- View real-time system metrics
- Monitor pending work requests
- Track customer engagement

### Customer Management
- Add and edit customer profiles
- View customer tier analytics
- Track project history

### Work Requests
- Create new work requests
- Update request status
- Track completion rates

### AI Assistant
- Ask questions about your data
- Get insights and recommendations
- Navigate the system naturally

## 🔧 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/customers` | GET | Retrieve all customers |
| `/api/customers` | POST | Create new customer |
| `/api/workrequests` | GET | Get all work requests |
| `/api/projects` | GET | Retrieve all projects |
| `/api/assistant/chat` | POST | AI assistant chat |

### Example API Call

```javascript
// Get all customers
const response = await fetch('/api/customers');
const customers = await response.json();

// Chat with AI assistant
const chatResponse = await fetch('/api/assistant/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Show me the dashboard overview",
    current_page: "/",
    user_role: "operator"
  })
});
```

## 🎯 Key Achievements

- **Scalable Architecture** - Modular design supporting enterprise growth
- **Real-time Data** - Live updates across all system components
- **AI Integration** - Intelligent assistant for enhanced user experience
- **Database Design** - Optimized schema for performance and scalability
- **Modern UI/UX** - Responsive design with intuitive navigation
- **Error Handling** - Comprehensive error management and user feedback

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run backend tests
npm run test:backend

# Run full test suite
npm run test:all
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Cedric Zarate**
- GitHub: [@fender70](https://github.com/fender70)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/cedric-zarate-17b735226/)
- Portfolio: [Portfolio](https://cedzarate.com)

## 🙏 Acknowledgments

- OpenAI for GPT-4 integration
- LangGraph team for the AI agent framework
- React and Node.js communities for excellent documentation
# Thu Jul 17 15:25:03 PDT 2025
