import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, 'sc_micro.db');
    }

    /**
     * Initialize the database connection and create tables
     */
    initialize() {
        return new Promise((resolve, reject) => {
            try {
                // Create database directory if it doesn't exist
                const dbDir = path.dirname(this.dbPath);
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                // Connect to SQLite database
                this.db = new sqlite3.Database(this.dbPath, (err) => {
                    if (err) {
                        console.error('❌ Database connection failed:', err);
                        reject(err);
                        return;
                    }

                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON', (err) => {
                        if (err) {
                            console.error('❌ Failed to enable foreign keys:', err);
                        }

                        // Read and execute schema
                        const schemaPath = path.join(__dirname, 'schema.sql');
                        const schema = fs.readFileSync(schemaPath, 'utf8');
                        
                        // Execute schema statements
                        this.db.exec(schema, (err) => {
                            if (err) {
                                console.error('❌ Database schema execution failed:', err);
                                reject(err);
                                return;
                            }
                            
                            console.log('✅ Database initialized successfully');
                            resolve(true);
                        });
                    });
                });
            } catch (error) {
                console.error('❌ Database initialization failed:', error);
                reject(error);
            }
        });
    }

    /**
     * Get database instance
     */
    getDatabase() {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            console.log('🔒 Database connection closed');
        }
    }

    /**
     * Get all customers
     */
    getCustomers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM customers ORDER BY name', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get customer by ID
     */
    getCustomerById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Create new customer
     */
    createCustomer(customerData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO customers (name, tier, contact, email, phone, address)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const params = [
                customerData.name,
                customerData.tier || 'Bronze',
                customerData.contact || '',
                customerData.email || '',
                customerData.phone || '',
                customerData.address || ''
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    /**
     * Update customer
     */
    updateCustomer(id, customerData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE customers 
                SET name = ?, tier = ?, contact = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                customerData.name,
                customerData.tier,
                customerData.contact,
                customerData.email,
                customerData.phone,
                customerData.address,
                id
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete customer
     */
    deleteCustomer(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    /**
     * Get all work requests
     */
    getWorkRequests() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT wr.*, c.name as customer_name 
                FROM work_requests wr 
                LEFT JOIN customers c ON wr.customer_id = c.id 
                ORDER BY wr.created_date DESC
            `;
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get work request by ID
     */
    getWorkRequestById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT wr.*, c.name as customer_name 
                FROM work_requests wr 
                LEFT JOIN customers c ON wr.customer_id = c.id 
                WHERE wr.id = ?
            `;
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Create new work request
     */
    createWorkRequest(workRequestData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO work_requests (
                    customer_id, customer_name, project_type, status, priority, 
                    description, target_date, quote_number, po_number, budget
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                workRequestData.customer_id,
                workRequestData.customer_name,
                workRequestData.project_type,
                workRequestData.status || 'pending',
                workRequestData.priority || 'medium',
                workRequestData.description,
                workRequestData.target_date,
                workRequestData.quote_number,
                workRequestData.po_number,
                workRequestData.budget
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    /**
     * Update work request
     */
    updateWorkRequest(id, workRequestData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE work_requests 
                SET customer_id = ?, customer_name = ?, project_type = ?, status = ?, 
                    priority = ?, description = ?, target_date = ?, quote_number = ?, 
                    po_number = ?, budget = ?, actual_cost = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                workRequestData.customer_id,
                workRequestData.customer_name,
                workRequestData.project_type,
                workRequestData.status,
                workRequestData.priority,
                workRequestData.description,
                workRequestData.target_date,
                workRequestData.quote_number,
                workRequestData.po_number,
                workRequestData.budget,
                workRequestData.actual_cost,
                workRequestData.notes,
                id
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete work request
     */
    deleteWorkRequest(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM work_requests WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    /**
     * Get all projects
     */
    getProjects() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, c.name as customer_name 
                FROM projects p 
                LEFT JOIN customers c ON p.customer_id = c.id 
                ORDER BY p.start_date DESC
            `;
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get project by ID
     */
    getProjectById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, c.name as customer_name 
                FROM projects p 
                LEFT JOIN customers c ON p.customer_id = c.id 
                WHERE p.id = ?
            `;
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Create new project
     */
    createProject(projectData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO projects (
                    customer_id, customer_name, project_name, project_type, status, 
                    priority, description, start_date, end_date, budget, 
                    quote_number, po_number, manager, team_members, notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                projectData.customer_id,
                projectData.customer_name,
                projectData.project_name,
                projectData.project_type,
                projectData.status || 'planning',
                projectData.priority || 'medium',
                projectData.description,
                projectData.start_date,
                projectData.end_date,
                projectData.budget,
                projectData.quote_number,
                projectData.po_number,
                projectData.manager,
                projectData.team_members,
                projectData.notes
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    /**
     * Update project
     */
    updateProject(id, projectData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE projects 
                SET customer_id = ?, customer_name = ?, project_name = ?, project_type = ?, 
                    status = ?, priority = ?, description = ?, start_date = ?, end_date = ?, 
                    budget = ?, quote_number = ?, po_number = ?, manager = ?, 
                    team_members = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                projectData.customer_id,
                projectData.customer_name,
                projectData.project_name,
                projectData.project_type,
                projectData.status,
                projectData.priority,
                projectData.description,
                projectData.start_date,
                projectData.end_date,
                projectData.budget,
                projectData.quote_number,
                projectData.po_number,
                projectData.manager,
                projectData.team_members,
                projectData.notes,
                id
            ];
            
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete project
     */
    deleteProject(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    /**
     * Get dashboard metrics
     */
    getDashboardMetrics() {
        return new Promise((resolve, reject) => {
            const metrics = {};
            
            // Get customer count
            this.db.get('SELECT COUNT(*) as count FROM customers', (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                metrics.totalCustomers = result.count;
                
                // Get work request count
                this.db.get('SELECT COUNT(*) as count FROM work_requests', (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    metrics.totalWorkRequests = result.count;
                    
                    // Get project count
                    this.db.get('SELECT COUNT(*) as count FROM projects', (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        metrics.totalProjects = result.count;
                        
                        // Get pending work requests
                        this.db.get('SELECT COUNT(*) as count FROM work_requests WHERE status = "pending"', (err, result) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            metrics.pendingWorkRequests = result.count;
                            
                            // Get active projects
                            this.db.get('SELECT COUNT(*) as count FROM projects WHERE status = "active"', (err, result) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                metrics.activeProjects = result.count;
                                
                                resolve(metrics);
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Backup database
     */
    backup(backupPath) {
        return new Promise((resolve, reject) => {
            const backupDb = new sqlite3.Database(backupPath);
            this.db.backup(backupDb, (err) => {
                if (err) {
                    reject(err);
                } else {
                    backupDb.close();
                    resolve(true);
                }
            });
        });
    }
}

// Create and export singleton instance
const dbManager = new DatabaseManager();
export default dbManager; 