const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const WorkRequest = require('../models/WorkRequest');

// @route   GET /api/projects
// @desc    Get all projects with customer and work request details
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('customer', 'name company email')
      .populate('workRequests', 'workRequestDetails status quoteNumber poNumber invoiceNumber')
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('customer', 'name company email phone address')
      .populate('workRequests', 'workRequestDetails status quoteNumber poNumber invoiceNumber shipDate createdAt');
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      projectName,
      projectDescription,
      projectType,
      status,
      priority,
      startDate,
      targetDate,
      budget,
      quoteNumber,
      poNumber,
      projectManager,
      technicalLead,
      notes
    } = req.body;

    // Validate required fields
    if (!customer || !projectName) {
      return res.status(400).json({ msg: 'Customer and project name are required' });
    }

    // Check if customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(400).json({ msg: 'Customer not found' });
    }

    const newProject = new Project({
      customer,
      projectName,
      projectDescription,
      projectType,
      status,
      priority,
      startDate: startDate ? new Date(startDate) : null,
      targetDate: targetDate ? new Date(targetDate) : null,
      budget: budget || 0,
      quoteNumber,
      poNumber,
      projectManager,
      technicalLead,
      notes
    });

    const project = await newProject.save();
    
    // Populate customer details for response
    await project.populate('customer', 'name company email');
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const {
      projectName,
      projectDescription,
      projectType,
      status,
      priority,
      startDate,
      targetDate,
      completionDate,
      budget,
      actualCost,
      quoteNumber,
      poNumber,
      invoiceNumber,
      projectManager,
      technicalLead,
      notes
    } = req.body;

    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Update fields
    if (projectName !== undefined) project.projectName = projectName;
    if (projectDescription !== undefined) project.projectDescription = projectDescription;
    if (projectType !== undefined) project.projectType = projectType;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (startDate !== undefined) project.startDate = startDate ? new Date(startDate) : null;
    if (targetDate !== undefined) project.targetDate = targetDate ? new Date(targetDate) : null;
    if (completionDate !== undefined) project.completionDate = completionDate ? new Date(completionDate) : null;
    if (budget !== undefined) project.budget = budget;
    if (actualCost !== undefined) project.actualCost = actualCost;
    if (quoteNumber !== undefined) project.quoteNumber = quoteNumber;
    if (poNumber !== undefined) project.poNumber = poNumber;
    if (invoiceNumber !== undefined) project.invoiceNumber = invoiceNumber;
    if (projectManager !== undefined) project.projectManager = projectManager;
    if (technicalLead !== undefined) project.technicalLead = technicalLead;
    if (notes !== undefined) project.notes = notes;

    await project.save();
    
    // Populate customer details for response
    await project.populate('customer', 'name company email');
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Remove project from work requests that reference it
    await WorkRequest.updateMany(
      { _id: { $in: project.workRequests } },
      { $unset: { project: 1 } }
    );

    await project.remove();
    
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/workrequests
// @desc    Add work request to project
// @access  Public
router.post('/:id/workrequests', async (req, res) => {
  try {
    const { workRequestId } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const workRequest = await WorkRequest.findById(workRequestId);
    if (!workRequest) {
      return res.status(404).json({ msg: 'Work request not found' });
    }

    // Check if work request is already in this project
    if (project.workRequests.includes(workRequestId)) {
      return res.status(400).json({ msg: 'Work request already in project' });
    }

    project.workRequests.push(workRequestId);
    await project.save();
    
    // Populate details for response
    await project.populate('customer', 'name company email');
    await project.populate('workRequests', 'workRequestDetails status quoteNumber poNumber invoiceNumber');
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id/workrequests/:workRequestId
// @desc    Remove work request from project
// @access  Public
router.delete('/:id/workrequests/:workRequestId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const workRequestIndex = project.workRequests.indexOf(req.params.workRequestId);
    if (workRequestIndex === -1) {
      return res.status(404).json({ msg: 'Work request not found in project' });
    }

    project.workRequests.splice(workRequestIndex, 1);
    await project.save();
    
    // Populate details for response
    await project.populate('customer', 'name company email');
    await project.populate('workRequests', 'workRequestDetails status quoteNumber poNumber invoiceNumber');
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 