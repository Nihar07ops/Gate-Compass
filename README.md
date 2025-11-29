# 🎓 GATE CSE Prep Platform

> AI-Powered GATE CSE Preparation Platform with Mock Tests, Predictive Analysis, and Comprehensive Study Resources

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![Questions](https://img.shields.io/badge/questions-50%2B-blue)]()
[![Subjects](https://img.shields.io/badge/subjects-11-orange)]()

## ✨ Features

### 🎯 For Students
- **Smart Dashboard**: Track your progress, streak, and performance at a glance
- **AI-Powered Predictions**: Machine learning algorithms predict important topics based on GATE trends
- **Mock Tests**: Generate custom tests with adjustable difficulty levels
- **Detailed Analytics**: Topic-wise performance analysis with visual insights
- **Historical Trends**: Analyze past GATE exam patterns and question distribution
- **Study Resources**: Curated materials from top sources (PhysicsWallah, GeeksforGeeks, etc.)
- **Beautiful UI**: Modern, responsive design with smooth animations

### 🤖 ML Features
- Topic importance prediction using historical GATE data (2015-2024)
- Confidence scoring for predictions
- Trend analysis across years
- Personalized study recommendations

### 📚 Question Database
- **50+ comprehensive questions** across 11 subjects
- Based on actual GATE patterns
- Multiple difficulty levels (easy, medium, hard)
- Verified answers with explanations
- Regular updates with new questions

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run complete setup
scripts\setup-complete.bat

# Start the application
scripts\start-production.bat
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
cd ml_service && pip install -r requirements.txt && cd ..

# Generate question database
cd ml_service/data && python enhanced_questions.py && cd ../..

# Start services (3 terminals)
cd ml_service && python app.py
cd server && node server-inmemory.js
cd client && npm run dev
```

## 🌐 Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000

## 🧪 Test Credentials

- **Email**: test@example.com
- **Password**: password123

Or create your own account!

## 📊 Subjects Covered

1. **Algorithms** - Sorting, searching, graph algorithms, dynamic programming
2. **Data Structures** - Trees, heaps, hash tables, graphs
3. **Operating Systems** - Process management, memory, scheduling
4. **DBMS** - SQL, normalization, transactions, indexing
5. **Computer Networks** - OSI model, protocols, routing
6. **Theory of Computation** - Automata, grammars, Turing machines
7. **Compiler Design** - Parsing, code generation, optimization
8. **Digital Logic** - Gates, flip-flops, combinational circuits
9. **Computer Organization** - CPU, memory, pipelining
10. **Discrete Mathematics** - Graph theory, sets, relations
11. **Programming** - C, Python, data structures implementation

## 🛠️ Technology Stack

### Frontend
- React 18 + Vite
- Material-UI (MUI)
- Framer Motion
- Chart.js & Recharts
- React Router

### Backend
- Node.js + Express
- JWT Authentication
- In-memory DB (MongoDB ready)
- RESTful API

### ML Service
- Python + Flask
- Scikit-learn
- Pandas & NumPy
- Custom prediction algorithms

## 📖 Documentation

- [Folder Structure](FOLDER_STRUCTURE.md) - Complete project structure overview
- [Production Ready Guide](docs/PRODUCTION_READY.md) - Complete feature list and setup
- [How to Run](docs/HOW_TO_RUN.md) - Quick start guide
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) - Production deployment steps
- [Authentication Guide](docs/AUTHENTICATION_GUIDE.md) - Login/register troubleshooting
- [Git Setup Guide](docs/GIT_SETUP_GUIDE.md) - Version control setup
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines

## 🔧 Configuration

### Environment Variables

Create `.env` files in each directory:

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:8000
```

**server/.env**
```env
PORT=5000
JWT_SECRET=your_secret_key
ML_SERVICE_URL=http://localhost:8000
```

**ml_service/.env**
```env
FLASK_ENV=development
PORT=8000
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
vercel --prod
```

### Backend (Heroku/Railway)
```bash
cd server
git push heroku main
```

### ML Service (Railway/Render)
```bash
cd ml_service
railway up
```

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed steps.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 Resources Used

- [GATE Resources GitHub](https://github.com/baquer/GATE-and-CSE-Resources-for-Students)
- [PhysicsWallah GATE Notes](https://www.pw.live/exams/gate/gate-cse-notes/)
- [GeeksforGeeks GATE](https://www.geeksforgeeks.org/gate-cs-notes-gq/)
- Historical GATE papers (2015-2024)

## 📄 License

MIT License - Free for educational use

## 🎉 Acknowledgments

Special thanks to:
- GATE CSE community for resources
- PhysicsWallah for study materials
- GeeksforGeeks for practice problems
- All contributors and testers

---

## 🌟 Star this repo if you find it helpful!

**Made with ❤️ for GATE CSE aspirants**
