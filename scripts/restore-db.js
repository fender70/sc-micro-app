#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores database from JSON backup file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database manager
import dbManager from '../database/db.js';

async function restoreDatabase() {
    try {
        // Find the latest backup file
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            console.error('❌ No backup directory found');
            process.exit(1);
        }
        
        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (backupFiles.length === 0) {
            console.error('❌ No backup files found');
            process.exit(1);
        }
        
        const latestBackup = backupFiles[0];
        const backupPath = path.join(backupDir, latestBackup);
        
        console.log(`🔄 Restoring from backup: ${latestBackup}`);
        
        // Read backup data
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        console.log('🔄 Initializing database...');
        await dbManager.initialize();
        
        console.log('📦 Restoring data...');
        await dbManager.importData(backupData);
        
        console.log('✅ Database restored successfully');
        console.log(`📊 Records restored:`);
        console.log(`   - Customers: ${backupData.customers.length}`);
        console.log(`   - Work Requests: ${backupData.workRequests.length}`);
        console.log(`   - Projects: ${backupData.projects.length}`);
        
        // Close database connection
        dbManager.close();
        
    } catch (error) {
        console.error('❌ Restore failed:', error);
        process.exit(1);
    }
}

// Run restore
restoreDatabase(); 