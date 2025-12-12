#!/bin/bash

echo "🚀 Starting Fresh GitHub Pages Deployment..."
echo "=================================="

# Navigate to client directory
cd client

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building for production..."
npm run build

echo "📤 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment Complete!"
echo "🌐 Your site will be available at: https://nihar07ops.github.io/Gate-Compass/"
echo "⏱️  Please wait 5-10 minutes for changes to go live."