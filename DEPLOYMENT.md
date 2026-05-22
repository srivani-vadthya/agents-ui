# Deployment Guide

## Prerequisites
- GitHub account
- Render account (https://render.com)
- Git installed locally

## Step 1: Push to GitHub

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Multi-Agent UI"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a new repository named `multi-agents-ui`
   - Don't initialize with README (you already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/multi-agents-ui.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Login to Render**
   - Go to https://dashboard.render.com

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `multi-agents-ui` repository

3. **Configure Service**
   - **Name**: `multi-agents-ui`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Instance Type**: Free (or your preferred tier)

4. **Add Environment Variables**
   Go to "Environment" tab and add:
   ```
   RENDER_KNOWLEDGE_AGENT_URL=https://py-agent-knowledgeassistant-8bby.onrender.com
   RENDER_RCA_AGENT_URL=https://patchly-rca-agent-2.onrender.com
   RENDER_CODEGEN_AGENT_URL=https://code-generator-wfye.onrender.com
   RENDER_AUTOFIX_AGENT_URL=https://your-autofix-agent.onrender.com/chat
   RENDER_KNOWLEDGE_UPLOAD_URL=https://py-agent-knowledgeassistant-8bby.onrender.com/upload
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)

### Option B: Using render.yaml (Automatic)

1. **Ensure render.yaml exists** (already created)

2. **Connect Repository**
   - Render will automatically detect `render.yaml`
   - Follow the prompts to configure environment variables

3. **Deploy**
   - Render will automatically deploy on every push to main branch

## Step 3: Verify Deployment

1. **Check Build Logs**
   - Monitor the deployment logs in Render dashboard
   - Ensure no errors during build

2. **Test Application**
   - Visit your Render URL (e.g., `https://multi-agents-ui.onrender.com`)
   - Test login functionality
   - Test each agent (Knowledge, RCA, CodeGen, AutoFix)

3. **Check Environment Variables**
   - Ensure all backend URLs are correct
   - Test API connections

## Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

### Environment Variables Not Working
- Ensure .env is in .gitignore (it is)
- Add all variables in Render dashboard
- Restart the service after adding variables

### API Connection Issues
- Verify backend URLs are accessible
- Check CORS settings on backend services
- Ensure backend services are running

## Post-Deployment

### Custom Domain (Optional)
1. Go to Render dashboard → Settings
2. Add custom domain
3. Update DNS records as instructed

### Auto-Deploy
- Render automatically deploys on git push to main
- Can disable in Settings if needed

### Monitoring
- Check Render dashboard for metrics
- Set up alerts for downtime
- Monitor logs for errors

## Important Notes

✅ **Ready for Deployment:**
- ✓ .gitignore configured (excludes .env, node_modules)
- ✓ .env.example provided
- ✓ Build scripts configured
- ✓ All dependencies listed
- ✓ Logo and assets included
- ✓ User authentication implemented
- ✓ All agents configured

⚠️ **Before Going Live:**
- Update backend URLs in Render environment variables
- Test all agent connections
- Verify user login/logout flow
- Test on different browsers
- Check mobile responsiveness

## Support

For issues:
1. Check Render logs
2. Review GitHub issues
3. Contact support@render.com
