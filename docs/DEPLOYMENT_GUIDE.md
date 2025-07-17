# SC Micro Deployment Guide

## Database Persistence Setup

This guide explains how to set up persistent database storage to prevent data loss during deployments.

## Option 1: Railway with Persistent Volume (Recommended)

### Step 1: Configure Railway Environment Variables

In your Railway project dashboard, set these environment variables:

```bash
DATABASE_PATH=/data/sc_micro.db
NODE_ENV=production
PYTHON_VERSION=3.11
```

### Step 2: Create a Data Volume

1. Go to your Railway project dashboard
2. Navigate to "Volumes" tab
3. Create a new volume:
   - **Name**: `database-storage`
   - **Mount Path**: `/data`
   - **Size**: `1GB` (or as needed)

### Step 3: Deploy Your Application

The database will now persist in the `/data` directory across deployments.

## Option 2: Manual Backup/Restore Process

### Before Deployment (Backup)

```bash
# Create a backup of current data
npm run backup

# Or use the API endpoint
curl -X GET http://localhost:3001/api/database/backup > backup.json
```

### After Deployment (Restore)

```bash
# Restore from backup
npm run restore

# Or use the API endpoint
curl -X POST http://localhost:3001/api/database/restore \
  -H "Content-Type: application/json" \
  -d @backup.json
```

## Database Management Commands

### Check Database Status
```bash
npm run db:status
```

### Create Backup
```bash
npm run backup
```

### Restore from Backup
```bash
npm run restore
```

### API Endpoints

- `GET /api/database/status` - Check database health and record counts
- `GET /api/database/backup` - Export current data as JSON
- `POST /api/database/restore` - Import data from JSON backup

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | Path to SQLite database file | `database/sc_micro.db` |
| `NODE_ENV` | Application environment | `development` |
| `PYTHON_VERSION` | Python version for LangGraph | `3.11` |

## Troubleshooting

### Database Not Persisting

1. Check if `DATABASE_PATH` is set correctly
2. Verify the volume is mounted at the correct path
3. Ensure the application has write permissions

### Backup/Restore Issues

1. Check if backup files exist in `backups/` directory
2. Verify JSON format is valid
3. Check database connection status

### Performance Issues

1. Consider increasing volume size if needed
2. Monitor database file size
3. Implement regular cleanup of old backups

## Best Practices

1. **Regular Backups**: Create backups before major deployments
2. **Test Restore**: Verify backup/restore process works
3. **Monitor Storage**: Keep track of database and backup sizes
4. **Version Control**: Don't commit database files to git
5. **Environment Separation**: Use different databases for dev/staging/prod

## Migration to External Database

For production applications, consider migrating to:

- **PostgreSQL** (Railway supports this)
- **MongoDB Atlas**
- **Supabase**

This provides better scalability and reliability than SQLite. 