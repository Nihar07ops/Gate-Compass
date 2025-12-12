# Gate-Compass Project Structure

A sophisticated GATE exam preparation platform with AI-powered analysis and historical trends.

## 📁 Project Organization

```
Gate-Compass/
├── 📂 client/              # React frontend application
├── 📂 server/              # Node.js backend API
├── 📂 ml_service/          # Python ML service for analysis
├── 📂 tests/               # Comprehensive test suite
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── fixtures/          # Test data
│   └── utils/             # Test utilities
├── 📂 docs/               # Project documentation
│   ├── deployment/        # Deployment guides
│   ├── development/       # Development docs
│   ├── features/          # Feature documentation
│   ├── api/              # API documentation
│   └── architecture/     # System design docs
├── 📂 scripts/           # Utility scripts
├── 📂 GateMaterials/     # GATE study materials
├── 📄 package.json       # Node.js dependencies
├── 📄 vercel.json        # Deployment configuration
├── 📄 pytest.ini        # Test configuration
└── 📄 README.md          # Project overview
```

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../ml_service && pip install -r requirements.txt
   ```

2. **Run Development Servers**
   ```bash
   # Backend
   npm run dev
   
   # Frontend
   cd client && npm start
   
   # ML Service
   cd ml_service && python app.py
   ```

3. **Run Tests**
   ```bash
   python scripts/run_tests.py
   ```

## 📚 Documentation

- [Deployment Guide](docs/deployment/MVP_DEPLOYMENT_GUIDE.md)
- [Quick Start](docs/deployment/QUICK_START.md)
- [Features Overview](docs/features/FEATURES.md)
- [ML Model Architecture](docs/architecture/ML_MODEL.md)

## 🛠️ Development

- [Project Status](docs/development/PROJECT_STATUS.md)
- [Updates Log](docs/development/UPDATES.md)
- [Chart Improvements](docs/development/CHART_IMPROVEMENTS.md)