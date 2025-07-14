# SC Micro Enterprise App

A modern, lightweight enterprise application built with the MERN stack (MongoDB, Express.js, React, Node.js) for managing customer work requests efficiently.

## Features

- **Dashboard with Flexbox Grid**: Easy-to-access flexbox grid layout for work requests
- **Complete CRUD Operations**: Create, read, update, and delete work requests and customers
- **Real-time Status Updates**: Update work request status directly from the dashboard
- **Search and Filter**: Search work requests and filter by status
- **Responsive Design**: Modern, mobile-friendly interface
- **Customer Management**: Add and manage customer information

## Schema

The application manages work requests with the following fields:

- **Customer**: Associated customer information
- **Work Request Details**: Description of the work to be performed
- **Quote #**: Quote number from Xero
- **PO #**: Purchase order number from customer (usually emailed)
- **SC Micro Report**: File/URL for the generated work report
- **Invoice #**: Invoice number from Xero
- **Ship Date**: Expected or actual shipping date
- **Status**: Current status (pending, in-progress, completed, shipped)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **RESTful API** design
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **React Icons** for beautiful icons
- **Date-fns** for date formatting
- **Modern CSS** with CSS variables and flexbox/grid layouts

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sc-micro-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/sc-micro-app
   NODE_ENV=development
   PORT=5000
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or update the MONGODB_URI to point to your MongoDB instance.

6. **Run the application**

   **Development mode (both frontend and backend):**
   ```bash
   npm run dev
   ```

   **Or run separately:**
   
   Backend only:
   ```bash
   npm run server
   ```
   
   Frontend only:
   ```bash
   npm run client
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Work Requests
- `GET /api/workrequests` - Get all work requests
- `GET /api/workrequests/:id` - Get work request by ID
- `POST /api/workrequests` - Create new work request
- `PUT /api/workrequests/:id` - Update work request
- `DELETE /api/workrequests/:id` - Delete work request

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Usage

### Dashboard
- View all work requests in a responsive flexbox grid
- See real-time statistics for different statuses
- Search and filter work requests
- Update status directly from cards

### Adding Work Requests
1. Click "New Request" in the navigation
2. Select a customer from the dropdown
3. Fill in work request details
4. Add optional fields (Quote #, PO #, Invoice #, Ship Date, Report URL)
5. Set initial status
6. Submit the form

### Adding Customers
1. Click "Add Customer" in the navigation
2. Fill in customer information (name, email required)
3. Add optional contact and address details
4. Submit the form

### Managing Work Requests
- **Edit Status**: Click the edit button on any work request card
- **Delete**: Click the delete button (with confirmation)
- **View Details**: All information is displayed on the card

## Project Structure

```
sc-micro-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── models/                 # MongoDB models
│   ├── Customer.js
│   └── WorkRequest.js
├── routes/                 # API routes
│   ├── customers.js
│   └── workRequests.js
├── server.js              # Express server
├── package.json
└── README.md
```

## Deployment

### Backend Deployment
The backend can be deployed to platforms like:
- Heroku
- Railway
- DigitalOcean
- AWS

### Frontend Deployment
The React app can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

### Environment Variables for Production
Update the `.env` file with production values:
```
MONGODB_URI=your_production_mongodb_uri
NODE_ENV=production
PORT=5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository. 