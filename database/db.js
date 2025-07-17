import Database from 'better-sqlite3';
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
        try {
            // Create database directory if it doesn't exist
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Connect to SQLite database
            this.db = new Database(this.dbPath);
            
            // Enable foreign keys
            this.db.pragma('foreign_keys = ON');
            
            // Read and execute schema
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Execute schema statements
            this.db.exec(schema);
            
            console.log('✅ Database initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return false;
        }
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
        const stmt = this.db.prepare('SELECT * FROM customers ORDER BY name');
        return stmt.all();
    }

    /**
     * Get customer by ID
     */
    getCustomerById(id) {
        const stmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
        return stmt.get(id);
    }

    /**
     * Create new customer
     */
    createCustomer(customerData) {
        const stmt = this.db.prepare(`
            INSERT INTO customers (name, tier, contact, email, phone, address)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            customerData.name,
            customerData.tier || 'Bronze',
            customerData.contact || '',
            customerData.email || '',
            customerData.phone || '',
            customerData.address || ''
        );
        return result.lastInsertRowid;
    }

    /**
     * Update customer
     */
    updateCustomer(id, customerData) {
        const stmt = this.db.prepare(`
            UPDATE customers 
            SET name = ?, tier = ?, contact = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            customerData.name,
            customerData.tier,
            customerData.contact,
            customerData.email,
            customerData.phone,
            customerData.address,
            id
        );
    }

    /**
     * Delete customer
     */
    deleteCustomer(id) {
        const stmt = this.db.prepare('DELETE FROM customers WHERE id = ?');
        return stmt.run(id);
    }

    /**
     * Get all work requests
     */
    getWorkRequests() {
        const stmt = this.db.prepare(`
            SELECT wr.*, c.name as customer_name 
            FROM work_requests wr 
            LEFT JOIN customers c ON wr.customer_id = c.id 
            ORDER BY wr.created_date DESC
        `);
        return stmt.all();
    }

    /**
     * Get work request by ID
     */
    getWorkRequestById(id) {
        const stmt = this.db.prepare(`
            SELECT wr.*, c.name as customer_name 
            FROM work_requests wr 
            LEFT JOIN customers c ON wr.customer_id = c.id 
            WHERE wr.id = ?
        `);
        return stmt.get(id);
    }

    /**
     * Create new work request
     */
    createWorkRequest(workRequestData) {
        const stmt = this.db.prepare(`
            INSERT INTO work_requests (
                customer_id, customer_name, project_type, status, priority, 
                description, target_date, quote_number, po_number, budget
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
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
        );
        return result.lastInsertRowid;
    }

    /**
     * Update work request
     */
    updateWorkRequest(id, workRequestData) {
        const stmt = this.db.prepare(`
            UPDATE work_requests 
            SET customer_id = ?, customer_name = ?, project_type = ?, status = ?, 
                priority = ?, description = ?, target_date = ?, quote_number = ?, 
                po_number = ?, budget = ?, actual_cost = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
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
        );
    }

    /**
     * Delete work request
     */
    deleteWorkRequest(id) {
        const stmt = this.db.prepare('DELETE FROM work_requests WHERE id = ?');
        return stmt.run(id);
    }

    /**
     * Get all projects
     */
    getProjects() {
        const stmt = this.db.prepare(`
            SELECT p.*, c.name as customer_name 
            FROM projects p 
            LEFT JOIN customers c ON p.customer_id = c.id 
            ORDER BY p.start_date DESC
        `);
        return stmt.all();
    }

    /**
     * Get project by ID
     */
    getProjectById(id) {
        const stmt = this.db.prepare(`
            SELECT p.*, c.name as customer_name 
            FROM projects p 
            LEFT JOIN customers c ON p.customer_id = c.id 
            WHERE p.id = ?
        `);
        return stmt.get(id);
    }

    /**
     * Create new project
     */
    createProject(projectData) {
        const stmt = this.db.prepare(`
            INSERT INTO projects (
                name, customer_id, customer_name, type, status, priority, 
                budget, start_date, target_date, description, quote_number, 
                po_number, project_manager, technical_lead, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            projectData.name,
            projectData.customer_id,
            projectData.customer_name,
            projectData.type,
            projectData.status || 'active',
            projectData.priority || 'medium',
            projectData.budget,
            projectData.start_date,
            projectData.target_date,
            projectData.description,
            projectData.quote_number,
            projectData.po_number,
            projectData.project_manager,
            projectData.technical_lead,
            projectData.notes
        );
        return result.lastInsertRowid;
    }

    /**
     * Update project
     */
    updateProject(id, projectData) {
        const stmt = this.db.prepare(`
            UPDATE projects 
            SET name = ?, customer_id = ?, customer_name = ?, type = ?, status = ?, 
                priority = ?, budget = ?, actual_cost = ?, start_date = ?, 
                target_date = ?, completion_date = ?, description = ?, quote_number = ?,
                po_number = ?, project_manager = ?, technical_lead = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            projectData.name,
            projectData.customer_id,
            projectData.customer_name,
            projectData.type,
            projectData.status,
            projectData.priority,
            projectData.budget,
            projectData.actual_cost,
            projectData.start_date,
            projectData.target_date,
            projectData.completion_date,
            projectData.description,
            projectData.quote_number,
            projectData.po_number,
            projectData.project_manager,
            projectData.technical_lead,
            projectData.notes,
            id
        );
    }

    /**
     * Delete project
     */
    deleteProject(id) {
        const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
        return stmt.run(id);
    }

    /**
     * Get dashboard metrics
     */
    getDashboardMetrics() {
        // Calculate real-time metrics
        const totalWorkRequests = this.db.prepare('SELECT COUNT(*) as count FROM work_requests').get().count;
        const pendingRequests = this.db.prepare("SELECT COUNT(*) as count FROM work_requests WHERE status = 'pending'").get().count;
        const completedRequests = this.db.prepare("SELECT COUNT(*) as count FROM work_requests WHERE status = 'completed'").get().count;
        const completionRate = totalWorkRequests > 0 ? (completedRequests / totalWorkRequests) : 0;
        
        const totalRevenue = this.db.prepare('SELECT SUM(budget) as total FROM work_requests WHERE budget IS NOT NULL').get().total || 0;
        const activeCustomers = this.db.prepare("SELECT COUNT(DISTINCT customer_id) as count FROM work_requests WHERE status IN ('pending', 'in-progress')").get().count;
        const highPriorityItems = this.db.prepare("SELECT COUNT(*) as count FROM work_requests WHERE priority = 'high' AND status IN ('pending', 'in-progress')").get().count;

        // Calculate average project time (simplified)
        const averageProjectTime = 45; // This could be calculated from actual data

        return {
            total_work_requests: totalWorkRequests,
            pending_requests: pendingRequests,
            completed_requests: completedRequests,
            completion_rate: completionRate,
            average_project_time: averageProjectTime,
            total_revenue: totalRevenue,
            active_customers: activeCustomers,
            high_priority_items: highPriorityItems
        };
    }

    /**
     * Backup database
     */
    backup(backupPath) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        
        const backup = new Database(backupPath);
        this.db.backup(backup);
        backup.close();
        console.log(`✅ Database backed up to: ${backupPath}`);
    }
}

// Create singleton instance
const dbManager = new DatabaseManager();

export default dbManager; 