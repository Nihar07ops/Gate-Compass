# 🔧 GitHub Pages Deployment Troubleshooting

## Step-by-Step Deployment Guide

### Step 1: Enable GitHub Pages
1. Go to your repository: https://github.com/Nihar07ops/Gate-Compass
2. Click **Settings** tab (top right)
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions** (NOT Deploy from a branch)
5. Click **Save**

### Step 2: Check Repository Permissions
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### Step 3: Trigger Deployment
Since the workflow triggers on `master` branch pushes, let's force a new deployment:

```bash
# Make a small change to trigger deployment
git checkout master
echo "# Deployment trigger" >> README.md
git add README.md
git commit -m "trigger: force GitHub Pages deployment"
git push origin master
```

### Step 4: Monitor Deployment
1. Go to **Actions** tab in your repository
2. You should see a "Deploy to GitHub Pages" workflow running
3. Click on it to see the progress
4. Wait for it to complete (usually 2-3 minutes)

### Step 5: Check Deployment Status
1. Go back to **Settings** → **Pages**
2. You should see: "Your site is published at https://nihar07ops.github.io/Gate-Compass/"
3. Click the link to test your site

## Common Issues and Solutions

### Issue 1: No Actions Tab Visible
**Solution**: Enable Actions in repository settings
1. **Settings** → **Actions** → **General**
2. Select **Allow all actions and reusable workflows**

### Issue 2: Workflow Fails with Permission Error
**Solution**: Update workflow permissions
1. **Settings** → **Actions** → **General**
2. **Workflow permissions** → **Read and write permissions**

### Issue 3: Build Fails
**Solution**: Check the build logs in Actions tab
- Common fix: Node version mismatch
- Our workflow uses Node 18, which should work

### Issue 4: Site Shows 404
**Solution**: Check the base path configuration
- Our Vite config should handle this automatically
- Base path is set to `/Gate-Compass/` for GitHub Pages

### Issue 5: "GitHub Actions" Option Not Available
**Solution**: 
1. Make sure you're the repository owner
2. Repository must be public (or have GitHub Pro for private repos)
3. Try refreshing the Settings page

## Manual Deployment (Alternative)

If GitHub Actions doesn't work, try manual deployment:

```bash
# Install gh-pages package
cd client
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy manually
npm run deploy
```

## Verification Steps

After deployment, verify:
1. ✅ Site loads at: https://nihar07ops.github.io/Gate-Compass/
2. ✅ Demo banner appears
3. ✅ Login works with any credentials
4. ✅ All pages are accessible
5. ✅ Resources page shows digital archive

## Debug Information

If still having issues, check:
1. **Actions tab**: Any failed workflows?
2. **Settings → Pages**: What does it show?
3. **Repository visibility**: Is it public?
4. **Branch protection**: Any rules blocking pushes?

## Quick Test Commands

Run these to trigger a fresh deployment:

```bash
# Force a new commit
git checkout master
date > deployment-test.txt
git add deployment-test.txt
git commit -m "test: trigger GitHub Pages deployment"
git push origin master
```

Then check the Actions tab for the workflow progress.

## Expected Timeline
- **Workflow trigger**: Immediate after push
- **Build time**: 2-3 minutes
- **Deployment**: 1-2 minutes
- **DNS propagation**: Up to 10 minutes

Total time: Usually 5-15 minutes for first deployment.

## Need Help?
If you're still having issues, please share:
1. What error message you're seeing
2. Screenshot of Settings → Pages
3. Any failed workflow logs from Actions tab

The deployment should work with these steps!