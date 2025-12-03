@echo off
echo ========================================
echo   Git Setup for GATE CSE Prep Platform
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Go to: https://git-scm.com/download/win
    echo 2. Download and install
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Check if already initialized
if exist .git (
    echo [INFO] Git repository already initialized
    echo.
) else (
    echo Initializing Git repository...
    git init
    echo [OK] Repository initialized
    echo.
)

REM Configure git (you can modify these)
echo Configuring Git...
set /p USERNAME="Enter your name: "
set /p EMAIL="Enter your email: "

git config user.name "%USERNAME%"
git config user.email "%EMAIL%"

echo [OK] Git configured
echo.

REM Add files
echo Adding files to Git...
git add .
echo [OK] Files added
echo.

REM Create commit
echo Creating first commit...
git commit -m "Initial commit: GATE CSE Prep Platform with MERN stack"
echo [OK] Commit created
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Create a repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Repository name: gate-cse-prep-platform
echo.
echo 3. Then run these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/gate-cse-prep-platform.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Replace YOUR_USERNAME with your GitHub username
echo.
pause
