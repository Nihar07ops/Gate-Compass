@echo off
echo ========================================
echo   GATE CSE Prep Platform - Production
echo ========================================
echo.

echo [1/4] Checking environment...
node check-environment.js
if errorlevel 1 (
    echo.
    echo Environment check failed. Please fix the issues above.
    pause
    exit /b 1
)

echo.
echo [2/4] Starting ML Service...
start "ML Service" cmd /k "cd ml_service && python app.py"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Backend Server...
start "Backend Server" cmd /k "cd server && node server-inmemory.js"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Frontend Client...
start "Frontend Client" cmd /k "cd client && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   All services started successfully!
echo ========================================
echo.
echo   Frontend:    http://localhost:3000
echo   Backend:     http://localhost:5000
echo   ML Service:  http://localhost:8000
echo.
echo Press any key to open the application in browser...
pause >nul
start http://localhost:3000
