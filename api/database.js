import express from 'express';
import cors from 'cors';
import dbManager from '../database/db.js';

const router = express.Router();

// Initialize database on startup
dbManager.initialize().catch(error => {
    console.error('Failed to initialize database:', error);
});

// Customers API endpoints
router.get('/customers', cors(), async (req, res) => {
    try {
        const customers = await dbManager.getCustomers();
        res.json(customers || []);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

router.get('/customers/:id', cors(), async (req, res) => {
    try {
        const customer = await dbManager.getCustomerById(parseInt(req.params.id));
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

router.post('/customers', cors(), async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.name) {
            return res.status(400).json({ error: 'Customer name is required' });
        }
        
        const customerId = await dbManager.createCustomer(req.body);
        const customer = await dbManager.getCustomerById(customerId);
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ 
            error: 'Failed to create customer', 
            details: error.message 
        });
    }
});

router.put('/customers/:id', cors(), async (req, res) => {
    try {
        const result = await dbManager.updateCustomer(parseInt(req.params.id), req.body);
        if (result.changes > 0) {
            const customer = await dbManager.getCustomerById(parseInt(req.params.id));
            res.json(customer);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

router.delete('/customers/:id', cors(), async (req, res) => {
    try {
        const result = await dbManager.deleteCustomer(parseInt(req.params.id));
        if (result.changes > 0) {
            res.json({ message: 'Customer deleted successfully' });
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

// Work Requests API endpoints
router.get('/work-requests', cors(), async (req, res) => {
    try {
        const workRequests = await dbManager.getWorkRequests();
        res.json(workRequests || []);
    } catch (error) {
        console.error('Error fetching work requests:', error);
        res.status(500).json({ error: 'Failed to fetch work requests' });
    }
});

router.get('/work-requests/:id', cors(), async (req, res) => {
    try {
        const workRequest = await dbManager.getWorkRequestById(parseInt(req.params.id));
        if (workRequest) {
            res.json(workRequest);
        } else {
            res.status(404).json({ error: 'Work request not found' });
        }
    } catch (error) {
        console.error('Error fetching work request:', error);
        res.status(500).json({ error: 'Failed to fetch work request' });
    }
});

router.post('/work-requests', cors(), async (req, res) => {
    try {
        const workRequestId = await dbManager.createWorkRequest(req.body);
        const workRequest = await dbManager.getWorkRequestById(workRequestId);
        res.status(201).json(workRequest);
    } catch (error) {
        console.error('Error creating work request:', error);
        res.status(500).json({ error: 'Failed to create work request' });
    }
});

router.put('/work-requests/:id', cors(), async (req, res) => {
    try {
        const result = await dbManager.updateWorkRequest(parseInt(req.params.id), req.body);
        if (result.changes > 0) {
            const workRequest = await dbManager.getWorkRequestById(parseInt(req.params.id));
            res.json(workRequest);
        } else {
            res.status(404).json({ error: 'Work request not found' });
        }
    } catch (error) {
        console.error('Error updating work request:', error);
        res.status(500).json({ error: 'Failed to update work request' });
    }
});

router.delete('/work-requests/:id', cors(), async (req, res) => {
    try {
        const result = await dbManager.deleteWorkRequest(parseInt(req.params.id));
        if (result.changes > 0) {
            res.json({ message: 'Work request deleted successfully' });
        } else {
            res.status(404).json({ error: 'Work request not found' });
        }
    } catch (error) {
        console.error('Error deleting work request:', error);
        res.status(500).json({ error: 'Failed to delete work request' });
    }
});

// Projects API endpoints
router.get('/projects', cors(), async (req, res) => {
    try {
        const projects = await dbManager.getProjects();
        res.json(projects || []);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.get('/projects/:id', cors(), async (req, res) => {
    try {
        const project = await dbManager.getProjectById(parseInt(req.params.id));
        if (project) {
            res.json(project);
        } else {
            res.status(404).json({ error: 'Project not found' });
        }
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

router.post('/projects', cors(), async (req, res) => {
    try {
        const projectId = await dbManager.createProject(req.body);
        const project = await dbManager.getProjectById(projectId);
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.put('/projects/:id', cors(), async (req, res) => {
    try {
        const result = await dbManager.updateProject(parseInt(req.params.id), req.body);
        if (result.changes > 0) {
            const project = await dbManager.getProjectById(parseInt(req.params.id));
            res.json(project);
        } else {
            res.status(404).json({ error: 'Project not found' });
        }
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

router.delete('/projects/:id', cors(), async (req, res) => {
    try {
        const result = await dbManager.deleteProject(parseInt(req.params.id));
        if (result.changes > 0) {
            res.json({ message: 'Project deleted successfully' });
        } else {
            res.status(404).json({ error: 'Project not found' });
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Dashboard metrics endpoint
router.get('/dashboard/metrics', cors(), async (req, res) => {
    try {
        const metrics = await dbManager.getDashboardMetrics();
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});

// Database backup endpoint
router.post('/database/backup', cors(), async (req, res) => {
    try {
        const backupPath = `./database/backup_${Date.now()}.db`;
        await dbManager.backup(backupPath);
        res.json({ message: 'Database backed up successfully', backupPath });
    } catch (error) {
        console.error('Error backing up database:', error);
        res.status(500).json({ error: 'Failed to backup database' });
    }
});

export default router; 