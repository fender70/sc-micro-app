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
                if (!row['Customer'] || !row['Project Information']) {
                  errors.push({
                    row: i + 1,
                    error: 'Missing required fields: Customer and Project Information are required'
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
                    name: row['PIC Name'] || row['Customer'],
                    email: `${(row['PIC Name'] || row['Customer']).toLowerCase().replace(/\s+/g, '.')}@company.com`,
                    phone: '',
                    company: row['Customer'],
                    address: {},
                    notes: row['Comments'] || ''
                  });
                  await customer.save();
                }

                // Determine project type from project information
                const projectInfo = (row['Project Information'] || '').toLowerCase();
                let projectType = 'other';
                if (projectInfo.includes('wirebond') || projectInfo.includes('wire bond')) {
                  projectType = 'wirebond';
                } else if (projectInfo.includes('die attach') || projectInfo.includes('dieattach')) {
                  projectType = 'die-attach';
                } else if (projectInfo.includes('flip chip') || projectInfo.includes('flipchip')) {
                  projectType = 'flip-chip';
                } else if (projectInfo.includes('encapsulation')) {
                  projectType = 'encapsulation';
                } else if (projectInfo.includes('assembly')) {
                  projectType = 'assembly';
                }

                // Determine status based on completion date and invoice
                let status = 'planning';
                if (row['Completion Date'] && row['Completion Date'].trim() !== '') {
                  status = 'completed';
                } else if (row['Invoice #'] && row['Invoice #'].trim() !== '') {
                  status = 'active';
                } else if (row['Quote #'] && row['Quote #'].trim() !== '') {
                  status = 'active';
                }

                // Parse amount invoiced
                const amountInvoiced = row['Amount Invoiced ($)'] 
                  ? parseFloat(row['Amount Invoiced ($)'].replace(/[$,]/g, '')) 
                  : 0;

                // Create project
                const project = new Project({
                  customer: customer._id,
                  projectName: `Project ${row['SN'] || 'Unknown'} - ${row['Customer']}`,
                  projectDescription: row['Project Information'] || '',
                  projectType: projectType,
                  status: status,
                  priority: 'medium',
                  startDate: null, // Not provided in this format
                  targetDate: null, // Not provided in this format
                  completionDate: row['Completion Date'] ? new Date(row['Completion Date']) : null,
                  budget: amountInvoiced,
                  actualCost: amountInvoiced,
                  quoteNumber: row['Quote #'] || '',
                  poNumber: row['PO#'] || '',
                  invoiceNumber: row['Invoice #'] || '',
                  projectManager: row['PIC Name'] || '',
                  technicalLead: '',
                  notes: row['Comments'] || ''
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
    csvTemplate = `SN,Customer,PIC Name,Quote #,PO#,Invoice #,Amount Invoiced ($),Completion Date,Photo,Project Information,Comments
157,Open Light Photonics,Sheri Wang,QU-24733,INV-2536,INV-2536,"4,965.94",7-Jun,,"Manual remove the singulated die from wafer
Die attach with JM7000 (need to purchase)
Wirebond with 8 wires
Quantity: 100","QU24733
They asked if you can include the price of the epoxy on the quote. I already have a quote on that epoxy.
Please find the attached quote from bond source"
150,Qorvo,James Wang,QU-24732,,,,,,"Eutectic die attach
They will provide the die and heat spreader
Temperature: 340C
Quote Request for 100 and 200 quantity
Schedule:  End of April","QU-24732
This needs to be updated the quote. Only eutectic attach without wirebond"
160,Semi Pac Reclaim,John Mackay,QU-24730,,INV-2521,"3,030.17",4/17/2025,,"Wirebond project. No Die attach
Materials are on-hand.
23 wires
Quantity: 147","QU-24730
Completed project and collected
Need to revise the quote with only 18 wires Wirebonded (top die)
For Payment"
78,AMRF,Qianli Mu,QU-24696,,,,,,"Total number of Assembly – 4
Total number of PCB – 3
Total number of chip – 4
Quantity – 5 each
Total number of wirebond – 12-42",Need to update the quote based on the new information provided (attached file)
163,Cornel University,Jaeyun Moon,QU-24736,,,,,,"Wirebond 2 Devices Al wire
Device 1 – 9 wires
Device 2 – 6 wires",
135,UC Berkeley,Lian Zhou,QU-24718,,,,,,"Photonics chip: 28x5mm
PCB: 61x65mm
Quantity: 1
# of Wires: 8",Request for discount for the NRE Fee
164,Northrop Grumman Corp,Philip Hon,,,,,,,"Solder Ball Flip Chip
What is the smallest solder ball and pitch we have?",Request for quote for quantity 1 and quantity 10
165,University of Texas (Dallas),Naeeme Modir,,,,,,,"Die Attach with conductive epoxy
Substrate Material: ENIG
Size of LED: 300-400 um 
Chip Thickness: 85-200 um 
Total Wire #: 76
Encapsulation",Request for quote for quantity of 1
180,WUSTL.EDU,"Undavalli, Aswin Chowdary",QU-24753,,,,,,"Wirebond total of 5 boards
- 3 boards with encapsulation
- 2 boards with no encapsulation

Total of wirebonds: 145 wirs
2 layer of looping",
162,QUINSTAR,Wesley Louie,,,,,,,**ask for solder ball size or does the chip already have C4 bumps?  Details,
163,Northeastern.Edu,Yi Zhuang,QU-24754,,,,,,"Green lines are high frequency
signal lines
White are DC lines
Yellow are GND lines
- 5-10 chip needs to be bond in total.
- Preferred die bonding process: Epoxy (conductive)
- Wire type: Gold 0.8mil
- Encapsulation: UV cure (clear epoxy)",
186,Edward Life Sciences,Thaer Alafghani,QU-24755,,,,,,"Request a quote for 12 units build. They already ship the parts: ASICs, MEMS, and PCBs
Similar build as before.
They send die with completed bump ball on it.",
182,Texas Instruments,Yande Peng,QU-24752,,,,,,He is asking if the Quote still the same if the the connector needs to be the solder.,QU-24752
187,Texas Instruments,Yu Yao,,,,,,,"Ask if the NRE fee still apply to this, almost similar to previous build
Build 3x PCBs with 2 die
Die attach
wire bond 6 wires each PCB
Encapsulation of wires",
188,Edward Life Sciences,Thaer Alafghani,,,,,,,"Soldering - components
Die attach - 2 die
wire bond - 16 wires",`;
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