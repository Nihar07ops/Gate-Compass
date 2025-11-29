# 📖 Step-by-Step Guide: Push to GitHub from VS Code

## 🎯 Goal
Push your GATE CSE Prep Platform to GitHub

---

## 📋 Prerequisites Checklist

- [ ] VS Code is open
- [ ] Project folder is open in VS Code
- [ ] You have a GitHub account

---

## 🔧 Step 1: Install Git (5 minutes)

### 1.1 Download Git
- Open: https://git-scm.com/download/win
- Click "Download for Windows"
- Wait for download to complete

### 1.2 Install Git
- Run the downloaded installer
- Click "Next" on all screens (use defaults)
- Click "Install"
- Click "Finish"

### 1.3 Restart VS Code
- Close VS Code completely
- Open VS Code again
- Open your project folder

### 1.4 Verify Installation
- Open Terminal in VS Code: `Ctrl + ~`
- Type: `git --version`
- Should show: `git version 2.x.x`

✅ **Git is now installed!**

---

## ⚙️ Step 2: Configure Git (2 minutes)

Open VS Code Terminal (`Ctrl + ~`) and run:

```bash
git config --global user.name "Your Name"
```
Press Enter

```bash
git config --global user.email "your.email@example.com"
```
Press Enter

Replace with your actual name and email.

✅ **Git is now configured!**

---

## 📦 Step 3: Initialize Repository (1 minute)

In VS Code Terminal:

```bash
git init
```
Press Enter

You should see: `Initialized empty Git repository`

✅ **Repository initialized!**

---

## 📝 Step 4: Add Files (1 minute)

In VS Code Terminal:

```bash
git add .
```
Press Enter

This adds all your files to Git.

✅ **Files added!**

---

## 💾 Step 5: Create First Commit (1 minute)

In VS Code Terminal:

```bash
git commit -m "Initial commit: GATE CSE Prep Platform"
```
Press Enter

You should see a summary of files committed.

✅ **First commit created!**

---

## 🌐 Step 6: Create GitHub Repository (3 minutes)

### 6.1 Go to GitHub
- Open: https://github.com/new
- (Login if needed)

### 6.2 Fill Repository Details
- **Repository name**: `gate-cse-prep-platform`
- **Description**: `ML-powered GATE CSE preparation platform with MERN stack`
- **Visibility**: Choose Public or Private
- **Important**: DO NOT check "Add a README file"
- **Important**: DO NOT add .gitignore or license

### 6.3 Create Repository
- Click green "Create repository" button
- You'll see a page with setup instructions

✅ **GitHub repository created!**

---

## 🔗 Step 7: Connect to GitHub (1 minute)

### 7.1 Copy Your Username
From the GitHub page, note your username in the URL:
`https://github.com/YOUR_USERNAME/gate-cse-prep-platform`

### 7.2 Add Remote
In VS Code Terminal, run this command (replace YOUR_USERNAME):

```bash
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
```
Press Enter

### 7.3 Set Branch Name
```bash
git branch -M main
```
Press Enter

✅ **Connected to GitHub!**

---

## 🚀 Step 8: Push to GitHub (2 minutes)

### 8.1 Push Command
In VS Code Terminal:

```bash
git push -u origin main
```
Press Enter

### 8.2 Enter Credentials

You'll be prompted for:

**Username**: Type your GitHub username and press Enter

**Password**: You need a Personal Access Token (NOT your password)

---

## 🔑 Step 8.3: Get Personal Access Token

### Open New Browser Tab:
https://github.com/settings/tokens

### Generate Token:
1. Click "Generate new token" → "Generate new token (classic)"
2. **Note**: "GATE CSE Prep Platform"
3. **Expiration**: Choose "No expiration" or "90 days"
4. **Select scopes**: Check ✅ `repo` (Full control of private repositories)
5. Scroll down and click "Generate token"
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)

### Use Token as Password:
- Go back to VS Code Terminal
- Paste the token as password (it won't show while typing)
- Press Enter

✅ **Pushing to GitHub...**

You should see:
```
Enumerating objects: ...
Counting objects: ...
Writing objects: 100% ...
```

✅ **Successfully pushed to GitHub!**

---

## 🎉 Step 9: Verify on GitHub (1 minute)

### 9.1 Open Your Repository
Go to: `https://github.com/YOUR_USERNAME/gate-cse-prep-platform`

### 9.2 Check Files
You should see:
- ✅ client/ folder
- ✅ server/ folder
- ✅ ml_service/ folder
- ✅ docs/ folder
- ✅ README.md
- ✅ All other files

### 9.3 View README
The README.md should be displayed on the main page with project description.

✅ **Your project is now on GitHub!**

---

## 🔄 Future Updates

When you make changes to your code:

### In VS Code Terminal:

```bash
# See what changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Added new feature"

# Push to GitHub
git push
```

---

## 🎯 Quick Reference

### Common Commands:
```bash
git status          # Check what changed
git add .           # Add all changes
git commit -m "msg" # Save changes with message
git push            # Upload to GitHub
git pull            # Download from GitHub
git log             # See commit history
```

---

## 🆘 Common Issues

### Issue: "git: command not found"
**Solution**: Install Git and restart VS Code

### Issue: "Authentication failed"
**Solution**: Use Personal Access Token, not password

### Issue: "Repository not found"
**Solution**: Check repository name and username are correct

### Issue: "Permission denied"
**Solution**: Generate new token with correct permissions

---

## ✅ Success Checklist

- [x] Git installed
- [x] Git configured
- [x] Repository initialized
- [x] Files committed
- [x] GitHub repository created
- [x] Connected to GitHub
- [x] Code pushed successfully
- [x] Verified on GitHub

---

## 🎊 Congratulations!

Your GATE CSE Prep Platform is now on GitHub!

**Share your repository**:
```
https://github.com/YOUR_USERNAME/gate-cse-prep-platform
```

---

**Total Time**: ~15 minutes
**Difficulty**: Easy
**Result**: Your code is now backed up and shareable! 🚀
