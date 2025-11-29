# 🚀 Quick Guide: Push to GitHub

## ⚡ Fast Track (5 Minutes)

### Step 1: Install Git
**Download**: https://git-scm.com/download/win
- Run installer with default settings
- Restart your terminal

### Step 2: Run Setup Script
```bash
setup-git.bat
```
This will:
- Initialize Git repository
- Configure your name and email
- Add all files
- Create first commit

### Step 3: Create GitHub Repository
1. Go to: **https://github.com/new**
2. Repository name: `gate-cse-prep-platform`
3. Description: `ML-powered GATE CSE preparation platform`
4. Choose **Public** or **Private**
5. **Don't** check "Initialize with README"
6. Click **"Create repository"**

### Step 4: Connect and Push
Copy your GitHub username, then run:

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
git branch -M main
git push -u origin main
```

### Step 5: Enter Credentials
- **Username**: Your GitHub username
- **Password**: Personal Access Token (not your password!)

**Get Token**: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Check "repo" scope
- Generate and copy the token
- Use it as password

---

## ✅ Done!

Your repository is now on GitHub! 🎉

**View it at**: `https://github.com/YOUR_USERNAME/gate-cse-prep-platform`

---

## 🔄 Future Updates

When you make changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

---

## 📋 What Gets Pushed

✅ **Included**:
- All source code
- Documentation
- Configuration files
- .env.example (template)

❌ **Excluded** (in .gitignore):
- node_modules/
- .env (secrets)
- dist/ and build/
- venv/

---

## 🆘 Need Help?

See detailed guide: `GIT_SETUP_GUIDE.md`

---

## 🎯 Repository Structure on GitHub

```
gate-cse-prep-platform/
├── 📁 client/          # React frontend
├── 📁 server/          # Node.js backend
├── 📁 ml_service/      # Python ML service
├── 📁 docs/            # Documentation
├── 📄 README.md        # Main documentation
├── 📄 package.json     # Root dependencies
└── 📄 .gitignore       # Ignored files
```

---

**Ready to share your project with the world!** 🌟
