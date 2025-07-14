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
              if (!row['Customer'] || !row['PIC Name']) {
                errors.push({
                  row: i + 1,
                  error: 'Missing required fields: Customer and PIC Name are required'
                });
                continue;
              }

              // Find or create customer
              let customer = await Customer.findOne({ 
                company: row['Customer'],
                name: row['PIC Name']
              });

              if (!customer) {
                customer = new Customer({
                  name: row['PIC Name'],
                  email: `${row['PIC Name'].toLowerCase().replace(/\s+/g, '.')}@${row['Customer'].toLowerCase().replace(/\s+/g, '')}.com`,
                  phone: '',
                  company: row['Customer'],
                  address: {},
                  notes: row['Comments'] || ''
                });
                await customer.save();
              }

              // Determine status based on completion date and invoice
              let status = 'pending';
              if (row['Invoice #'] && row['Invoice #'].trim() !== '') {
                status = 'completed';
              } else if (row['Completion Date'] && row['Completion Date'].trim() !== '') {
                status = 'in-progress';
              }

              // Create work request
              const workRequest = new WorkRequest({
                customer: customer._id,
                workRequestDetails: row['Project Information'] || `Project for ${row['Customer']}`,
                quoteNumber: row['Quote #'] || '',
                poNumber: row['PO#'] || '',
                scMicroReport: row['Photo'] || '',
                invoiceNumber: row['Invoice #'] || '',
                shipDate: row['Completion Date'] ? new Date(row['Completion Date']) : null,
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
  const csvTemplate = `SN,Customer,PIC Name,Quote #,PO#,Invoice #,Amount Invoiced ($),Completion Date,Photo,Project Information,Comments
"157","Open Light Photonics","Sheri Wang","QU-24733","INV-2536","INV-2536","4,965.94","7-Jun","","Manual remove the singulated die from wafer","QU24733"
"150","Qorvo","James Wang","QU-24732","","","","","","Eutectic die attach","QU-24732"
"160","Semi Pac Reclaim","John Mackay","QU-24730","","INV-2521","3,030.17","4/17/2025","","Wirebond project. No Die attach","QU-24730"`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="work-orders-template.csv"');
  res.send(csvTemplate);
});

module.exports = router; 