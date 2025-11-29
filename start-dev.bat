@echo off
echo Starting GATE CSE Prep Platform...
echo.

echo Starting Backend Server...
start cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting ML Service...
start cmd /k "cd ml_service && python app.py"

echo.
echo All services started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ML Service: http://localhost:8000
echo.
pause
