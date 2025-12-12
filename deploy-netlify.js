#!/usr/bin/env node

/**
 * Netlify Deployment Script
 * Deploys Gate Compass to Netlify hosting
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying to Netlify...');
console.log('=========================');

try {
    // Check if we're in the right directory
    if (!fs.existsSync('client/package.json')) {
        throw new Error('Please run this script from the project root directory');
    }

    // Create netlify.toml configuration
    const netlifyConfig = `[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_ENV = "production"
`;

    console.log('📝 Creating Netlify configuration...');
    fs.writeFileSync('netlify.toml', netlifyConfig);

    // Install Netlify CLI if not present
    try {
        execSync('netlify --version', { stdio: 'pipe' });
        console.log('✅ Netlify CLI found');
    } catch (e) {
        console.log('📦 Installing Netlify CLI...');
        execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    }

    // Build the project
    console.log('🔨 Building project...');
    process.chdir('client');
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir('..');

    // Deploy to Netlify
    console.log('🚀 Deploying to Netlify...');
    execSync('netlify deploy --prod --dir=client/dist', { stdio: 'inherit' });

    console.log('\n✅ Deployment Complete!');
    console.log('🌐 Your site is now live on Netlify!');
    console.log('📱 Check your Netlify dashboard for the URL');

} catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have a Netlify account');
    console.log('2. Run: netlify login');
    console.log('3. Try: npm install -g netlify-cli');
    process.exit(1);
}