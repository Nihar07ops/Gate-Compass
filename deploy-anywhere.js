#!/usr/bin/env node

/**
 * Universal Deployment Script
 * Choose your hosting platform and deploy!
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🌐 Gate Compass - Universal Deployment');
console.log('=====================================');
console.log('Choose your hosting platform:\n');

console.log('1. 🚀 Vercel (Recommended - Free, Fast, React-optimized)');
console.log('2. 🌊 Netlify (Free, Great features, Form handling)');
console.log('3. ⚡ Surge.sh (Super simple, Instant deployment)');
console.log('4. 📄 GitHub Pages (Free, GitHub integration)');
console.log('5. 🔥 Firebase (Google platform, Analytics)');
console.log('6. ❌ Cancel\n');

rl.question('Enter your choice (1-6): ', (answer) => {
    rl.close();

    switch (answer.trim()) {
        case '1':
            console.log('\n🚀 Deploying to Vercel...');
            deployToVercel();
            break;
        case '2':
            console.log('\n🌊 Deploying to Netlify...');
            deployToNetlify();
            break;
        case '3':
            console.log('\n⚡ Deploying to Surge.sh...');
            deployToSurge();
            break;
        case '4':
            console.log('\n📄 Deploying to GitHub Pages...');
            deployToGitHubPages();
            break;
        case '5':
            console.log('\n🔥 Deploying to Firebase...');
            deployToFirebase();
            break;
        case '6':
            console.log('👋 Deployment cancelled.');
            process.exit(0);
            break;
        default:
            console.log('❌ Invalid choice. Please run the script again.');
            process.exit(1);
    }
});

function deployToVercel() {
    try {
        execSync('node deploy-vercel.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('\n📋 Manual Vercel deployment:');
        console.log('1. Go to https://vercel.com');
        console.log('2. Sign up with GitHub');
        console.log('3. Import your repository');
        console.log('4. Set root directory to "client"');
        console.log('5. Deploy!');
    }
}

function deployToNetlify() {
    try {
        execSync('node deploy-netlify.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('\n📋 Manual Netlify deployment:');
        console.log('1. Go to https://netlify.com');
        console.log('2. Drag and drop your client/dist folder');
        console.log('3. Or connect your GitHub repository');
    }
}

function deployToSurge() {
    try {
        execSync('node deploy-surge.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('\n📋 Manual Surge deployment:');
        console.log('cd client && npm run build && cd dist && npx surge');
    }
}

function deployToGitHubPages() {
    try {
        execSync('node deploy-universal.js', { stdio: 'inherit' });
    } catch (error) {
        console.log('\n📋 Manual GitHub Pages deployment:');
        console.log('cd client && npm run build && npm run deploy');
    }
}

function deployToFirebase() {
    console.log('\n🔥 Firebase Hosting Setup:');
    console.log('1. Install: npm install -g firebase-tools');
    console.log('2. Login: firebase login');
    console.log('3. Init: firebase init hosting');
    console.log('4. Set public directory to: client/dist');
    console.log('5. Build: cd client && npm run build');
    console.log('6. Deploy: firebase deploy');

    console.log('\n🤖 Attempting automatic setup...');
    try {
        execSync('cd client && npm run build', { stdio: 'inherit' });
        console.log('✅ Build complete! Now run: firebase init && firebase deploy');
    } catch (error) {
        console.log('❌ Build failed. Please check your setup.');
    }
}