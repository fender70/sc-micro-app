import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data storage for demo
let customers = [
  {
    _id: '1',
    name: 'John Smith',
    company: 'TechCorp Industries',
    email: 'john.smith@techcorp.com',
    phone: '(555) 123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    notes: 'Premium customer with high-value projects',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '2',
    name: 'Sarah Johnson',
    company: 'Innovate Solutions',
    email: 'sarah.j@innovate.com',
    phone: '(555) 234-5678',
    address: '456 Innovation Ave, Austin, TX 73301',
    notes: 'Focus on wirebond and die attach projects',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '3',
    name: 'Mike Chen',
    company: 'Startup.io',
    email: 'mike.chen@startup.io',
    phone: '(555) 345-6789',
    address: '789 Startup Blvd, Seattle, WA 98101',
    notes: 'New customer with potential for growth',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  }
];

let workRequests = [
  {
    _id: '1',
    customer: customers[0],
    workRequestDetails: 'Wirebond assembly for 100 units of RF amplifier chips',
    quoteNumber: 'Q-2024-001',
    poNumber: 'PO-2024-001',
    invoiceNumber: 'INV-2024-001',
    shipDate: '2024-08-15',
    scMicroReport: 'https://example.com/report1.pdf',
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '2',
    customer: customers[1],
    workRequestDetails: 'Die attach process for MEMS sensor packaging',
    quoteNumber: 'Q-2024-002',
    poNumber: 'PO-2024-002',
    invoiceNumber: 'INV-2024-002',
    shipDate: '2024-08-20',
    scMicroReport: 'https://example.com/report2.pdf',
    status: 'in-progress',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '3',
    customer: customers[2],
    workRequestDetails: 'Flip chip assembly for IoT device prototype',
    quoteNumber: 'Q-2024-003',
    poNumber: 'PO-2024-003',
    invoiceNumber: '',
    shipDate: '2024-09-01',
    scMicroReport: '',
    status: 'pending',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '4',
    customer: customers[0],
    workRequestDetails: 'Encapsulation process for automotive sensor module',
    quoteNumber: 'Q-2024-004',
    poNumber: 'PO-2024-004',
    invoiceNumber: 'INV-2024-004',
    shipDate: '2024-07-30',
    scMicroReport: 'https://example.com/report4.pdf',
    status: 'shipped',
    createdAt: '2024-04-05T11:20:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '5',
    customer: customers[1],
    workRequestDetails: 'Testing and validation for medical device components',
    quoteNumber: 'Q-2024-005',
    poNumber: 'PO-2024-005',
    invoiceNumber: '',
    shipDate: '2024-09-15',
    scMicroReport: '',
    status: 'quoted',
    createdAt: '2024-05-12T16:45:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  }
];

let projects = [
  {
    _id: '1',
    customer: customers[0],
    projectName: 'RF Amplifier Assembly Project',
    projectDescription: 'Complete assembly and testing of RF amplifier chips for telecommunications',
    projectType: 'wirebond',
    status: 'completed',
    priority: 'high',
    budget: 25000,
    actualCost: 23000,
    startDate: '2024-01-15',
    targetDate: '2024-08-15',
    quoteNumber: 'Q-2024-001',
    poNumber: 'PO-2024-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '2',
    customer: customers[1],
    projectName: 'MEMS Sensor Packaging',
    projectDescription: 'Advanced packaging solution for MEMS sensors with die attach process',
    projectType: 'die-attach',
    status: 'active',
    priority: 'medium',
    budget: 18000,
    actualCost: 12000,
    startDate: '2024-02-20',
    targetDate: '2024-08-20',
    quoteNumber: 'Q-2024-002',
    poNumber: 'PO-2024-002',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  },
  {
    _id: '3',
    customer: customers[2],
    projectName: 'IoT Device Prototype',
    projectDescription: 'Flip chip assembly for next-generation IoT device prototype',
    projectType: 'flip-chip',
    status: 'planning',
    priority: 'low',
    budget: 15000,
    actualCost: 0,
    startDate: '2024-03-10',
    targetDate: '2024-09-01',
    quoteNumber: 'Q-2024-003',
    poNumber: 'PO-2024-003',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-07-15T10:00:00Z'
  }
];

// Helper function to generate new IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Routes
app.get('/api/workrequests', (req, res) => {
  res.json(workRequests);
});

app.post('/api/workrequests', (req, res) => {
  const newWorkRequest = {
    _id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  workRequests.push(newWorkRequest);
  res.status(201).json(newWorkRequest);
});

app.put('/api/workrequests/:id', (req, res) => {
  const index = workRequests.findIndex(wr => wr._id === req.params.id);
  if (index !== -1) {
    workRequests[index] = { ...workRequests[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(workRequests[index]);
  } else {
    res.status(404).json({ message: 'Work request not found' });
  }
});

app.delete('/api/workrequests/:id', (req, res) => {
  const index = workRequests.findIndex(wr => wr._id === req.params.id);
  if (index !== -1) {
    workRequests.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Work request not found' });
  }
});

app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const newCustomer = {
    _id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(customers[index]);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    customers.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    _id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(projects[index]);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    projects.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// CSV routes
app.post('/api/csv/upload', (req, res) => {
  try {
    // Mock CSV upload response
    res.json({ 
      message: 'CSV uploaded successfully (demo mode)',
      processed: 5,
      added: 3,
      updated: 2
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'CSV upload failed' });
  }
});

app.get('/api/csv/template', (req, res) => {
  try {
    // Mock CSV template download
    const csvContent = `Date Entered,Company Name,Contact,Status,Quote #,QTY,PO#,Invoice #,Amt Invoiced ($),Status2,Work Request Details
2024-07-15,TechCorp Industries,John Smith,pending,Q-2024-006,50,PO-2024-006,,,Wirebond assembly for RF chips
2024-07-15,Innovate Solutions,Sarah Johnson,in-progress,Q-2024-007,25,PO-2024-007,INV-2024-007,15000,Die attach for MEMS sensors`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="work-order-template.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('CSV template error:', error);
    res.status(500).json({ error: 'CSV template download failed' });
  }
});

// Export for Vercel serverless function
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 