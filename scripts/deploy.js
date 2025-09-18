#!/usr/bin/env node

/**
 * Firebase Deployment Script for Hackathon Demo
 * 
 * This script builds and deploys the Career Skills Advisor to Firebase Hosting
 * for live demonstration during hackathons and presentations.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Career Skills Advisor Deployment...\n');

// Check if firebase CLI is available
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    console.log('✅ Firebase CLI found');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI not found. Installing...');
    try {
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
      console.log('✅ Firebase CLI installed');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Firebase CLI');
      console.error('Please run: npm install -g firebase-tools');
      return false;
    }
  }
}

// Build the frontend
function buildFrontend() {
  console.log('\n📦 Building frontend...');
  try {
    process.chdir(path.join(__dirname, '..', 'frontend'));
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build completed');
    return true;
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    return false;
  }
}

// Initialize Firebase project
function initializeFirebase() {
  console.log('\n🔥 Checking Firebase configuration...');
  process.chdir(path.join(__dirname, '..'));
  
  if (!fs.existsSync('firebase.json')) {
    console.log('❌ firebase.json not found. Please run firebase init first.');
    return false;
  }
  
  console.log('✅ Firebase configuration found');
  return true;
}

// Deploy to Firebase
function deployToFirebase() {
  console.log('\n🚀 Deploying to Firebase Hosting...');
  try {
    execSync('firebase deploy --only hosting', { stdio: 'inherit' });
    console.log('\n🎉 Deployment successful!');
    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

// Get project info
function getProjectInfo() {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log('\n📋 Project Information:');
    console.log(`   Name: ${packageJson.name}`);
    console.log(`   Version: ${packageJson.version}`);
    console.log(`   Build Folder: ${firebaseConfig.hosting?.public || 'frontend/build'}`);
    
    // Try to get Firebase project ID
    try {
      const projectInfo = execSync('firebase projects:list --json', { encoding: 'utf8' });
      const projects = JSON.parse(projectInfo);
      if (projects.length > 0) {
        console.log(`   Firebase Project: ${projects[0].projectId}`);
        console.log(`   🌐 Live URL: https://${projects[0].projectId}.web.app`);
      }
    } catch (e) {
      console.log('   Firebase Project: Not configured or not logged in');
    }
    
  } catch (error) {
    console.log('   Could not read project configuration');
  }
}

// Create demo data for deployment
function createDemoEnvironment() {
  console.log('\n🎯 Setting up demo environment...');
  
  const demoEnvContent = `
# Demo Environment Configuration
REACT_APP_API_URL=https://career-advisor-api.web.app
REACT_APP_FIREBASE_API_KEY=demo-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=career-advisor-demo.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=career-advisor-demo
REACT_APP_FIREBASE_STORAGE_BUCKET=career-advisor-demo.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
REACT_APP_DEMO_MODE=true
`;
  
  const envPath = path.join(__dirname, '..', 'frontend', '.env.production');
  fs.writeFileSync(envPath, demoEnvContent);
  console.log('✅ Demo environment configured');
}

// Main deployment process
async function main() {
  console.log('🎯 AI Career Skills Advisor - Hackathon Deployment');
  console.log('=' .repeat(60));
  
  // Step 1: Check prerequisites
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }
  
  // Step 2: Setup demo environment
  createDemoEnvironment();
  
  // Step 3: Build frontend
  if (!buildFrontend()) {
    process.exit(1);
  }
  
  // Step 4: Initialize Firebase
  if (!initializeFirebase()) {
    console.log('\n🔧 To initialize Firebase:');
    console.log('1. Run: firebase login');
    console.log('2. Run: firebase init hosting');
    console.log('3. Select existing project or create new one');
    console.log('4. Set public directory to: frontend/build');
    console.log('5. Configure as single-page app: Yes');
    console.log('6. Run this script again');
    process.exit(1);
  }
  
  // Step 5: Deploy
  if (!deployToFirebase()) {
    process.exit(1);
  }
  
  // Step 6: Show project info
  getProjectInfo();
  
  console.log('\n🎉 Deployment Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Test your live demo URL');
  console.log('   2. Share the URL with hackathon judges');
  console.log('   3. Use /demo route for live AI demonstration');
  console.log('   4. Monitor usage with Firebase Analytics');
  
  console.log('\n🏆 Your AI Career Advisor is now live and ready for the hackathon!');
}

// Run the deployment
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { main };