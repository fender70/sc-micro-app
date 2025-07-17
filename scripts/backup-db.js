#!/usr/bin/env node

/**
 * Database Backup Script
 * Exports current database to JSON format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database manager
import dbManager from '../database/db.js';

async function backupDatabase() {
    try {
        console.log('🔄 Initializing database...');
        await dbManager.initialize();
        
        console.log('📦 Creating backup...');
        const backupData = await dbManager.exportData();
        
        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Save backup with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
        
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
        console.log(`✅ Backup created successfully: ${backupPath}`);
        console.log(`📊 Records backed up:`);
        console.log(`   - Customers: ${backupData.customers.length}`);
        console.log(`   - Work Requests: ${backupData.workRequests.length}`);
        console.log(`   - Projects: ${backupData.projects.length}`);
        
        // Close database connection
        dbManager.close();
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

// Run backup
backupDatabase(); 