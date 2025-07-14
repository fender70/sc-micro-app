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
    name: 'Fatemeh',
    email: 'fatemeh@sonusmicrosystems.com',
    phone: '+1 (555) 123-4567',
    company: 'sonus micro systems',
    address: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    notes: '9/5:  Need to follow up - Rhia\n7/26: Design is currently at the circuit level (will contact us when ready)'
  },
  {
    name: 'Dan Goldner',
    email: 'dan.goldner@onehealthbiosensing.com',
    phone: '+1 (555) 987-6543',
    company: 'One health Biosensing',
    address: {
      street: '456 Business Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    notes: '9/6:  Alternate epoxy to Chase\n9/5:  Follow up - Rizza\n8/19: Waiting for the 2 way NDA from paulo\n9/11: Create SOW\n9/12: SOW Completed - to be review by Rizza\n9/27: Follow up on the old PCB and die. Have we send the test proposal?\n10/4: Followed up - Replied: Asking for test proposal'
  },
  {
    name: 'Josue Herrera',
    email: 'josue.herrera@sutterhybrids.com',
    phone: '+1 (555) 456-7890',
    company: 'Sutter Hybrids',
    address: {
      street: '789 Startup Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    notes: '9/6:  Check back in 4-5 months\n9/5:  Need to followed up\n8/28: Had a meeting to touch basis'
  },
  {
    name: 'Gary Yi',
    email: 'gary.yi@cspeed.com',
    phone: '+1 (555) 234-5678',
    company: 'CSpeed',
    address: {
      street: '321 Tech Avenue',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110',
      country: 'USA'
    },
    notes: '8/2:  In Design phase and currently searching for an assembly house\n8/13: Followed up - will contact us when ready'
  },
  {
    name: 'Zach Korth',
    email: 'zach.korth@senseekercorp.com',
    phone: '+1 (555) 345-6789',
    company: 'Senseeker Corp',
    address: {
      street: '654 Engineering Road',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA'
    },
    notes: '9/5:  Reach out end of the year or early next\n11/5: Inquire about capability on bigger board.\n1/6: To follow up\n1/14: Online discussion of the project\n1/24: In process to include S&C to their approved vendor\n1/31: Received the parts\n2/21: Project completed and shipped'
  },
  {
    name: 'Sheri Wang',
    email: 'sheri.wang@openlightphotonics.com',
    phone: '+1 (555) 567-8901',
    company: 'Open Light Photonics',
    address: {
      street: '987 Photonics Lane',
      city: 'Boston',
      state: 'MA',
      zipCode: '02108',
      country: 'USA'
    },
    notes: 'QU24733\nThey asked if you can include the price of the epoxy on the quote. I already have a quote on that epoxy.\nPlease find the attached quote from bond source'
  },
  {
    name: 'James Wang',
    email: 'james.wang@qorvo.com',
    phone: '+1 (555) 678-9012',
    company: 'Qorvo',
    address: {
      street: '147 Semiconductor Drive',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      country: 'USA'
    },
    notes: 'QU-24732\nThis needs to be updated the quote. Only eutectic attach without wirebond'
  },
  {
    name: 'John Mackay',
    email: 'john.mackay@semipacreclaim.com',
    phone: '+1 (555) 789-0123',
    company: 'Semi Pac Reclaim',
    address: {
      street: '258 Reclaim Street',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    notes: 'QU-24730\nCompleted project and collected\nNeed to revise the quote with only 18 wires Wirebonded (top die)\nFor Payment'
  }
];

const sampleWorkRequests = [
  {
    workRequestDetails: 'Project for sonus micro systems - 9/5:  Need to follow up - Rhia\n7/26: Design is currently at the circuit level (will contact us when ready)',
    quoteNumber: '',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: new Date('2024-07-18'),
    status: 'pending'
  },
  {
    workRequestDetails: 'Project for One health Biosensing - 9/6:  Alternate epoxy to Chase\n9/5:  Follow up - Rizza\n8/19: Waiting for the 2 way NDA from paulo\n9/11: Create SOW\n9/12: SOW Completed - to be review by Rizza\n9/27: Follow up on the old PCB and die. Have we send the test proposal?\n10/4: Followed up - Replied: Asking for test proposal',
    quoteNumber: '',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: new Date('2024-07-18'),
    status: 'pending'
  },
  {
    workRequestDetails: 'Project for Sutter Hybrids - 9/6:  Check back in 4-5 months\n9/5:  Need to followed up\n8/28: Had a meeting to touch basis',
    quoteNumber: '',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: new Date('2024-07-30'),
    status: 'pending'
  },
  {
    workRequestDetails: 'Project for CSpeed - 8/2:  In Design phase and currently searching for an assembly house\n8/13: Followed up - will contact us when ready',
    quoteNumber: '',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: new Date('2024-07-31'),
    status: 'pending'
  },
  {
    workRequestDetails: 'Project for Senseeker Corp - 9/5:  Reach out end of the year or early next\n11/5: Inquire about capability on bigger board.\n1/6: To follow up\n1/14: Online discussion of the project\n1/24: In process to include S&C to their approved vendor\n1/31: Received the parts\n2/21: Project completed and shipped',
    quoteNumber: '',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: new Date('2024-08-01'),
    status: 'po-received'
  },
  {
    workRequestDetails: 'Project for Open Light Photonics - QU24733\nThey asked if you can include the price of the epoxy on the quote. I already have a quote on that epoxy.\nPlease find the attached quote from bond source',
    quoteNumber: 'QU-24733',
    poNumber: 'INV-2536',
    scMicroReport: '',
    invoiceNumber: 'INV-2536',
    shipDate: new Date('2024-04-08'),
    status: 'completed'
  },
  {
    workRequestDetails: 'Project for Qorvo - QU-24732\nThis needs to be updated the quote. Only eutectic attach without wirebond',
    quoteNumber: 'QU-24732',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: '',
    shipDate: new Date('2024-04-01'),
    status: 'quoted'
  },
  {
    workRequestDetails: 'Project for Semi Pac Reclaim - QU-24730\nCompleted project and collected\nNeed to revise the quote with only 18 wires Wirebonded (top die)\nFor Payment',
    quoteNumber: 'QU-24730',
    poNumber: '',
    scMicroReport: '',
    invoiceNumber: 'INV-2521',
    shipDate: new Date('2024-04-11'),
    status: 'completed'
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
    
    console.log('\nSample customers:');
    customers.forEach(customer => {
      console.log(`- ${customer.company} (${customer.name})`);
    });
    
    console.log('\nSample work requests:');
    workRequests.forEach(request => {
      console.log(`- ${request.workRequestDetails.substring(0, 50)}... (${request.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 