@echo off
echo ========================================
echo   GATE CSE Prep - Complete Setup
echo ========================================
echo.

echo [1/7] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/7] Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/7] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [4/7] Installing ML dependencies...
cd ml_service
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install ML dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [5/7] Generating question database...
cd ml_service\data
python question_generator.py
if errorlevel 1 (
    echo Failed to generate questions
    pause
    exit /b 1
)
cd ..\..

echo.
echo [6/7] Setting up environment files...
if not exist "client\.env" (
    copy "client\.env.example" "client\.env"
    echo Created client/.env
)
if not exist "server\.env" (
    copy "server\.env.example" "server\.env"
    echo Created server/.env
)
if not exist "ml_service\.env" (
    copy "ml_service\.env.example" "ml_service\.env"
    echo Created ml_service/.env
)

echo.
echo [7/7] Running environment check...
node check-environment.js

echo.
echo ========================================
echo   Setup Complete! 🎉
echo ========================================
echo.
echo To start the application, run:
echo   start-production.bat
echo.
pause
