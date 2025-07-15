# Vercel Deployment Guide

This guide will help you deploy your SC Micro Enterprise Management System to Vercel.

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a free MongoDB Atlas cluster
3. **GitHub Repository**: Ensure your code is pushed to GitHub

## 📋 Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

## 📋 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project: No
   - Project name: sc-micro-enterprise-system
   - Directory: ./ (current directory)
   - Override settings: No

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project settings

## 🔧 Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sc-micro-app?retryWrites=true&w=majority
NODE_ENV=production
```

**Replace the MongoDB URI with your actual connection string.**

## 🔄 Step 4: Update Configuration

After deployment, you'll get a URL like: `https://your-app.vercel.app`

1. **Update the README.md** with your live demo link
2. **Test the application** to ensure everything works

## 🧪 Step 5: Test Your Deployment

1. **Check the homepage**: Should load the React app
2. **Test API endpoints**: Try `/api/customers` to see if the backend works
3. **Test database connection**: Create a new customer or work request
4. **Test CSV upload**: Try uploading a CSV file

## 🐛 Troubleshooting

### Common Issues:

1. **Build Errors**:
   - Check that all dependencies are in `package.json`
   - Ensure `vercel.json` is properly configured

2. **API Errors**:
   - Verify MongoDB connection string
   - Check environment variables in Vercel dashboard

3. **CORS Errors**:
   - The current setup should handle CORS automatically
   - If issues persist, check the server.js CORS configuration

4. **File Upload Issues**:
   - Vercel has limitations with file uploads
   - Consider using cloud storage (AWS S3, Cloudinary) for production

## 📝 Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] CSV upload/download functions
- [ ] All features work as expected
- [ ] Mobile responsiveness
- [ ] Update README with live demo link

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

## 🎉 Success!

Once deployed, your application will be available at:
`https://your-app-name.vercel.app`

Share this link in your portfolio and README! 