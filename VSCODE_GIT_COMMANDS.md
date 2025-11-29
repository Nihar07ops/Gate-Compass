# 🚀 VS Code Git Commands - Copy & Paste

## ⚠️ FIRST: Install Git

Git is not installed on your system. You need to install it first.

### Install Git:
1. Download: https://git-scm.com/download/win
2. Run the installer (use all default settings)
3. **Restart VS Code** after installation
4. Open a new terminal in VS Code

---

## ✅ After Installing Git

Open VS Code Terminal (`Ctrl + ~` or View → Terminal) and run these commands:

### Step 1: Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
Replace with your actual name and email.

---

### Step 2: Initialize Repository
```bash
git init
```

---

### Step 3: Add All Files
```bash
git add .
```

---

### Step 4: Create First Commit
```bash
git commit -m "Initial commit: GATE CSE Prep Platform with MERN stack"
```

---

### Step 5: Create GitHub Repository

**Go to**: https://github.com/new

- Repository name: `gate-cse-prep-platform`
- Description: `ML-powered GATE CSE preparation platform with MERN stack`
- Choose: Public or Private
- **DO NOT** check "Initialize with README"
- Click "Create repository"

---

### Step 6: Connect to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
```

---

### Step 7: Rename Branch to Main
```bash
git branch -M main
```

---

### Step 8: Push to GitHub
```bash
git push -u origin main
```

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (NOT your password)

**Get Token**: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select scope: `repo`
- Generate and copy the token
- Paste it as password (it won't show while typing)

---

## 🎉 Done!

Your code is now on GitHub at:
```
https://github.com/YOUR_USERNAME/gate-cse-prep-platform
```

---

## 🔄 For Future Updates

When you make changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

---

## 📋 Complete Command List (Copy All at Once)

After installing Git and creating GitHub repository:

```bash
# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initialize and commit
git init
git add .
git commit -m "Initial commit: GATE CSE Prep Platform"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
git branch -M main
git push -u origin main
```

---

## 🆘 Troubleshooting

### "git: command not found"
- Install Git from https://git-scm.com/download/win
- **Restart VS Code**
- Open new terminal

### "Permission denied" or "Authentication failed"
- Use Personal Access Token instead of password
- Get token: https://github.com/settings/tokens

### "Repository not found"
- Check you created the repository on GitHub
- Verify the URL has your correct username
- Make sure repository name matches exactly

### "Failed to push"
- Check internet connection
- Verify you entered correct credentials
- Try generating a new token

---

## 🎯 VS Code Git Integration

After pushing, you can use VS Code's built-in Git features:

1. **Source Control Panel**: Click the branch icon in left sidebar
2. **Stage Changes**: Click `+` next to files
3. **Commit**: Type message and click ✓
4. **Push**: Click `...` → Push

---

## 📝 What Gets Pushed

✅ **Included**:
- All source code (client, server, ml_service)
- Documentation files
- Configuration files
- .env.example templates

❌ **Excluded** (protected by .gitignore):
- node_modules/
- .env files (secrets)
- dist/ and build/
- venv/
- Log files

---

**Ready to push your GATE CSE Prep Platform to GitHub!** 🚀
