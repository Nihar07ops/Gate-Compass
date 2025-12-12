#!/usr/bin/env node

/**
 * Universal GitHub Pages Deployment Script
 * Works on Windows, Mac, and Linux
 * Requirements: Node.js 16+ and Git
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRequirements() {
    log('🔍 Checking system requirements...', 'cyan');

    try {
        // Check Node.js
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        log(`✅ Node.js: ${nodeVersion}`, 'green');

        // Check npm
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`✅ npm: ${npmVersion}`, 'green');

        // Check Git
        const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
        log(`✅ Git: ${gitVersion}`, 'green');

        // Check if we're in the right directory
        if (!fs.existsSync('client/package.json')) {
            throw new Error('Please run this script from the project root directory (where client folder is located)');
        }
        log('✅ Project structure: Valid', 'green');

        return true;
    } catch (error) {
        log(`❌ Requirement check failed: ${error.message}`, 'red');
        return false;
    }
}

function runCommand(command, description) {
    try {
        log(`\n${description}`, 'yellow');
        execSync(command, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        log(`✅ ${description} - Complete`, 'green');
    } catch (error) {
        log(`❌ ${description} - Failed`, 'red');
        throw error;
    }
}

async function deploy() {
    log('🚀 Universal GitHub Pages Deployment', 'bright');
    log('=====================================', 'bright');
    log(`📍 Operating System: ${os.type()} ${os.release()}`, 'blue');
    log(`📁 Working Directory: ${process.cwd()}`, 'blue');

    // Check requirements
    if (!checkRequirements()) {
        process.exit(1);
    }

    try {
        // Navigate to client directory
        process.chdir('client');
        log(`\n📂 Changed to client directory: ${process.cwd()}`, 'blue');

        // Install dependencies
        runCommand('npm install', '📦 Installing dependencies');

        // Build project
        runCommand('npm run build', '🔨 Building for production');

        // Check if build was successful
        if (!fs.existsSync('dist')) {
            throw new Error('Build failed - dist folder not created');
        }

        // Deploy to GitHub Pages
        runCommand('npm run deploy', '📤 Deploying to GitHub Pages');

        // Success message
        log('\n🎉 Deployment Successful!', 'green');
        log('=====================================', 'green');
        log('🌐 Your site will be available at:', 'cyan');
        log('   https://nihar07ops.github.io/Gate-Compass/', 'bright');
        log('\n⏱️  Please wait 5-10 minutes for changes to go live.', 'yellow');
        log('🔄 You may need to clear your browser cache.', 'yellow');

    } catch (error) {
        log(`\n❌ Deployment failed: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting tips:', 'yellow');
        log('1. Make sure you have internet connection', 'yellow');
        log('2. Check if Git is configured: git config --global user.name', 'yellow');
        log('3. Try: rm -rf node_modules && npm install', 'yellow');
        log('4. Make sure you have push access to the repository', 'yellow');
        process.exit(1);
    }
}

// Run deployment
deploy();