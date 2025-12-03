@echo off
echo ========================================
echo   GATE CSE Prep - Database Setup
echo ========================================
echo.

echo This script will help you set up the database for your application.
echo.
echo Choose your database option:
echo   1. MongoDB Atlas (Cloud - Recommended)
echo   2. Local MongoDB
echo   3. Skip (Use in-memory database)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto atlas
if "%choice%"=="2" goto local
if "%choice%"=="3" goto skip
goto invalid

:atlas
echo.
echo ========================================
echo   MongoDB Atlas Setup
echo ========================================
echo.
echo Follow these steps:
echo.
echo 1. Go to: https://www.mongodb.com/cloud/atlas/register
echo 2. Create a free account
echo 3. Create a free M0 cluster
echo 4. Create a database user
echo 5. Whitelist your IP (0.0.0.0/0 for development)
echo 6. Get your connection string
echo.
echo Your connection string should look like:
echo mongodb+srv://username:password@cluster.mongodb.net/gate-prep?retryWrites=true^&w=majority
echo.
echo Press any key when you have your connection string...
pause >nul
echo.
echo Opening .env file for you to paste the connection string...
echo.
timeout /t 2 >nul
notepad server\.env
echo.
echo ✅ MongoDB Atlas configuration updated!
echo.
goto seed

:local
echo.
echo ========================================
echo   Local MongoDB Setup
echo ========================================
echo.
echo Checking if MongoDB is installed...
echo.

where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not installed!
    echo.
    echo Please install MongoDB:
    echo 1. Go to: https://www.mongodb.com/try/download/community
    echo 2. Download and install MongoDB Community Server
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ MongoDB is installed!
echo.
echo Starting MongoDB service...
net start MongoDB >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ MongoDB service started!
) else (
    echo ⚠️  MongoDB service might already be running
)

echo.
echo Updating .env file with local MongoDB URI...
echo.

cd server
if not exist .env (
    copy .env.example .env >nul
)

echo MONGODB_URI=mongodb://localhost:27017/gate-prep >> .env.temp
findstr /v "MONGODB_URI" .env > .env.new
type .env.temp >> .env.new
move /y .env.new .env >nul
del .env.temp >nul

cd ..

echo ✅ Local MongoDB configuration updated!
echo.
goto seed

:seed
echo ========================================
echo   Database Seeding
echo ========================================
echo.
echo Do you want to seed the database with sample data?
echo This will:
echo   - Create sample users
echo   - Import questions
echo   - Add test data
echo.
set /p seed_choice="Seed database? (y/n): "

if /i "%seed_choice%"=="y" (
    echo.
    echo Generating questions...
    cd ml_service\data
    python enhanced_questions.py
    cd ..\..
    
    echo.
    echo Seeding database...
    cd server
    node scripts\seedDatabase.js
    cd ..
    
    echo.
    echo ✅ Database seeded successfully!
) else (
    echo.
    echo ⏭️  Skipping database seeding
)

echo.
goto complete

:skip
echo.
echo ⏭️  Skipping database setup
echo.
echo You will use the in-memory database.
echo Note: Data will be lost when the server restarts.
echo.
goto complete

:invalid
echo.
echo ❌ Invalid choice! Please run the script again.
echo.
pause
exit /b 1

:complete
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Start the server: scripts\start-production.bat
echo   2. Open the app: http://localhost:3000
echo   3. Login with: test@example.com / password123
echo.
echo For detailed instructions, see: docs\DATABASE_SETUP.md
echo.
pause
