@echo off
REM Gate-Compass MVP Deployment Script for Windows
REM Quick setup and deployment for production

echo 🚀 Gate-Compass MVP Deployment
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...

REM Root dependencies
call npm install

REM Frontend dependencies
echo 📱 Installing frontend dependencies...
cd client
call npm install
cd ..

REM Backend dependencies
echo 🔧 Installing backend dependencies...
cd server
call npm install
cd ..

REM ML service dependencies
echo 🤖 Installing ML service dependencies...
cd ml_service
pip install -r requirements.txt
cd ..

echo ✅ All dependencies installed

REM Build frontend for production
echo 🏗️ Building frontend for production...
cd client
call npm run build
cd ..

echo ✅ Frontend built successfully

REM Create production start script
echo @echo off > start_production.bat
echo echo 🚀 Starting Gate-Compass Production Services... >> start_production.bat
echo. >> start_production.bat
echo REM Start ML service >> start_production.bat
echo cd ml_service >> start_production.bat
echo start /B python app.py >> start_production.bat
echo cd .. >> start_production.bat
echo. >> start_production.bat
echo REM Start backend >> start_production.bat
echo cd server >> start_production.bat
echo start /B node server-inmemory.js >> start_production.bat
echo cd .. >> start_production.bat
echo. >> start_production.bat
echo REM Start frontend >> start_production.bat
echo cd client >> start_production.bat
echo call npm run preview >> start_production.bat
echo cd .. >> start_production.bat
echo. >> start_production.bat
echo echo ✅ All services started! >> start_production.bat
echo echo 🌐 Frontend: http://localhost:4173 >> start_production.bat
echo echo 🔧 Backend: http://localhost:5000 >> start_production.bat
echo echo 🤖 ML Service: http://localhost:8000 >> start_production.bat
echo pause >> start_production.bat

REM Create development start script
echo @echo off > start_development.bat
echo echo 🚀 Starting Gate-Compass Development Services... >> start_development.bat
echo. >> start_development.bat
echo REM Start ML service >> start_development.bat
echo cd ml_service >> start_development.bat
echo start /B python app.py >> start_development.bat
echo cd .. >> start_development.bat
echo. >> start_development.bat
echo REM Start backend >> start_development.bat
echo cd server >> start_development.bat
echo start /B node server-inmemory.js >> start_development.bat
echo cd .. >> start_development.bat
echo. >> start_development.bat
echo REM Start frontend >> start_development.bat
echo cd client >> start_development.bat
echo call npm run dev >> start_development.bat
echo cd .. >> start_development.bat
echo. >> start_development.bat
echo echo ✅ All services started in development mode! >> start_development.bat
echo echo 🌐 Frontend: http://localhost:3000 >> start_development.bat
echo echo 🔧 Backend: http://localhost:5000 >> start_development.bat
echo echo 🤖 ML Service: http://localhost:8000 >> start_development.bat
echo pause >> start_development.bat

REM Run system test
echo 🧪 Running system test...
python test_complete_system.py

echo.
echo 🎉 Gate-Compass MVP Deployment Complete!
echo ========================================
echo.
echo 🚀 To start in production mode:
echo    start_production.bat
echo.
echo 🔧 To start in development mode:
echo    start_development.bat
echo.
echo 📖 For detailed deployment guide:
echo    See MVP_DEPLOYMENT_GUIDE.md
echo.
echo ✅ Your Gate-Compass MVP is ready for production!
pause