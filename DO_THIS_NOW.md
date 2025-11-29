# ✅ DO THIS NOW - Simple Steps

## 🔄 Step 1: Restart VS Code

**Close VS Code completely and reopen it**

- Press `Alt + F4` to close
- Or File → Exit
- Then open VS Code again
- Open this folder: `C:\Users\malla\Downloads\gate`

---

## ✅ Step 2: Test Git

Open Terminal in VS Code (`Ctrl + ~`) and type:

```bash
git --version
```

Press Enter.

You should see: `git version 2.43.0` (or similar)

✅ **If you see the version, Git is working! Continue below.**

❌ **If you still see "command not found":**
- Try closing and reopening VS Code again
- Or restart your computer
- Then come back to this guide

---

## 🚀 Step 3: Run These Commands

Copy and paste these commands **one by one** in VS Code Terminal:

### 3.1 Configure Git (Replace with your info)
```bash
git config --global user.name "Your Name"
```
Press Enter

```bash
git config --global user.email "your@email.com"
```
Press Enter

Example:
```bash
git config --global user.name "John Doe"
git config --global user.email "john@example.com"
```

---

### 3.2 Initialize Repository
```bash
git init
```
Press Enter

You should see: `Initialized empty Git repository`

---

### 3.3 Add All Files
```bash
git add .
```
Press Enter

---

### 3.4 Create First Commit
```bash
git commit -m "Initial commit: GATE CSE Prep Platform"
```
Press Enter

You'll see a list of files committed.

---

## 🌐 Step 4: Create GitHub Repository

1. Open browser and go to: **https://github.com/new**
2. Sign in if needed
3. Fill in:
   - **Repository name**: `gate-cse-prep-platform`
   - **Description**: `ML-powered GATE CSE preparation platform`
   - **Public** or **Private** (your choice)
4. **IMPORTANT**: Don't check any boxes (no README, no .gitignore)
5. Click **"Create repository"**

---

## 🔗 Step 5: Connect to GitHub

**Replace `YOUR_USERNAME` with your actual GitHub username!**

```bash
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
```
Press Enter

```bash
git branch -M main
```
Press Enter

---

## 🚀 Step 6: Push to GitHub

```bash
git push -u origin main
```
Press Enter

### You'll be asked for credentials:

**Username**: Type your GitHub username and press Enter

**Password**: You need a **Personal Access Token**

---

## 🔑 Get Personal Access Token

1. Open: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `GATE CSE Prep`
4. Expiration: Choose `90 days` or `No expiration`
5. Check the box: ✅ **`repo`** (Full control)
6. Scroll down and click **"Generate token"**
7. **COPY THE TOKEN** (green text starting with `ghp_...`)
8. Go back to VS Code Terminal
9. Paste the token as password (won't show while typing)
10. Press Enter

---

## 🎉 Done!

Your code is now on GitHub!

View it at: `https://github.com/YOUR_USERNAME/gate-cse-prep-platform`

---

## 🔄 For Future Updates

When you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

---

## 📋 Quick Copy-Paste (All Commands)

After restarting VS Code and verifying Git works:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git init
git add .
git commit -m "Initial commit: GATE CSE Prep Platform"
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
git branch -M main
git push -u origin main
```

Remember to:
1. Replace "Your Name" and email
2. Replace YOUR_USERNAME with your GitHub username
3. Create the repository on GitHub first
4. Use Personal Access Token as password

---

**Start with Step 1: Restart VS Code now!** 🚀
