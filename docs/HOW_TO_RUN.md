# How to Run the GATE CSE Prep Platform

## Quick Start (Easiest Way)

### Option 1: Using the Batch File (Windows)
Simply double-click `start-dev.bat` in the project root folder. This will automatically start all three services.

### Option 2: Manual Start (Recommended for Control)

Open **3 separate terminal windows** and run these commands:

#### Terminal 1 - Backend Server
```bash
cd server
node server-inmemory.js
```

#### Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```

#### Terminal 3 - ML Service
```bash
cd ml_service
python app.py
```

## Access the Application

Once all services are running, open your browser and go to:
- **Main Application**: http://localhost:3000

The services will be running on:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

## First Time Setup (Already Done!)

✅ All dependencies are already installed
✅ Environment files are configured
✅ Ready to use!

## Test Login Credentials

- **Email**: test@example.com
- **Password**: password123

Or create your own account by clicking "Register here" on the login page.

## Stopping the Application

- If using `start-dev.bat`: Close all the command windows that opened
- If using manual start: Press `Ctrl+C` in each terminal window

## Important Notes

- **In-Memory Database**: Currently using in-memory storage, so data will be lost when you restart the server
- **No MongoDB Required**: The app works without MongoDB for testing
- **All Services Must Run**: Make sure all 3 services are running for full functionality

## Troubleshooting

### If services don't start:

1. **Check if ports are already in use**:
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   netstat -ano | findstr :8000
   ```

2. **Kill processes using those ports** (if needed):
   ```bash
   taskkill /PID <process_id> /F
   ```

3. **Restart the services**

### If you see errors:

- **"npm is not recognized"**: Node.js is not in PATH. Restart your terminal or computer after installing Node.js
- **"python is not recognized"**: Python is not in PATH. Use the full path: `A:\python\python.exe app.py`
- **Port already in use**: Another application is using the port. Stop it or change the port in `.env` files

## Need Help?

Check these files for more information:
- `AUTHENTICATION_GUIDE.md` - Login/Register troubleshooting
- `test-auth.html` - Test authentication directly
- `docs/SETUP.md` - Detailed setup instructions
