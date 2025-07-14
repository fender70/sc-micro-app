const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const WorkRequest = require('../models/WorkRequest');
const Customer = require('../models/Customer');

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
// @desc    Upload CSV file with work order data
// @access  Public
router.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No CSV file uploaded' });
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
          // Process each row
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            processedCount++;

            try {
              // Validate required fields
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
                  notes: ''
                });
                await customer.save();
              }

              // Create work request
              const workRequest = new WorkRequest({
                customer: customer._id,
                workRequestDetails: `Work order for ${row['Company Name']} - QTY: ${row['QTY'] || '1'}`,
                quoteNumber: row['Quote #'] || '',
                poNumber: row['PO#'] || '',
                scMicroReport: '',
                invoiceNumber: row['Invoice#'] || '',
                shipDate: row['Date Entered'] ? new Date(row['Date Entered']) : null,
                status: row['Status'] ? row['Status'].toLowerCase() : 'pending'
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

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            msg: 'CSV processing completed',
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
  const csvTemplate = `Date Entered,Company Name,Contact,Status,Quote #,QTY,PO#,Invoice#
"2024-01-15","TechCorp Industries","John Smith","Pending","XERO-2024-001","1","PO-2024-001",""
"2024-01-16","Innovate Solutions","Sarah Johnson","In Progress","XERO-2024-002","2","PO-2024-002","INV-2024-002"
"2024-01-17","Startup.io","Mike Chen","Completed","XERO-2024-003","1","PO-2024-003","INV-2024-003"`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="work-orders-template.csv"');
  res.send(csvTemplate);
});

module.exports = router; 