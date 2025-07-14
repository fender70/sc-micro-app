const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const WorkRequest = require('../models/WorkRequest');
const Customer = require('../models/Customer');

// Status mapping function
const mapStatus = (status) => {
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
  const csvTemplate = `,Date Entered,Company Name,Contact,Status,Quote #,QTY,PO#,Invoice #, Amt Invoiced ($) ,Status2
"1","7/18/2024","sonus micro systems","Fatemeh","8. NO Response (>60 days)","","","","","","9/5:  Need to follow up - Rhia
7/26: Design is currently at the circuit level (will contact us when ready)"
"2","7/18/2024","One health Biosensing","Dan Goldner","8. NO Response (>60 days)","","","","","","9/6:  Alternate epoxy to Chase
9/5:  Follow up - Rizza
8/19: Waiting for the 2 way NDA from paulo
9/11: Create SOW 
9/12: SOW Completed - to be review by Rizza
9/27: Follow up on the old PCB and die. Have we send the test proposal?
10/4: Followed up - Replied: Asking for test proposal"
"3","7/30/2024","Sutter Hybrids","Josue Herrera","1. INQUIRY","","","","","","9/6:  Check back in 4-5 months
9/5:  Need to followed up
8/28: Had a meeting to touch basis"
"4","7/31/2024","CSpeed","Gary Yi","8. NO Response (>60 days)","","","","","","8/2:  In Design phase and currently searching for an assembly house
8/13: Followed up - will contact us when ready"
"5","8/1/2024","Senseeker Corp","Zach Korth","3. PO Received","","","","","","9/5:  Reach out end of the year or early next
11/5: Inquire about capability on bigger board.
1/6: To follow up
1/14: Online discussion of the project
1/24: In process to include S&C to their approved vendor
1/31: Received the parts
2/21: Project completed and shipped"`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="work-orders-template.csv"');
  res.send(csvTemplate);
});

module.exports = router; 