-- SC Micro Enterprise System Database Schema

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tier TEXT DEFAULT 'Bronze',
    total_projects INTEGER DEFAULT 0,
    completion_rate REAL DEFAULT 0.0,
    total_value REAL DEFAULT 0.0,
    contact TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Work Requests table
CREATE TABLE IF NOT EXISTS work_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    quote_number TEXT,
    po_number TEXT,
    budget REAL,
    actual_cost REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    customer_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    budget REAL,
    actual_cost REAL,
    start_date DATE,
    target_date DATE,
    completion_date DATE,
    description TEXT,
    quote_number TEXT,
    po_number TEXT,
    project_manager TEXT,
    technical_lead TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
);

-- Dashboard metrics table (for caching calculated metrics)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT UNIQUE NOT NULL,
    metric_value TEXT NOT NULL,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT OR IGNORE INTO customers (id, name, tier, total_projects, completion_rate, total_value, contact, email) VALUES
(1, 'TechCorp Industries', 'Premium', 15, 0.95, 250000, 'John Smith', 'john.smith@techcorp.com'),
(2, 'Innovate Solutions', 'Gold', 8, 0.88, 120000, 'Sarah Johnson', 'sarah.j@innovate.com'),
(3, 'MicroTech Systems', 'Silver', 5, 0.82, 75000, 'Mike Chen', 'mike.chen@microtech.com');

INSERT OR IGNORE INTO work_requests (id, customer_id, customer_name, project_type, status, priority, description, created_date, target_date, quote_number, po_number, budget) VALUES
(1, 1, 'TechCorp Industries', 'wirebond', 'in-progress', 'high', 'High-frequency wirebond assembly for RF chips', '2024-01-15', '2024-02-15', 'Q-2024-001', 'PO-2024-001', 25000),
(2, 2, 'Innovate Solutions', 'die_attach', 'pending', 'medium', 'Die attach for MEMS sensor packaging', '2024-01-20', '2024-03-01', 'Q-2024-002', 'PO-2024-002', 18000),
(3, 1, 'TechCorp Industries', 'flip_chip', 'completed', 'high', 'Flip chip assembly for advanced processors', '2024-01-10', '2024-02-10', 'Q-2024-003', 'PO-2024-003', 35000);

INSERT OR IGNORE INTO projects (id, name, customer_id, customer_name, type, status, priority, budget, actual_cost, start_date, target_date, description, quote_number, po_number, project_manager, technical_lead, notes) VALUES
(1, 'Wirebond Assembly Project', 1, 'TechCorp Industries', 'wirebond', 'active', 'high', 50000, 23000, '2024-01-15', '2024-03-15', 'High-precision wirebond assembly for sensor modules', 'Q-2024-001', 'PO-2024-001', 'John Smith', 'Dr. Johnson', 'Critical project for aerospace client'),
(2, 'Die Attach Development', 2, 'Innovate Solutions', 'die_attach', 'planning', 'medium', 30000, 12000, '2024-02-01', '2024-04-01', 'Development of new die attach process for medical devices', 'Q-2024-002', '', 'Jane Doe', 'Dr. Williams', 'Medical device certification required'),
(3, 'Flip Chip Assembly', 1, 'TechCorp Industries', 'flip_chip', 'active', 'high', 75000, 28000, '2024-01-20', '2024-02-20', 'Flip chip assembly for automotive applications', 'Q-2024-003', 'PO-2024-002', 'Mike Brown', 'Sarah Wilson', 'Automotive grade requirements');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_requests_customer_id ON work_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_status ON work_requests(status);
CREATE INDEX IF NOT EXISTS idx_work_requests_priority ON work_requests(priority);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier); 