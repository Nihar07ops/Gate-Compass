@echo off
echo ========================================
echo   GATE CSE Prep Platform - Development
echo ========================================
echo.

REM Save current directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%.."

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%CD%\server" && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Client...
start "Frontend Client" cmd /k "cd /d "%CD%\client" && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting ML Service...
start "ML Service" cmd /k "cd /d "%CD%\ml_service" && python app.py"
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
