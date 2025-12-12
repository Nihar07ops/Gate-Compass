# 🚀 Quick Start Guide

## ✅ Your App is Running!

All services are currently active:

- **Frontend**: http://localhost:3000 ✅
- **Backend**: http://localhost:5000 ✅
- **ML Service**: http://localhost:8000 ✅

## 🎯 Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## 🔐 Test Login Credentials

- **Email**: test@example.com
- **Password**: password123

Or click "Register here" to create a new account!

---

## 🔄 How to Start the App (Next Time)

### Option 1: Using Scripts (Easiest)

**From project root:**
```bash
scripts\start-production.bat
```

**Or for development mode:**
```bash
scripts\start-dev.bat
```

### Option 2: Manual Start

Open 3 separate terminals:

**Terminal 1 - Backend:**
```bash
cd server
node server-inmemory.js
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 3 - ML Service:**
```bash
cd ml_service
python app.py
```

---

## 🛑 How to Stop the App

- Close all terminal windows
- Or press `Ctrl+C` in each terminal

---

## 📊 Current Setup

- **Database**: In-Memory (temporary storage)
- **Questions**: 65 GATE format questions loaded
- **Sections**: General Aptitude (10), Engineering Math (13), Computer Science (42)

⚠️ **Note**: Data will be lost when you restart the server. To set up persistent storage with MongoDB, see [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)

---

## 🎓 Features Available

### Dashboard
- View your progress and statistics
- Track your study streak
- See strong and weak topics

### Mock Tests
- **AceTimer Test**: 180 minutes, 65 questions
- **Freestyle Mode**: Practice at your own pace
- Instant results and scoring

### AI Predictions
- ML-powered topic importance analysis
- Historical GATE trends (2015-2024)
- Study recommendations

### Analytics
- Topic-wise performance breakdown
- Visual charts and graphs
- Detailed test history

### Resources
- Curated study materials
- Subject-wise organization
- Video lectures and notes

---

## 🔧 Troubleshooting

### Port Already in Use

If you see "Port already in use" error:

```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Services Won't Start

1. Make sure you're in the project root directory
2. Check if Node.js and Python are installed:
   ```bash
   node --version
   python --version
   ```
3. Reinstall dependencies if needed:
   ```bash
   npm install
   cd client && npm install
   cd ../ml_service && pip install -r requirements.txt
   ```

### Frontend Shows Blank Page

1. Clear browser cache (Ctrl+Shift+Delete)
2. Check browser console for errors (F12)
3. Verify backend is running on port 5000

### Can't Login/Register

1. Check backend terminal for errors
2. Verify all services are running
3. Try clearing browser cookies
4. Check network tab in browser DevTools (F12)

---

## 📁 Project Structure

```
GateCompass/
├── client/          # React frontend (Port 3000)
├── server/          # Node.js backend (Port 5000)
├── ml_service/      # Python ML service (Port 8000)
├── docs/            # Documentation
└── scripts/         # Automation scripts
```

---

## 📖 Documentation

- [Folder Structure](FOLDER_STRUCTURE.md) - Complete project structure
- [Database Setup](docs/DATABASE_SETUP.md) - MongoDB configuration
- [How to Run](docs/HOW_TO_RUN.md) - Detailed setup guide
- [Production Ready](docs/PRODUCTION_READY.md) - Feature list
- [Deployment](docs/DEPLOYMENT_CHECKLIST.md) - Deploy to production

---

## 🎯 Next Steps

1. ✅ **Explore the app** - Try all features
2. ✅ **Take a mock test** - Test your knowledge
3. ✅ **Check analytics** - View your performance
4. 📚 **Setup MongoDB** - For persistent data storage
5. 🚀 **Deploy** - Share with others

---

## 💡 Tips

- Keep all 3 services running while using the app
- Data is temporary (in-memory) - setup MongoDB for persistence
- Use Chrome or Firefox for best experience
- Check the docs folder for detailed guides

---

## 🆘 Need Help?

- Check [docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md) for detailed instructions
- See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for MongoDB setup
- Review [docs/AUTHENTICATION_GUIDE.md](docs/AUTHENTICATION_GUIDE.md) for login issues

---

**Happy Learning! 🎓**

*Made with ❤️ for GATE CSE Aspirants*
