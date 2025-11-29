# ✅ After Installing Git - Next Steps

## 🔄 Step 1: Restart VS Code

**Important**: You must restart VS Code for Git to work!

1. Close VS Code completely (File → Exit or Alt+F4)
2. Open VS Code again
3. Open your project folder: `C:\Users\malla\Downloads\gate`

---

## ✅ Step 2: Verify Git Installation

Open VS Code Terminal (`Ctrl + ~`) and run:

```bash
git --version
```

You should see something like: `git version 2.43.0`

If you still see "command not found":
- Make sure you closed and reopened VS Code
- Try restarting your computer
- Check Git was installed to default location

---

## 🚀 Step 3: Configure Git

In VS Code Terminal, run these commands (replace with your info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Example:
```bash
git config --global user.name "John Doe"
git config --global user.email "john@example.com"
```

---

## 📦 Step 4: Initialize Repository

```bash
git init
```

You should see: `Initialized empty Git repository in C:/Users/malla/Downloads/gate/.git/`

---

## 📝 Step 5: Add All Files

```bash
git add .
```

This stages all your files for commit.

---

## 💾 Step 6: Create First Commit

```bash
git commit -m "Initial commit: GATE CSE Prep Platform with MERN stack"
```

You should see a summary of files committed.

---

## 🌐 Step 7: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `gate-cse-prep-platform`
   - **Description**: `ML-powered GATE CSE preparation platform with MERN stack`
   - **Visibility**: Public or Private (your choice)
3. **Important**: DO NOT check any boxes (no README, no .gitignore, no license)
4. Click **"Create repository"**

---

## 🔗 Step 8: Connect to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
git branch -M main
```

---

## 🚀 Step 9: Push to GitHub

```bash
git push -u origin main
```

### When Prompted for Credentials:

**Username**: Your GitHub username

**Password**: You need a **Personal Access Token** (NOT your GitHub password)

### Get Personal Access Token:

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `GATE CSE Prep Platform`
4. Select scope: Check ✅ **`repo`** (Full control of private repositories)
5. Click **"Generate token"** at the bottom
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste it as password in VS Code terminal (it won't show while typing)
8. Press Enter

---

## 🎉 Step 10: Verify on GitHub

Go to: `https://github.com/YOUR_USERNAME/gate-cse-prep-platform`

You should see all your files!

---

## 🔄 For Future Updates

When you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

---

## 🆘 Troubleshooting

### Git still not recognized after restart
1. Open Command Prompt (not PowerShell)
2. Type: `git --version`
3. If it works there, use Command Prompt in VS Code:
   - Click dropdown next to `+` in terminal
   - Select "Command Prompt"

### Authentication keeps failing
- Make sure you're using Personal Access Token, not password
- Generate a new token if needed
- Check token has `repo` permissions

### "Repository not found"
- Verify you created the repository on GitHub
- Check the URL has your correct username
- Make sure repository name is exactly: `gate-cse-prep-platform`

---

## ✅ Complete Command List

Copy and paste these one by one (after restarting VS Code):

```bash
# Verify Git
git --version

# Configure Git (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initialize repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: GATE CSE Prep Platform"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git

# Set branch name
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 📞 Need Help?

If you're stuck:
1. Make sure VS Code is restarted
2. Check Git is installed: `git --version`
3. Follow error messages carefully
4. Try using Command Prompt instead of PowerShell

---

**You're almost there! Just restart VS Code and follow these steps.** 🚀
