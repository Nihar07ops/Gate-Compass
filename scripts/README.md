# 🔧 Scripts

Automation scripts for the GATE CSE Prep Platform.

## 📜 Available Scripts

### Setup Scripts
- **`setup-complete.bat`** - Complete automated setup (installs all dependencies)
- **`setup-database.bat`** - Setup MongoDB database (Atlas or Local)
- **`setup-ml-service.bat`** - Setup Python ML service only
- **`setup-git.bat`** - Initialize Git repository

### Start Scripts
- **`start-production.bat`** - Start all services (production mode)
- **`start-dev.bat`** - Start all services (development mode)

### Environment Scripts
- **`activate-ml-env.bat`** - Activate Python virtual environment
- **`activate-python-env.bat`** - Alternative Python environment activation

### Utility Scripts
- **`check-environment.js`** - Verify environment setup

## 🚀 Usage

### First Time Setup
```bash
# Run complete setup
scripts\setup-complete.bat
```

### Start Application
```bash
# Production mode
scripts\start-production.bat

# Or development mode
scripts\start-dev.bat
```

### Setup Git
```bash
scripts\setup-git.bat
```

## 📝 Script Details

### setup-complete.bat
Performs complete setup:
- Installs Node.js dependencies (root, client, server)
- Creates Python virtual environment
- Installs Python dependencies
- Generates question database
- Creates environment files
- Verifies setup

### start-production.bat
Starts all services:
- Backend server (port 5000)
- Frontend client (port 3000)
- ML service (port 8000)

### setup-git.bat
Initializes Git:
- Configures Git user
- Initializes repository
- Creates first commit
- Provides GitHub push instructions

## ⚙️ Requirements

- **Windows OS** (batch scripts)
- **Node.js** v16+
- **Python** 3.8+
- **npm** or **yarn**

## 🔄 Manual Alternative

If scripts don't work, see [docs/HOW_TO_RUN.md](../docs/HOW_TO_RUN.md) for manual setup instructions.

---

**All scripts are Windows batch files (.bat)**
