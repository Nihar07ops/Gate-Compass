#!/bin/bash

echo "🚀 Deploying Gate-Compass to GitHub Pages..."

# Navigate to client directory
cd client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to GitHub Pages
    echo "🌐 Deploying to GitHub Pages..."
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌍 Your site will be available at: https://nihar07ops.github.io/Gate-Compass/"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi