import express from 'express';
import cors from 'cors';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import dbManager from '../database/db.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({ 
    dest: 'uploads/',
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

/**
 * Parse CSV file and return array of objects
 */
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Clean up the temporary file
                fs.unlinkSync(filePath);
                resolve(results);
            })
            .on('error', (error) => {
                // Clean up the temporary file
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                reject(error);
            });
    });
}

/**
 * Process work orders CSV data
 */
async function processWorkOrders(csvData) {
    const results = {
        processed: 0,
        added: 0,
        updated: 0,
        errors: []
    };

    for (const row of csvData) {
        try {
            results.processed++;
            
            // Map CSV columns to database fields
            const workRequestData = {
                customer_name: row['Customer'],
                project_type: determineProjectType(row['Project Information'] || row['Comments']),
                status: determineStatusFromData(row),
                priority: determinePriorityFromData(row),
                description: row['Project Information'] || row['Comments'],
                created_date: row['Completion Date'] || new Date().toISOString().split('T')[0],
                target_date: row['Completion Date'] || null,
                quote_number: row['Quote #'],
                po_number: row['PO#'],
                budget: parseFloat(row['Amount Invoiced ($)']?.replace(/[,$]/g, '')) || null
            };

            // Find or create customer
            let customer = await findOrCreateCustomer(workRequestData.customer_name);
            workRequestData.customer_id = customer.id;

            // Check if work request already exists (by quote number)
            if (workRequestData.quote_number) {
                const existingRequests = await dbManager.getWorkRequests();
                const existing = existingRequests.find(r => r.quote_number === workRequestData.quote_number);
                
                if (existing) {
                    // Update existing work request
                    await dbManager.updateWorkRequest(existing.id, workRequestData);
                    results.updated++;
                } else {
                    // Create new work request
                    await dbManager.createWorkRequest(workRequestData);
                    results.added++;
                }
            } else {
                // Create new work request without quote number
                await dbManager.createWorkRequest(workRequestData);
                results.added++;
            }
        } catch (error) {
            results.errors.push(`Row ${results.processed}: ${error.message}`);
        }
    }

    return results;
}

/**
 * Process projects CSV data
 */
async function processProjects(csvData) {
    const results = {
        processed: 0,
        added: 0,
        updated: 0,
        errors: []
    };

    for (const row of csvData) {
        try {
            results.processed++;
            
            // Map CSV columns to project fields
            const projectData = {
                name: `${row['Customer']} - ${row['Project Information']?.substring(0, 50) || 'Project'}`,
                type: determineProjectType(row['Project Information'] || row['Comments']),
                status: mapStatus(determineStatusFromData(row)),
                priority: mapPriority(determinePriorityFromData(row)),
                budget: parseFloat(row['Amount Invoiced ($)']?.replace(/[,$]/g, '')) || null,
                start_date: row['Completion Date'] || new Date().toISOString().split('T')[0],
                target_date: row['Completion Date'] || null,
                description: row['Project Information'] || row['Comments'],
                quote_number: row['Quote #'],
                po_number: row['PO#'],
                project_manager: row['PIC Name'] || '',
                technical_lead: row['PIC Name'] || '',
                notes: row['Comments'] || ''
            };

            // Find or create customer
            let customer = await findOrCreateCustomer(row['Customer']);
            projectData.customer_id = customer.id;
            projectData.customer_name = customer.name;

            // Check if project already exists (by quote number or name and customer)
            const existingProjects = await dbManager.getProjects();
            const existing = existingProjects.find(p => 
                (p.quote_number && p.quote_number === projectData.quote_number) ||
                (p.name === projectData.name && p.customer_id === projectData.customer_id)
            );
            
            if (existing) {
                // Update existing project
                await dbManager.updateProject(existing.id, projectData);
                results.updated++;
            } else {
                // Create new project
                await dbManager.createProject(projectData);
                results.added++;
            }
        } catch (error) {
            results.errors.push(`Row ${results.processed}: ${error.message}`);
        }
    }

    return results;
}

/**
 * Find or create customer
 */
async function findOrCreateCustomer(customerName) {
    if (!customerName) {
        throw new Error('Customer name is required');
    }

    const customers = await dbManager.getCustomers();
    let customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    
    if (!customer) {
        // Create new customer with default values
        const customerId = await dbManager.createCustomer({
            name: customerName,
            tier: 'Bronze',
            contact: '',
            email: '',
            phone: '',
            address: ''
        });
        customer = await dbManager.getCustomerById(customerId);
    }
    
    return customer;
}

/**
 * Determine project type from description
 */
function determineProjectType(description) {
    if (!description) return 'wirebond';
    
    const desc = description.toLowerCase();
    if (desc.includes('wirebond') || desc.includes('wire bond')) return 'wirebond';
    if (desc.includes('die attach') || desc.includes('die-attach')) return 'die_attach';
    if (desc.includes('flip chip') || desc.includes('flip-chip')) return 'flip_chip';
    if (desc.includes('encapsulation') || desc.includes('package')) return 'encapsulation';
    
    return 'wirebond'; // default
}

/**
 * Map status from CSV to database format
 */
function mapStatus(status) {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending') || statusLower.includes('quoted')) return 'pending';
    if (statusLower.includes('active') || statusLower.includes('in-progress')) return 'in-progress';
    if (statusLower.includes('completed') || statusLower.includes('shipped')) return 'completed';
    if (statusLower.includes('on-hold') || statusLower.includes('hold')) return 'on-hold';
    if (statusLower.includes('planning')) return 'planning';
    
    return 'pending'; // default
}

/**
 * Map priority from CSV to database format
 */
function mapPriority(priority) {
    if (!priority) return 'medium';
    
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('high') || priorityLower.includes('urgent')) return 'high';
    if (priorityLower.includes('low')) return 'low';
    
    return 'medium'; // default
}

/**
 * Determine priority from status
 */
function determinePriority(status) {
    if (!status) return 'medium';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('urgent') || statusLower.includes('critical')) return 'high';
    if (statusLower.includes('low')) return 'low';
    
    return 'medium'; // default
}

/**
 * Determine status from CSV data
 */
function determineStatusFromData(row) {
    // If there's an invoice number and completion date, it's likely completed
    if (row['Invoice #'] && row['Completion Date']) {
        return 'completed';
    }
    // If there's a quote number but no invoice, it's likely pending
    if (row['Quote #'] && !row['Invoice #']) {
        return 'pending';
    }
    // If there's a PO number, it might be in progress
    if (row['PO#']) {
        return 'in-progress';
    }
    return 'pending'; // default
}

/**
 * Determine priority from CSV data
 */
function determinePriorityFromData(row) {
    // Check if it's a university (often lower priority)
    const customer = row['Customer']?.toLowerCase() || '';
    if (customer.includes('university') || customer.includes('edu')) {
        return 'low';
    }
    // Check if it's a large company (often higher priority)
    if (customer.includes('texas instruments') || customer.includes('northrop grumman')) {
        return 'high';
    }
    return 'medium'; // default
}

// CSV Upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const csvType = req.body.type || 'workorders';
        console.log(`Processing ${csvType} CSV upload: ${req.file.originalname}`);

        // Parse CSV file
        const csvData = await parseCSV(req.file.path);
        
        if (csvData.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty or invalid' });
        }

        // Process data based on type
        let results;
        if (csvType === 'projects') {
            results = await processProjects(csvData);
        } else {
            results = await processWorkOrders(csvData);
        }

        console.log(`CSV upload completed: ${results.processed} processed, ${results.added} added, ${results.updated} updated`);

        res.json({
            message: 'CSV uploaded and processed successfully',
            processed: results.processed,
            added: results.added,
            updated: results.updated,
            errors: results.errors.length > 0 ? results.errors : undefined
        });

    } catch (error) {
        console.error('CSV upload error:', error);
        res.status(500).json({ 
            error: 'CSV upload failed', 
            message: error.message 
        });
    }
});

export default router; 