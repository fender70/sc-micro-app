# Deployment Guide for SC Micro Enterprise System

## Overview
This guide will help you deploy your SC Micro Enterprise System with:
- **Backend**: Railway (Node.js + SQLite)
- **Frontend**: Vercel (React)

## Step 1: Deploy Backend to Railway

### 1.1 Prepare Your Repository
Your repository is already prepared with the necessary files:
- `railway.json` - Railway configuration
- `Procfile` - Alternative deployment config
- `package.json` - Updated with start script and Railway-compatible dependencies

### 1.2 Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your `sc-micro-app` repository**
6. **Railway will automatically detect it's a Node.js app**

### 1.3 Configure Railway Settings

1. **In your Railway project dashboard:**
   - Go to Settings → General
   - Set the **Start Command** to: `npm run backend`
   - Set the **Health Check Path** to: `/api/test`

2. **Add Environment Variables (if needed):**
   - Go to Settings → Variables
   - Add any environment variables your app needs

### 1.4 Get Your Railway URL

1. **Go to the "Deployments" tab**
2. **Click on your latest deployment**
3. **Copy the generated URL** (e.g., `https://your-app-name-production.up.railway.app`)

## Step 2: Configure Frontend for Production

### 2.1 Set Environment Variable in Vercel

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add a new variable:**
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your Railway URL (e.g., `https://your-app-name-production.up.railway.app`)
   - **Environment**: Production
   - **Save**

### 2.2 Redeploy Frontend

1. **In Vercel dashboard, go to Deployments**
2. **Click "Redeploy" on your latest deployment**
3. **Or push a new commit to trigger automatic deployment**

## Step 3: Test Your Deployment

### 3.1 Test Backend Endpoints

Test your Railway backend directly:
```bash
# Test the API
curl https://your-app-name-production.up.railway.app/api/test

# Test customers endpoint
curl https://your-app-name-production.up.railway.app/api/customers

# Test assistant endpoint
curl -X POST https://your-app-name-production.up.railway.app/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### 3.2 Test Frontend

1. **Visit your Vercel URL**
2. **Test all functionality:**
   - Dashboard loading
   - Customer management
   - Work request creation
   - Project management
   - CSV upload
   - Assistant chat

## Step 4: Troubleshooting

### Common Issues

**Backend 500 Errors:**
- Check Railway logs in the dashboard
- Ensure database is initializing properly
- Verify all dependencies are installed
- Database uses standard sqlite3 package (no compilation required)

**Frontend Can't Connect to Backend:**
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check CORS settings in your backend
- Test backend URL directly

**Database Issues:**
- SQLite file is created automatically on Railway
- Data persists between deployments
- Check Railway logs for database errors
- Uses standard sqlite3 package (no Python compilation required)

### Useful Commands

**Check Railway Logs:**
- Go to Railway dashboard → Deployments → Latest deployment → Logs

**Check Vercel Logs:**
- Go to Vercel dashboard → Deployments → Latest deployment → Functions

**Test Local Backend:**
```bash
npm run backend
```

**Test Local Frontend:**
```bash
npm run dev
```

## Step 5: Production Considerations

### Security
- ✅ CORS is configured for production
- ✅ Input validation is implemented
- ✅ SQL injection protection via prepared statements

### Performance
- ✅ Database queries are optimized
- ✅ Frontend is built for production
- ✅ Static assets are served efficiently

### Monitoring
- Railway provides built-in monitoring
- Vercel provides performance analytics
- Consider adding error tracking (Sentry, etc.)

## Success Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variable set in Vercel
- [ ] Backend URL accessible
- [ ] Frontend can connect to backend
- [ ] All features working in production
- [ ] Database persisting data
- [ ] CSV upload working
- [ ] Assistant chat functional

## Support

If you encounter issues:
1. Check the logs in both Railway and Vercel
2. Test endpoints directly with curl
3. Verify environment variables are set correctly
4. Ensure all dependencies are properly installed

Your deployment should be complete once you've followed these steps! 