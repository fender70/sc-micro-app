const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const WorkRequest = require('./models/WorkRequest');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sc-micro-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleCustomers = [
  {
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Industries',
    address: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    notes: 'Preferred contact method: email'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@innovate.com',
    phone: '+1 (555) 987-6543',
    company: 'Innovate Solutions',
    address: {
      street: '456 Business Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    notes: 'High priority customer'
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@startup.io',
    phone: '+1 (555) 456-7890',
    company: 'Startup.io',
    address: {
      street: '789 Startup Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    notes: 'New customer, needs onboarding'
  }
];

const sampleWorkRequests = [
  {
    workRequestDetails: 'PCB design and manufacturing for IoT sensor module with wireless connectivity',
    quoteNumber: 'XERO-2024-001',
    poNumber: 'PO-2024-001',
    scMicroReport: 'https://example.com/reports/iot-sensor-pcb.pdf',
    invoiceNumber: 'INV-2024-001',
    shipDate: '2024-02-15',
    status: 'completed'
  },
  {
    workRequestDetails: 'Custom microcontroller programming for industrial automation system',
    quoteNumber: 'XERO-2024-002',
    poNumber: 'PO-2024-002',
    scMicroReport: 'https://example.com/reports/microcontroller-programming.pdf',
    invoiceNumber: 'INV-2024-002',
    shipDate: '2024-02-20',
    status: 'shipped'
  },
  {
    workRequestDetails: 'Prototype development for wearable health monitoring device',
    quoteNumber: 'XERO-2024-003',
    poNumber: 'PO-2024-003',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: null,
    status: 'in-progress'
  },
  {
    workRequestDetails: 'Circuit board testing and quality assurance for automotive components',
    quoteNumber: 'XERO-2024-004',
    poNumber: 'PO-2024-004',
    scMicroReport: 'https://example.com/reports/automotive-testing.pdf',
    invoiceNumber: 'INV-2024-004',
    shipDate: '2024-02-10',
    status: 'completed'
  },
  {
    workRequestDetails: 'RF module design and integration for smart home system',
    quoteNumber: 'XERO-2024-005',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: null,
    status: 'pending'
  }
];

async function seedData() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await Customer.deleteMany({});
    await WorkRequest.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert customers
    const customers = await Customer.insertMany(sampleCustomers);
    console.log(`Inserted ${customers.length} customers`);
    
    // Insert work requests with customer references
    const workRequestsWithCustomers = sampleWorkRequests.map((request, index) => ({
      ...request,
      customer: customers[index % customers.length]._id
    }));
    
    const workRequests = await WorkRequest.insertMany(workRequestsWithCustomers);
    console.log(`Inserted ${workRequests.length} work requests`);
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${customers.length} customers`);
    console.log(`- ${workRequests.length} work requests`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 