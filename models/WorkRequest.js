const mongoose = require('mongoose');

const WorkRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  workRequestDetails: {
    type: String,
    required: true,
    trim: true
  },
  quoteNumber: {
    type: String,
    trim: true,
    default: ''
  },
  poNumber: {
    type: String,
    trim: true,
    default: ''
  },
  scMicroReport: {
    type: String, // File path or URL
    default: ''
  },
  invoiceNumber: {
    type: String,
    trim: true,
    default: ''
  },
  shipDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'shipped', 'quoted', 'po-received', 'payment', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
WorkRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WorkRequest', WorkRequestSchema); 