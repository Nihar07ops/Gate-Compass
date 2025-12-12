# 📁 Project Folder Structure

## Overview

```
GateCompass/
├── 📁 client/                      # Frontend React Application
│   ├── 📁 public/                  # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable React components
│   │   │   ├── Layout.jsx          # Main layout wrapper
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── 📁 context/             # React Context providers
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── 📁 pages/               # Page components
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── MockTest.jsx        # Mock test interface
│   │   │   ├── Analytics.jsx       # Performance analytics
│   │   │   ├── PredictiveAnalysis.jsx  # ML predictions
│   │   │   ├── HistoricalTrends.jsx    # Historical data
│   │   │   └── Resources.jsx       # Study resources
│   │   ├── 📁 utils/               # Utility functions
│   │   │   └── api.js              # API client
│   │   ├── App.jsx                 # Main app component
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # Entry point
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Environment template
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend dependencies
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── vite.config.js              # Vite configuration
│
├── 📁 server/                      # Backend Node.js/Express API
│   ├── 📁 config/                  # Configuration files
│   │   └── db.js                   # Database connection
│   ├── 📁 middleware/              # Express middleware
│   │   └── auth.js                 # JWT authentication
│   ├── 📁 models/                  # Database models
│   │   ├── User.js                 # User model
│   │   ├── Question.js             # Question model
│   │   └── TestResult.js           # Test result model
│   ├── 📁 routes/                  # API routes
│   │   ├── auth.js                 # Authentication routes
│   │   ├── questions.js            # Question routes
│   │   ├── tests.js                # Test routes
│   │   └── analytics.js            # Analytics routes
│   ├── 📁 utils/                   # Utility functions
│   │   └── inMemoryDb.js           # In-memory database
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Environment template
│   ├── package.json                # Backend dependencies
│   ├── server.js                   # Main server (MongoDB)
│   └── server-inmemory.js          # Server (in-memory DB)
│
├── 📁 ml_service/                  # Python ML Service
│   ├── 📁 data/                    # Data files
│   │   ├── enhanced_questions.py   # Question generator
│   │   ├── gate_format_questions.py # GATE format questions
│   │   ├── question_generator.py   # Question utilities
│   │   └── gate_questions_complete.json # Question database
│   ├── 📁 models/                  # ML models
│   │   └── predictor.py            # Prediction algorithms
│   ├── 📁 venv/                    # Python virtual environment (gitignored)
│   ├── .env                        # Environment variables (gitignored)
│   ├── .env.example                # Environment template
│   ├── app.py                      # Flask application
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # ML service documentation
│
├── 📁 docs/                        # 📚 Documentation
│   ├── README.md                   # Documentation index
│   ├── HOW_TO_RUN.md              # Quick start guide
│   ├── PRODUCTION_READY.md        # Production guide
│   ├── DEPLOYMENT_CHECKLIST.md    # Deployment steps
│   ├── AUTHENTICATION_GUIDE.md    # Auth troubleshooting
│   ├── GIT_SETUP_GUIDE.md         # Git setup instructions
│   ├── CONTRIBUTING.md            # Contribution guidelines
│   └── GATE_FORMAT_TESTS.md       # Test format documentation
│
├── 📁 scripts/                     # 🔧 Automation Scripts
│   ├── README.md                   # Scripts documentation
│   ├── setup-complete.bat          # Complete setup
│   ├── setup-ml-service.bat        # ML service setup
│   ├── setup-git.bat               # Git initialization
│   ├── start-production.bat        # Start all services
│   ├── start-dev.bat               # Start dev mode
│   ├── activate-ml-env.bat         # Activate Python env
│   ├── activate-python-env.bat     # Alt Python activation
│   └── check-environment.js        # Environment checker
│
├── 📁 node_modules/                # Root dependencies (gitignored)
├── 📁 .git/                        # Git repository (gitignored)
├── 📁 .vscode/                     # VS Code settings (gitignored)
│
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Root package config
├── 📄 package-lock.json            # Dependency lock file
├── 📄 vercel.json                  # Vercel deployment config
├── 📄 README.md                    # Main project documentation
└── 📄 FOLDER_STRUCTURE.md          # This file
```

## 📂 Folder Descriptions

### `/client` - Frontend Application
React-based frontend with Vite build tool. Contains all UI components, pages, and styling.

**Key Files:**
- `src/App.jsx` - Main application component with routing
- `src/pages/` - All page components
- `src/components/` - Reusable UI components
- `src/context/AuthContext.jsx` - Authentication state management
- `vite.config.js` - Build configuration

### `/server` - Backend API
Node.js/Express REST API server handling authentication, data management, and business logic.

**Key Files:**
- `server-inmemory.js` - Development server with in-memory storage
- `server.js` - Production server with MongoDB
- `routes/` - API endpoint definitions
- `models/` - Data models
- `middleware/auth.js` - JWT authentication

### `/ml_service` - Machine Learning Service
Python Flask service providing ML-powered predictions and analytics.

**Key Files:**
- `app.py` - Flask application entry point
- `models/predictor.py` - Prediction algorithms
- `data/gate_questions_complete.json` - Question database
- `requirements.txt` - Python dependencies

### `/docs` - Documentation
All project documentation including setup guides, deployment instructions, and contribution guidelines.

### `/scripts` - Automation Scripts
Batch scripts for Windows to automate setup, deployment, and development tasks.

## 🔒 Gitignored Folders/Files

These are NOT tracked in version control:

- `node_modules/` - NPM dependencies (too large)
- `.env` files - Sensitive credentials
- `venv/` - Python virtual environment
- `dist/` and `build/` - Build outputs
- `.vscode/` - Editor settings
- `*.log` - Log files

## 📦 Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `requirements.txt` | Python dependencies |
| `.env.example` | Environment variable templates |
| `vite.config.js` | Frontend build configuration |
| `tailwind.config.js` | Tailwind CSS styling |
| `vercel.json` | Deployment configuration |
| `.gitignore` | Git ignore rules |

## 🚀 Entry Points

| Service | Entry Point | Port |
|---------|-------------|------|
| Frontend | `client/src/main.jsx` | 3000 |
| Backend | `server/server-inmemory.js` | 5000 |
| ML Service | `ml_service/app.py` | 8000 |

## 📊 Data Flow

```
User Browser (Port 3000)
    ↓
React Frontend (client/)
    ↓
Express API (server/ - Port 5000)
    ↓
├─→ In-Memory DB (Development)
├─→ MongoDB (Production)
└─→ Flask ML Service (ml_service/ - Port 8000)
```

## 🛠️ Development Workflow

1. **Setup**: Run `scripts\setup-complete.bat`
2. **Start**: Run `scripts\start-production.bat`
3. **Develop**: Edit files in `client/src/` or `server/`
4. **Test**: Access http://localhost:3000
5. **Deploy**: Follow `docs/DEPLOYMENT_CHECKLIST.md`

## 📝 File Naming Conventions

- **React Components**: PascalCase (e.g., `Dashboard.jsx`)
- **Utilities**: camelCase (e.g., `api.js`)
- **Scripts**: kebab-case (e.g., `setup-complete.bat`)
- **Documentation**: UPPERCASE (e.g., `README.md`)

## 🔍 Finding Files

| Looking for... | Check... |
|----------------|----------|
| UI Components | `client/src/components/` |
| Pages | `client/src/pages/` |
| API Routes | `server/routes/` |
| ML Models | `ml_service/models/` |
| Questions | `ml_service/data/` |
| Documentation | `docs/` |
| Scripts | `scripts/` |

## 📈 Project Statistics

- **Total Folders**: ~15
- **Frontend Components**: 10+
- **API Endpoints**: 15+
- **ML Models**: 1
- **Documentation Files**: 8
- **Scripts**: 8

---

**Last Updated**: November 29, 2024  
**Version**: 1.0.0  
**Maintained by**: GATE CSE Prep Team
