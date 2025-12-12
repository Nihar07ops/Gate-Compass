@echo off
echo 🚀 Deploying Gate-Compass to GitHub Pages...

cd client

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the project
echo 🔨 Building the project...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Deploy to GitHub Pages
    echo 🌐 Deploying to GitHub Pages...
    npm run deploy
    
    if %errorlevel% equ 0 (
        echo 🎉 Deployment successful!
        echo 🌍 Your site will be available at: https://nihar07ops.github.io/Gate-Compass/
    ) else (
        echo ❌ Deployment failed!
        exit /b 1
    )
) else (
    echo ❌ Build failed!
    exit /b 1
)