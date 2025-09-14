# 🚀 AI PDF Companion - Render Deployment Guide

This guide will help you deploy the AI PDF Companion application to Render.

## 📋 Prerequisites

Before deploying, make sure you have:

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **API Keys** - You'll need API keys for the AI services

## 🔑 Required API Keys

### 1. Groq API Key
- Visit [Groq Console](https://console.groq.com/keys)
- Create a new API key
- Copy the key for later use

### 2. Hugging Face API Key
- Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
- Create a new token with "Read" permissions
- Copy the token for later use

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Run the deployment preparation script** (optional):
   ```bash
   npm run prepare-deployment
   ```

### Step 2: Deploy to Render

1. **Log in to Render Dashboard**
   - Go to [render.com](https://render.com)
   - Sign in with your GitHub account

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure the Service**
   - **Name**: `ai-pdf-companion` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose the closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (uses root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   In the "Environment" tab, add these variables:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Wait for the deployment to complete (usually 5-10 minutes)

### Step 3: Verify Deployment

1. **Check the deployment logs** for any errors
2. **Visit your application URL** (provided by Render)
3. **Test the features**:
   - Upload a PDF
   - Try the annotation tools
   - Test AI chat functionality
   - Test PDF summarization

## 🔧 Configuration Files

The project includes these deployment-ready files:

- **`render.yaml`** - Render service configuration
- **`.env.example`** - Environment variables template
- **`scripts/prepare-deployment.js`** - Deployment preparation script
- **`scripts/copy-worker.js`** - PDF.js worker setup

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is 18+
   - Check build logs for specific errors

2. **PDF.js Worker Issues**
   - The `postinstall` script should copy the worker file automatically
   - If issues persist, check the `scripts/copy-worker.js` file

3. **API Key Issues**
   - Verify API keys are set correctly in Render dashboard
   - Check that keys have proper permissions
   - Test API keys locally first

4. **Memory Issues**
   - Render free tier has memory limits
   - Consider upgrading to paid plan for production use
   - Optimize PDF processing for large files

### Performance Optimization

1. **Enable Gzip Compression** (already configured)
2. **Use CDN** for static assets
3. **Optimize Images** before upload
4. **Limit PDF File Size** (current limit: 50MB)

## 📊 Monitoring

1. **Render Dashboard** - Monitor service health and logs
2. **Application Logs** - Check for errors and performance issues
3. **API Usage** - Monitor Groq and Hugging Face API usage

## 🔄 Updates and Maintenance

1. **Automatic Deployments** - Enabled by default on main branch
2. **Manual Deployments** - Use Render dashboard for manual deploys
3. **Environment Variables** - Update in Render dashboard as needed
4. **Dependencies** - Update `package.json` and push to trigger rebuild

## 💰 Cost Considerations

- **Free Tier**: 750 hours/month, 512MB RAM
- **Starter Plan**: $7/month, 512MB RAM, always-on
- **Standard Plan**: $25/month, 1GB RAM, always-on

## 🆘 Support

If you encounter issues:

1. Check the [Render Documentation](https://render.com/docs)
2. Review the application logs in Render dashboard
3. Test locally with the same environment variables
4. Check the GitHub issues for this project

## 🎉 Success!

Once deployed, your AI PDF Companion will be available at your Render URL. Users can:

- Upload and view PDFs
- Annotate documents with various tools
- Chat with AI about PDF content
- Get AI-powered summaries
- Use voice commands (if supported by browser)

Happy deploying! 🚀
