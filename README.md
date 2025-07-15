# SC Micro Enterprise Management System

A full-stack MERN application for managing work requests, customer relationships, and project tracking in a manufacturing environment. **This is a demo version with in-memory data storage.**

## 🚀 Live Demo

[Add your deployed demo link here]

## ✨ Features

### Dashboard & Analytics
- **Real-time Dashboard**: Comprehensive overview with status breakdowns and key metrics
- **Customer Analytics**: Customer tiering system (Premium, Gold, Silver, Bronze) based on project value and completion rates
- **Project Tracking**: Visual project type analysis (wirebond, die attach, flip chip, encapsulation)
- **Performance Metrics**: Completion rates, average project time, and revenue tracking

### Work Request Management
- **Complete CRUD Operations**: Create, read, update, and delete work requests
- **Status Workflow**: Track requests from pending → in-progress → completed → shipped
- **Advanced Filtering**: Search by customer, status, date range, and project details
- **Bulk Operations**: CSV import/export for efficient data management

### Customer Relationship Management
- **Customer Profiles**: Comprehensive contact and address management
- **Project History**: View all projects and work requests per customer
- **Business Intelligence**: Customer value scoring and relationship analytics
- **Contact Management**: Store multiple contacts per customer with detailed notes

### Data Management
- **CSV Import/Export**: Support for real-world work order tracker formats
- **Smart Status Mapping**: Automatic conversion of business statuses to system statuses
- **Multi-line Support**: Handle complex project notes and descriptions
- **Template Downloads**: Pre-formatted CSV templates for data entry

## 🛠️ Tech Stack

### Frontend
- **React 18** with modern hooks and functional components
- **React Router** for client-side navigation
- **CSS3** with custom properties and responsive design
- **React Icons** for consistent UI elements
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **In-memory data storage** for demo purposes
- **Mock CSV handling** for file upload simulation
- **CORS** enabled for cross-origin requests

### Development Tools
- **Concurrently** for running frontend and backend simultaneously
- **Nodemon** for development server auto-restart
- **Environment variables** for configuration management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/fender70/sc-micro-app]
   cd sc-micro-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Set up environment variables (optional for demo)**
   ```bash
   cp .env.example .env
   # No database setup required for demo version
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Seed the database (not needed for demo)**
   ```bash
   # Demo version comes with pre-loaded sample data
   ```

## 🏗️ Project Structure

```
sc-micro-app/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts (theme, etc.)
│       └── assets/        # Images and static files
├── models/                # Mongoose data models
├── routes/                # Express API routes
├── uploads/               # File upload directory
├── server.js             # Express server entry point
├── seed-data.js          # Database seeding script
└── package.json          # Backend dependencies
```

## 🔧 API Endpoints

### Work Requests
- `GET /api/workrequests` - Get all work requests
- `POST /api/workrequests` - Create new work request
- `PUT /api/workrequests/:id` - Update work request
- `DELETE /api/workrequests/:id` - Delete work request

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### CSV Operations
- `POST /api/csv/upload` - Upload CSV file
- `GET /api/csv/template` - Download CSV template

## 🎨 Key Features Implementation

### Responsive Design
- Mobile-first approach with CSS Grid and Flexbox
- Adaptive layouts for desktop, tablet, and mobile
- Touch-friendly interface elements

### Real-time Updates
- Immediate UI updates without page refreshes
- Optimized with React hooks and memoization
- Efficient state management

### Data Visualization
- Color-coded status indicators
- Progress bars and charts
- Customer tiering visualizations

## 🚀 Deployment

### Demo Deployment
1. Deploy to Vercel: `vercel --prod`
2. No database setup required
3. Application works immediately with sample data

### Production Deployment
1. Set up MongoDB Atlas or production MongoDB instance
2. Deploy to Heroku, Railway, or similar platform
3. Configure environment variables
4. Build the React app: `npm run build`
5. Deploy frontend to Vercel, Netlify, or similar platform

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

[Cedric Zarate] - [cedzarate.com]

---

**Note**: This is a demonstration project showcasing full-stack development skills with the MERN stack, focusing on enterprise-level features and real-world business requirements. 