const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectDescription: {
    type: String,
    trim: true,
    default: ''
  },
  projectType: {
    type: String,
    enum: ['wirebond', 'die-attach', 'flip-chip', 'encapsulation', 'assembly', 'testing', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: null
  },
  targetDate: {
    type: Date,
    default: null
  },
  completionDate: {
    type: Date,
    default: null
  },
  budget: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
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
  invoiceNumber: {
    type: String,
    trim: true,
    default: ''
  },
  projectManager: {
    type: String,
    trim: true,
    default: ''
  },
  technicalLead: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  workRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkRequest'
  }],
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
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for project progress
ProjectSchema.virtual('progress').get(function() {
  if (!this.workRequests || this.workRequests.length === 0) {
    return 0;
  }
  
  // This would need to be calculated based on work request statuses
  // For now, return a placeholder
  return 0;
});

// Virtual for project duration
ProjectSchema.virtual('duration').get(function() {
  if (!this.startDate) {
    return 0;
  }
  
  const endDate = this.completionDate || new Date();
  return Math.ceil((endDate - this.startDate) / (1000 * 60 * 60 * 24)); // days
});

// Ensure virtual fields are serialized
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', ProjectSchema); 