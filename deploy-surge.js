#!/usr/bin/env node

/**
 * Surge.sh Deployment Script
 * Deploys Gate Compass to Surge.sh hosting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Surge.sh...');
console.log('==========================');

try {
    // Check if we're in the right directory
    if (!fs.existsSync('client/package.json')) {
        throw new Error('Please run this script from the project root directory');
    }

    // Install Surge CLI if not present
    try {
        execSync('surge --version', { stdio: 'pipe' });
        console.log('✅ Surge CLI found');
    } catch (e) {
        console.log('📦 Installing Surge CLI...');
        execSync('npm install -g surge', { stdio: 'inherit' });
    }

    // Build the project
    console.log('🔨 Building project...');
    process.chdir('client');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });

    // Create 200.html for SPA routing
    const indexPath = path.join('dist', 'index.html');
    const spa200Path = path.join('dist', '200.html');

    if (fs.existsSync(indexPath)) {
        console.log('📝 Creating SPA routing file...');
        fs.copyFileSync(indexPath, spa200Path);
    }

    // Deploy to Surge
    console.log('🚀 Deploying to Surge.sh...');
    process.chdir('dist');

    // Generate a random domain name
    const randomName = `gate-compass-${Math.random().toString(36).substring(7)}`;
    const domain = `${randomName}.surge.sh`;

    console.log(`🌐 Deploying to: ${domain}`);
    execSync(`surge . ${domain}`, { stdio: 'inherit' });

    console.log('\n✅ Deployment Complete!');
    console.log(`🌐 Your site is live at: https://${domain}`);
    console.log('📝 You can use a custom domain by running: surge . your-domain.com');

} catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have internet connection');
    console.log('2. Try: npm install -g surge');
    console.log('3. Run: surge login (if needed)');
    process.exit(1);
}