#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Deploys Gate Compass to Vercel hosting
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying to Vercel...');
console.log('========================');

try {
    // Check if we're in the right directory
    if (!fs.existsSync('client/package.json')) {
        throw new Error('Please run this script from the project root directory');
    }

    // Create vercel.json configuration
    const vercelConfig = {
        "name": "gate-compass",
        "version": 2,
        "buildCommand": "cd client && npm install && npm run build",
        "outputDirectory": "client/dist",
        "framework": "vite",
        "rewrites": [
            {
                "source": "/(.*)",
                "destination": "/index.html"
            }
        ]
    };

    console.log('📝 Creating Vercel configuration...');
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));

    // Install Vercel CLI if not present
    try {
        execSync('vercel --version', { stdio: 'pipe' });
        console.log('✅ Vercel CLI found');
    } catch (e) {
        console.log('📦 Installing Vercel CLI...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // Build the project
    console.log('🔨 Building project...');
    process.chdir('client');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir('..');

    // Deploy to Vercel
    console.log('🚀 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });

    console.log('\n✅ Deployment Complete!');
    console.log('🌐 Your site is now live on Vercel!');
    console.log('📱 Check your Vercel dashboard for the URL');

} catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have a Vercel account');
    console.log('2. Run: vercel login');
    console.log('3. Try: npm install -g vercel');
    process.exit(1);
}