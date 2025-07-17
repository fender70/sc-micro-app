import express from 'express';
import cors from 'cors';
import assistantRouter from './assistant.js';
import databaseRouter from './database.js';
import csvUploadRouter from './csv-upload.js';
import dbManager from '../database/db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Assistant routes
app.use('/api/assistant', assistantRouter);

// Database routes
app.use('/api/database', databaseRouter);

// CSV Upload routes
app.use('/api/csv', csvUploadRouter);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API server is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      workRequests: '/api/workrequests',
      customers: '/api/customers',
      projects: '/api/projects',
      assistant: '/api/assistant/chat'
    }
  });
});

// Initialize database manager
dbManager.initialize();

// Routes
app.get('/api/workrequests', async (req, res) => {
  try {
    const allWorkRequests = await dbManager.getWorkRequests();
    res.json(allWorkRequests);
  } catch (error) {
    console.error('Error in /api/workrequests:', error);
    res.status(500).json({ error: 'Failed to get work requests', details: error.message });
  }
});

app.post('/api/workrequests', async (req, res) => {
  try {
    const newWorkRequestId = await dbManager.createWorkRequest(req.body);
    const newWorkRequest = await dbManager.getWorkRequestById(newWorkRequestId);
    res.status(201).json(newWorkRequest);
  } catch (error) {
    console.error('Error creating work request:', error);
    res.status(500).json({ error: 'Failed to create work request', details: error.message });
  }
});

app.put('/api/workrequests/:id', async (req, res) => {
  try {
    await dbManager.updateWorkRequest(req.params.id, req.body);
    const updatedWorkRequest = await dbManager.getWorkRequestById(req.params.id);
    res.json(updatedWorkRequest);
  } catch (error) {
    console.error('Error updating work request:', error);
    res.status(500).json({ error: 'Failed to update work request', details: error.message });
  }
});

app.delete('/api/workrequests/:id', async (req, res) => {
  try {
    await dbManager.deleteWorkRequest(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting work request:', error);
    res.status(500).json({ error: 'Failed to delete work request', details: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const allCustomers = await dbManager.getCustomers();
    res.json(allCustomers);
  } catch (error) {
    console.error('Error in /api/customers:', error);
    res.status(500).json({ error: 'Failed to get customers', details: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const newCustomerId = await dbManager.createCustomer(req.body);
    const newCustomer = await dbManager.getCustomerById(newCustomerId);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer', details: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    await dbManager.updateCustomer(req.params.id, req.body);
    const updatedCustomer = await dbManager.getCustomerById(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer', details: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await dbManager.deleteCustomer(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer', details: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const allProjects = await dbManager.getProjects();
    res.json(allProjects);
  } catch (error) {
    console.error('Error in /api/projects:', error);
    res.status(500).json({ error: 'Failed to get projects', details: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const newProjectId = await dbManager.createProject(req.body);
    const newProject = await dbManager.getProjectById(newProjectId);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    await dbManager.updateProject(req.params.id, req.body);
    const updatedProject = await dbManager.getProjectById(req.params.id);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project', details: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await dbManager.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project', details: error.message });
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



app.get('/api/csv/template', (req, res) => {
  try {
    const { type } = req.query;
    
    let csvContent, filename;
    
    if (type === 'projects') {
      // Projects template - matches Project Details format
      csvContent = `SN,Customer,PIC Name,Quote #,PO#,Invoice #,Amount Invoiced ($),Completion Date,Photo,Project Information,Comments
1,Open Light Photonics,Sheri Wang,QU-24733,INV-2536,INV-2536,"4,965.94",7-Jun,,"Manual remove the singulated die from wafer, Die attach with JM7000, Wirebond with 8 wires, Quantity: 100","QU24733 - Include epoxy price in quote"
2,Qorvo,James Wang,QU-24732,,,,,,"Eutectic die attach, They will provide the die and heat spreader, Temperature: 340C, Quote Request for 100 and 200 quantity, Schedule: End of April","QU-24732 - Update quote for eutectic attach only"
3,Semi Pac Reclaim,John Mackay,QU-24730,,INV-2521,"3,030.17",4/17/2025,,"Wirebond project. No Die attach, Materials are on-hand, 23 wires, Quantity: 147","QU-24730 - Completed project, revise quote for 18 wires only"`;
      filename = 'projects-template.csv';
    } else {
      // Work orders template (default) - matches your actual CSV format
      csvContent = `SN,Customer,PIC Name,Quote #,PO#,Invoice #,Amount Invoiced ($),Completion Date,Photo,Project Information,Comments
1,TechCorp Industries,John Smith,QU-2024-001,PO-2024-001,INV-2024-001,"15,000.00",2024-07-15,,"Wirebond assembly for RF chips - 50 units","High priority project"
2,Innovate Solutions,Sarah Johnson,QU-2024-002,PO-2024-002,,,2024-08-15,,"Die attach for MEMS sensors - 25 units","Pending material approval"
3,Open Light Photonics,Sheri Wang,QU-2024-003,,,,"4,965.94",2024-06-07,,"Manual remove the singulated die from wafer, Die attach with JM7000, Wirebond with 8 wires, Quantity: 100","Include epoxy price in quote"`;
      filename = 'work-orders-template.csv';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('CSV template error:', error);
    res.status(500).json({ error: 'CSV template download failed' });
  }
});

// Export the Express app
export default app; 