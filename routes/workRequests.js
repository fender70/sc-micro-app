const express = require('express');
const router = express.Router();
const WorkRequest = require('../models/WorkRequest');
const Customer = require('../models/Customer');

// @route   GET /api/workrequests
// @desc    Get all work requests with customer details
// @access  Public
router.get('/', async (req, res) => {
  try {
    const workRequests = await WorkRequest.find()
      .populate('customer', 'name company email')
      .sort({ createdAt: -1 });
    
    res.json(workRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/workrequests/:id
// @desc    Get work request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const workRequest = await WorkRequest.findById(req.params.id)
      .populate('customer', 'name company email phone address');
    
    if (!workRequest) {
      return res.status(404).json({ msg: 'Work request not found' });
    }
    
    res.json(workRequest);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Work request not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/workrequests
// @desc    Create a new work request
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      workRequestDetails,
      quoteNumber,
      poNumber,
      scMicroReport,
      invoiceNumber,
      shipDate,
      status
    } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({ msg: 'Customer not found' });
    }

    const newWorkRequest = new WorkRequest({
      customer: customerId,
      workRequestDetails,
      quoteNumber: quoteNumber || '',
      poNumber: poNumber || '',
      scMicroReport: scMicroReport || '',
      invoiceNumber: invoiceNumber || '',
      shipDate: shipDate || null,
      status: status || 'pending'
    });

    const workRequest = await newWorkRequest.save();
    
    // Populate customer details before sending response
    await workRequest.populate('customer', 'name company email');
    
    res.json(workRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/workrequests/:id
// @desc    Update work request
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const {
      workRequestDetails,
      quoteNumber,
      poNumber,
      scMicroReport,
      invoiceNumber,
      shipDate,
      status
    } = req.body;

    let workRequest = await WorkRequest.findById(req.params.id);
    
    if (!workRequest) {
      return res.status(404).json({ msg: 'Work request not found' });
    }

    // Update fields
    if (workRequestDetails !== undefined) workRequest.workRequestDetails = workRequestDetails;
    if (quoteNumber !== undefined) workRequest.quoteNumber = quoteNumber;
    if (poNumber !== undefined) workRequest.poNumber = poNumber;
    if (scMicroReport !== undefined) workRequest.scMicroReport = scMicroReport;
    if (invoiceNumber !== undefined) workRequest.invoiceNumber = invoiceNumber;
    if (shipDate !== undefined) workRequest.shipDate = shipDate;
    if (status !== undefined) workRequest.status = status;

    workRequest.updatedAt = Date.now();
    
    await workRequest.save();
    
    // Populate customer details before sending response
    await workRequest.populate('customer', 'name company email');
    
    res.json(workRequest);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Work request not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/workrequests/:id
// @desc    Delete work request
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const workRequest = await WorkRequest.findById(req.params.id);
    
    if (!workRequest) {
      return res.status(404).json({ msg: 'Work request not found' });
    }

    await workRequest.remove();
    res.json({ msg: 'Work request removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Work request not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 