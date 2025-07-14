const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// @route   GET /api/customers
// @desc    Get all customers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/customers/:id
// @desc    Get customer by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      notes
    } = req.body;

    const newCustomer = new Customer({
      name,
      email,
      phone: phone || '',
      company: company || '',
      address: address || {},
      notes: notes || ''
    });

    const customer = await newCustomer.save();
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      notes
    } = req.body;

    let customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    // Update fields
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (company !== undefined) customer.company = company;
    if (address !== undefined) customer.address = address;
    if (notes !== undefined) customer.notes = notes;

    customer.updatedAt = Date.now();
    
    await customer.save();
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    await customer.remove();
    res.json({ msg: 'Customer removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 