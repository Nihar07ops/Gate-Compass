# 🌐 GitHub Pages Deployment Guide

This guide will help you deploy the Gate-Compass frontend to GitHub Pages for free hosting.

## 📋 Prerequisites

- GitHub repository with the project
- Node.js 18+ installed locally
- Git configured with your GitHub account

## 🚀 Automatic Deployment (Recommended)

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Push to Master Branch
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin master
```

The GitHub Actions workflow will automatically:
- Install dependencies
- Build the React app
- Deploy to GitHub Pages

### 3. Access Your Site
Your site will be available at:
```
https://nihar07ops.github.io/Gate-Compass/
```

## 🔧 Manual Deployment

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Deploy to GitHub Pages
```bash
npm run deploy
```

Or use the deployment scripts:
```bash
# Linux/Mac
./deploy-github.sh

# Windows
deploy-github.bat
```

## ⚙️ Configuration Files

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Triggers**: Push to master branch
- **Actions**: Build and deploy React app

### Vite Configuration
- **File**: `client/vite.config.js`
- **Base Path**: `/Gate-Compass/` for GitHub Pages
- **Build Output**: `client/dist/`

### Package.json
- **Homepage**: `https://nihar07ops.github.io/Gate-Compass/`
- **Deploy Script**: Uses `gh-pages` package

## 🔍 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails
```bash
# Check GitHub Pages settings
# Ensure GitHub Actions is selected as source
# Verify repository permissions
```

### Site Not Loading
- Check if the base path is correct in `vite.config.js`
- Verify the homepage URL in `package.json`
- Ensure all assets use relative paths

## 📱 Features Available

### ✅ Working Features (Frontend Only)
- Dashboard with topic analysis
- Historical trends visualization
- Mock test interface
- Study recommendations
- Responsive design

### ⚠️ Limited Features (No Backend)
- User authentication (demo mode)
- Progress tracking (local storage)
- Question submission (mock responses)

## 🔄 Updates

To update the deployed site:
1. Make changes to your code
2. Commit and push to master branch
3. GitHub Actions will automatically redeploy

## 🌟 Next Steps

For full functionality with backend services:
1. Deploy backend to Railway/Heroku
2. Deploy ML service to Python hosting
3. Update API endpoints in frontend
4. Consider Vercel for better React hosting

## 📞 Support

If you encounter issues:
- Check GitHub Actions logs
- Verify repository settings
- Ensure all dependencies are installed
- Review the deployment scripts