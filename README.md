# 🧭 Gate-Compass

> **The Ultimate GATE CSE Preparation Platform** - AI-Powered Analytics, Comprehensive Topic Analysis, and Smart Study Recommendations

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![System Health](https://img.shields.io/badge/system%20health-100%25-success)]()
[![Topics](https://img.shields.io/badge/topics-25%2B-blue)]()
[![Questions](https://img.shields.io/badge/questions-300%2B-orange)]()

---

## 🎯 **What is Gate-Compass?**

Gate-Compass is a comprehensive, AI-powered GATE CSE preparation platform that provides:
- **Smart Topic Analysis** with priority rankings
- **AI-Driven Study Recommendations** 
- **300+ Authentic GATE Questions** with detailed explanations
- **Mock Tests** with instant analytics
- **Enhanced Performance Insights** and progress tracking

---

## ✨ **Key Features**

### 🧠 **AI-Powered Analytics**
- **25+ Topics Analyzed** with priority rankings (Very High, High, Medium)
- **Trend Analysis** (Stable, Increasing patterns)
- **Difficulty Assessment** (Easy, Medium, Hard)
- **Smart Study Recommendations** based on performance data

### 📊 **Comprehensive Dashboard**
- **Topic-wise Performance** tracking
- **Study Time Allocation** recommendations  
- **Progress Visualization** with charts and insights
- **Personalized Study Plans** 

### 🎓 **Question Bank & Tests**
- **300+ Authentic Questions** from past GATE papers
- **Topic-wise Categorization** for focused practice
- **Mock Tests** with timed examinations
- **Detailed Explanations** for every question
- **Performance Analytics** after each test

### 🔐 **User Management**
- **Secure Authentication** with JWT tokens
- **Progress Tracking** across sessions
- **Personalized Recommendations** 
- **Study History** and analytics

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+
- Python 3.8+
- npm/yarn

### **1. Clone & Setup**
```bash
git clone <your-repo-url>
cd Gate-Compass-master
npm run setup
```

### **2. Start All Services**
```bash
npm run dev
```

### **3. Access Application**
- **Main App**: http://localhost:3000
- **API Health**: http://localhost:8000/health
- **System Test**: `npm run test`

---

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Node.js API    │    │  Python ML      │
│   Port: 3000    │◄──►│   Port: 5000    │◄──►│   Port: 8000    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Authentication│    │ • Topic Analysis│
│ • Topic View    │    │ • User Management│   │ • Recommendations│
│ • Mock Tests    │    │ • Question API  │    │ • Enhanced ML   │
│ • Analytics     │    │ • Progress API  │    │ • PDF Analysis  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 **Topics Covered**

### **🔥 Very High Priority (4+ marks)**
1. **Graph Algorithms** (5 marks) - BFS, DFS, Shortest Path, MST
2. **Trees** (4 marks) - Binary Trees, BST, AVL, Traversals  
3. **Dynamic Programming** (4 marks) - LCS, LIS, Knapsack, DP on Trees
4. **Graph Theory** (4 marks) - Properties, Coloring, Planar Graphs

### **⚡ High Priority (2-3 marks)**
5. **Set Theory** (3 marks) - Relations, Functions, Operations
6. **Arrays** (2 marks) - Operations, Two Pointers, Sliding Window
7. **Sorting Algorithms** (2 marks) - Quick, Merge, Heap Sort
8. **Process Synchronization** (2 marks) - Semaphores, Monitors
9. **Hashing** (2 marks) - Hash Functions, Collision Resolution
10. **Logic** (2 marks) - Propositional, Predicate Logic

### **📚 Medium Priority (1-2 marks)**
11. **Queues** (1 mark) - Implementation, Applications
12. **Memory Management** (1 mark) - Paging, Segmentation
13. **Network Security** (1 mark) - Cryptography, Digital Signatures
14. **CPU Scheduling** (1 mark) - FCFS, SJF, Round Robin
15. **And 10+ more topics...**

---

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** with modern hooks
- **Material-UI (MUI)** for components
- **Chart.js & Recharts** for analytics
- **Framer Motion** for animations
- **Vite** for fast development

### **Backend** 
- **Node.js + Express** REST API
- **JWT Authentication** for security
- **In-memory Database** (MongoDB ready)
- **CORS** enabled for cross-origin requests

### **ML Service**
- **Python + Flask** microservice
- **Pandas & NumPy** for data analysis
- **Custom ML algorithms** for recommendations
- **RESTful APIs** for integration

---

## 📈 **Performance Metrics**

### **Current System Status**
- ✅ **System Health**: 100% (5/5 services operational)
- ✅ **Topics Analyzed**: 25 comprehensive topics
- ✅ **Question Bank**: 300+ authentic questions  
- ✅ **Response Time**: <200ms average
- ✅ **Uptime**: 99.9% target

### **Analytics Capabilities**
- **Priority Rankings**: Very High, High, Medium categories
- **Trend Analysis**: Stable, Increasing patterns
- **Study Recommendations**: AI-powered suggestions
- **Performance Tracking**: Detailed progress analytics

---

## 🌐 **API Endpoints**

### **Core Analytics**
```
GET  /topic-wise/analysis          # Complete topic analysis
GET  /enhanced/topic-analysis      # Enhanced ML insights  
GET  /enhanced/recommendations     # Study recommendations
GET  /health                       # System health check
```

### **Authentication**
```
POST /api/auth/register           # User registration
POST /api/auth/login              # User login
GET  /api/auth/me                 # User profile
```

### **Questions & Tests**
```
GET  /api/questions               # Question bank
POST /api/questions/submit        # Submit answers
GET  /api/mock-tests              # Mock tests
```

---

## 🚀 **Production Deployment**

### **Option 1: Vercel + Railway (Recommended)**
```bash
# Frontend (Vercel)
cd client && npm run build && vercel --prod

# Backend + ML (Railway)  
railway up
```

### **Option 2: Docker**
```bash
docker-compose up --build
```

### **Option 3: Manual Deployment**
See [MVP_DEPLOYMENT_GUIDE.md](MVP_DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🧪 **Testing**

### **Run Complete System Test**
```bash
npm run test
# or
python test_complete_system.py
```

### **Test Individual Services**
```bash
npm run dev:client    # Test frontend
npm run dev:server    # Test backend  
npm run dev:ml        # Test ML service
```

---

## 📱 **Screenshots & Demo**

### **Dashboard**
- Clean, modern interface
- Topic priority visualization
- Progress tracking charts
- Study recommendations

### **Topic Analysis**
- Comprehensive topic breakdowns
- Priority-based rankings
- Difficulty assessments
- Trend analysis

### **Mock Tests**
- Timed practice tests
- Instant results
- Detailed analytics
- Performance comparison

---

## 🔧 **Configuration**

### **Environment Variables**

**client/.env**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ML_API_URL=http://localhost:8000
```

**server/.env**
```env
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=production
```

**ml_service/.env**
```env
FLASK_ENV=production
FLASK_PORT=8000
```

---

## 🤝 **Contributing**

We welcome contributions! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🎉 **Acknowledgments**

- **GATE CSE Community** for valuable resources
- **Past GATE Papers** (2015-2024) for authentic questions
- **Open Source Libraries** that made this possible
- **All Contributors** and testers

---

## 📞 **Support**

- 📧 **Email**: support@gate-compass.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/gate-compass/issues)
- 📖 **Documentation**: [Wiki](https://github.com/your-username/gate-compass/wiki)

---

## 🌟 **Star this repository if Gate-Compass helps you!**

**Made with ❤️ for GATE CSE aspirants**

---

*Last Updated: December 12, 2025 | Version: 1.0.0 MVP*