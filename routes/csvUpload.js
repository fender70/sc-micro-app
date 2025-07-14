const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const WorkRequest = require('../models/WorkRequest');
const Customer = require('../models/Customer');
const Project = require('../models/Project');

// Status mapping function for work orders
const mapWorkOrderStatus = (status) => {
  const statusMap = {
    'pending': 'pending',
    'in progress': 'in-progress',
    'completed': 'completed',
    'shipped': 'shipped',
    'Pending': 'pending',
    'In Progress': 'in-progress',
    'Completed': 'completed',
    'Shipped': 'shipped'
  };
  return statusMap[status] || 'pending';
};

// Status mapping function for projects
const mapProjectStatus = (status) => {
  const statusMap = {
    'planning': 'planning',
    'active': 'active',
    'on-hold': 'on-hold',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'Planning': 'planning',
    'Active': 'active',
    'On Hold': 'on-hold',
    'Completed': 'completed',
    'Cancelled': 'cancelled'
  };
  return statusMap[status] || 'planning';
};

// Project type mapping
const mapProjectType = (type) => {
  const typeMap = {
    'wirebond': 'wirebond',
    'die attach': 'die-attach',
    'die-attach': 'die-attach',
    'flip chip': 'flip-chip',
    'flip-chip': 'flip-chip',
    'encapsulation': 'encapsulation',
    'assembly': 'assembly',
    'testing': 'testing',
    'other': 'other'
  };
  return typeMap[type?.toLowerCase()] || 'other';
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/csv/upload
// @desc    Upload CSV file with work order or project data
// @access  Public
router.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No CSV file uploaded' });
    }

    const { csvType } = req.body; // 'workorders' or 'projects'
    
    if (!csvType || !['workorders', 'projects'].includes(csvType)) {
      return res.status(400).json({ msg: 'CSV type must be either "workorders" or "projects"' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;

    // Read and parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          if (csvType === 'workorders') {
            // Process work orders CSV
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                // Validate required fields for work orders
                if (!row['Company Name'] || !row['Contact']) {
                  errors.push({
                    row: i + 1,
                    error: 'Missing required fields: Company Name and Contact are required'
                  });
                  continue;
                }

                // Find or create customer
                let customer = await Customer.findOne({ 
                  company: row['Company Name'],
                  name: row['Contact']
                });

                if (!customer) {
                  customer = new Customer({
                    name: row['Contact'],
                    email: `${row['Contact'].toLowerCase().replace(/\s+/g, '.')}@${row['Company Name'].toLowerCase().replace(/\s+/g, '')}.com`,
                    phone: '',
                    company: row['Company Name'],
                    address: {},
                    notes: row['Status2'] || ''
                  });
                  await customer.save();
                }

                // Map status from the tracker format
                let status = 'pending';
                const statusText = row['Status'] || '';
                
                if (statusText.includes('COMPLETE') || statusText.includes('Shipped')) {
                  status = 'completed';
                } else if (statusText.includes('WIP') || statusText.includes('ACTIVE')) {
                  status = 'in-progress';
                } else if (statusText.includes('QUOTED')) {
                  status = 'quoted';
                } else if (statusText.includes('PO Received')) {
                  status = 'po-received';
                } else if (statusText.includes('Payment')) {
                  status = 'payment';
                } else if (statusText.includes('Cancelled')) {
                  status = 'cancelled';
                }

                // Create work request
                const workRequest = new WorkRequest({
                  customer: customer._id,
                  workRequestDetails: `Project for ${row['Company Name']} - ${row['Status2'] || ''}`,
                  quoteNumber: row['Quote #'] || '',
                  poNumber: row['PO#'] || '',
                  scMicroReport: '',
                  invoiceNumber: row['Invoice #'] || '',
                  shipDate: row['Date Entered'] ? new Date(row['Date Entered']) : null,
                  status: status
                });

                await workRequest.save();
                successCount++;

              } catch (error) {
                errors.push({
                  row: i + 1,
                  error: error.message
                });
              }
            }
          } else if (csvType === 'projects') {
            // Process projects CSV
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                // Validate required fields for projects
                if (!row['Customer'] || !row['Project Name']) {
                  errors.push({
                    row: i + 1,
                    error: 'Missing required fields: Customer and Project Name are required'
                  });
                  continue;
                }

                // Find or create customer
                let customer = await Customer.findOne({ 
                  $or: [
                    { company: row['Customer'] },
                    { name: row['Customer'] }
                  ]
                });

                if (!customer) {
                  customer = new Customer({
                    name: row['Customer'],
                    email: `${row['Customer'].toLowerCase().replace(/\s+/g, '.')}@company.com`,
                    phone: '',
                    company: row['Customer'],
                    address: {},
                    notes: ''
                  });
                  await customer.save();
                }

                // Map project status
                const status = mapProjectStatus(row['Status'] || 'planning');
                const projectType = mapProjectType(row['Project Type'] || 'other');
                const priority = row['Priority']?.toLowerCase() || 'medium';

                // Create project
                const project = new Project({
                  customer: customer._id,
                  projectName: row['Project Name'],
                  projectDescription: row['Description'] || '',
                  projectType: projectType,
                  status: status,
                  priority: priority,
                  startDate: row['Start Date'] ? new Date(row['Start Date']) : null,
                  targetDate: row['Target Date'] ? new Date(row['Target Date']) : null,
                  budget: parseFloat(row['Budget']) || 0,
                  quoteNumber: row['Quote #'] || '',
                  poNumber: row['PO #'] || '',
                  projectManager: row['Project Manager'] || '',
                  technicalLead: row['Technical Lead'] || '',
                  notes: row['Notes'] || ''
                });

                await project.save();
                successCount++;

              } catch (error) {
                errors.push({
                  row: i + 1,
                  error: error.message
                });
              }
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            msg: `${csvType} CSV processing completed`,
            summary: {
              totalProcessed: processedCount,
              successful: successCount,
              errors: errors.length
            },
            errors: errors
          });

        } catch (error) {
          // Clean up uploaded file on error
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          res.status(500).json({ msg: 'Error processing CSV file', error: error.message });
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file on error
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ msg: 'Error reading CSV file', error: error.message });
      });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ msg: 'Server error during CSV upload', error: error.message });
  }
});

// @route   GET /api/csv/template
// @desc    Download CSV template
// @access  Public
router.get('/template', (req, res) => {
  const { type } = req.query; // 'workorders' or 'projects'
  
  let csvTemplate = '';
  let filename = '';
  
  if (type === 'projects') {
    csvTemplate = `Customer,Project Name,Description,Project Type,Status,Priority,Start Date,Target Date,Budget,Quote #,PO #,Project Manager,Technical Lead,Notes
"SC Micro Systems","Wirebond Assembly Project","High-precision wirebond assembly for sensor modules","wirebond","active","high","2024-01-15","2024-03-15","50000","Q-2024-001","PO-2024-001","John Smith","Dr. Johnson","Critical project for aerospace client"
"One Health Biosensing","Die Attach Development","Development of new die attach process for medical devices","die-attach","planning","medium","2024-02-01","2024-04-01","30000","Q-2024-002","","Jane Doe","Dr. Williams","Medical device certification required"
"Sutter Hybrids","Flip Chip Assembly","Flip chip assembly for automotive applications","flip-chip","active","high","2024-01-20","2024-02-20","75000","Q-2024-003","PO-2024-002","Mike Brown","Sarah Wilson","Automotive grade requirements"
"CSpeed","Encapsulation Testing","Testing of new encapsulation materials","encapsulation","on-hold","low","2024-03-01","2024-05-01","15000","Q-2024-004","","Lisa Chen","Tom Davis","Waiting for material approval"`;
    filename = 'projects-template.csv';
  } else {
    // Default to work orders template
    csvTemplate = `,Date Entered,Company Name,Contact,Status,Quote #,QTY,PO#,Invoice #, Amt Invoiced ($) ,Status2
"1","7/18/2024","sonus micro systems","Fatemeh","8. NO Response (>60 days)","","","","","","9/5:  Need to follow up - Rhia
7/26: Design is currently at the circuit level (will contact us when ready)"
"2","7/18/2024","One health Biosensing","Dan Goldner","8. NO Response (>60 days)","","","","","","9/6:  Alternate epoxy to Chase
9/5:  Follow up - Rizza
8/19: Waiting for the 2 way NDA from paulo"
"3","7/30/2024","Sutter Hybrids","Josue Herrera","1. INQUIRY","","","","","","9/6:  Check back in 4-5 months
9/5:  Need to followed up
8/28: Had a meeting to touch basis"`;
    filename = 'work-orders-template.csv';
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvTemplate);
});

module.exports = router; 