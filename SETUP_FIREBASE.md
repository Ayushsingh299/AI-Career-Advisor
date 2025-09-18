# 🔥 Firebase & Google Cloud Setup Guide

This guide will help you set up Firebase Authentication and Google Cloud AI services for your Career Skills Advisor application.

## 📋 Prerequisites Completed
- ✅ Firebase CLI installed and authenticated (`firebase login` completed)
- ✅ Project structure and configuration files created
- ✅ Firebase configuration files ready (`firebase.json`, `firestore.rules`, etc.)

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project Manually

Since we need to accept Google Cloud Terms of Service, create the project through the web console:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Add project" or "Create a project"**
3. **Project Configuration**:
   - **Project name**: `Career Skills Advisor`
   - **Project ID**: `career-skills-advisor-2024` (or let Firebase auto-generate)
   - **Location**: Choose your preferred region (e.g., `us-central1`)
4. **Google Analytics**: Enable (recommended for user insights)
5. **Accept Terms of Service** when prompted
6. **Click "Create project"**

### Step 2: Enable Firebase Services

In your newly created Firebase project:

#### 🔐 Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/password** provider
3. (Optional) Enable **Google** sign-in for social login

#### 🗄️ Enable Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we have security rules ready)
4. Select your preferred location (same as project location)

#### 💾 Enable Storage
1. Go to **Storage**
2. Click **Get started**
3. Use default security rules (we have custom rules ready)

### Step 3: Get Firebase Configuration

1. Go to **Project settings** (gear icon) → **General**
2. Scroll to **Your apps** section
3. Click **Add app** → **Web app**
4. **App nickname**: `Career Skills Advisor Web`
5. **Check "Also set up Firebase Hosting"**
6. Copy the Firebase configuration object

### Step 4: Connect Your Local Project

```powershell
# In your project directory
firebase use --add

# Select the project you just created
# Choose an alias: default
```

### Step 5: Update Environment Variables

#### Frontend (.env)
Update `frontend/.env` with your actual Firebase config:

```env
# Replace with your actual Firebase configuration
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=career-skills-advisor-2024.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=career-skills-advisor-2024
REACT_APP_FIREBASE_STORAGE_BUCKET=career-skills-advisor-2024.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
REACT_APP_ENV=development
```

#### Backend (.env)
Update `backend/.env`:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
GOOGLE_CLOUD_PROJECT_ID=career-skills-advisor-2024
# GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json (we'll set this up next)

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Cloud AI
VERTEX_AI_LOCATION=us-central1

# Logging
LOG_LEVEL=debug
```

### Step 6: Create Service Account for Backend

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (career-skills-advisor-2024)
3. **Navigate to**: IAM & Admin → Service Accounts
4. **Click "Create Service Account"**
5. **Service Account Details**:
   - **Name**: `career-advisor-service-account`
   - **Description**: `Service account for Career Skills Advisor backend`
6. **Grant Roles**:
   - `Firebase Admin SDK Administrator Service Agent`
   - `Cloud Datastore User`
   - `AI Platform Developer` (for Vertex AI)
   - `Cloud Storage Object Admin`
7. **Create and Download Key**:
   - Click on the created service account
   - Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
   - Download and save as `backend/service-account-key.json`

### Step 7: Deploy Firebase Configuration

```powershell
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy storage rules
firebase deploy --only storage
```

### Step 8: Initialize Firestore with Sample Data

```powershell
# Set environment variable for service account
$env:GOOGLE_APPLICATION_CREDENTIALS = "backend/service-account-key.json"

# Install dependencies for the script
cd scripts
npm install firebase-admin

# Run the initialization script
node init-firestore-data.js
```

### Step 9: Enable Google Cloud AI APIs

1. **Go to Google Cloud Console** → **APIs & Services** → **Library**
2. **Enable these APIs**:
   - ✅ **Vertex AI API**
   - ✅ **Cloud Natural Language API**
   - ✅ **AutoML API**
   - ✅ **Cloud Translation API** (optional)

### Step 10: Test the Setup

#### Start the Backend
```powershell
cd backend
$env:GOOGLE_APPLICATION_CREDENTIALS = "./service-account-key.json"
npm run dev
```

#### Start the Frontend (in new terminal)
```powershell
cd frontend
npm start
```

#### Test Authentication Flow
1. Go to http://localhost:3000
2. Click **Login**
3. Try **Sign Up** with a test email
4. Verify user creation in Firebase Console → Authentication

## 🔍 Verification Checklist

- [ ] Firebase project created and configured
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Service account created and key downloaded
- [ ] Environment variables updated
- [ ] Firebase rules deployed
- [ ] Sample data populated in Firestore
- [ ] Google Cloud AI APIs enabled
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] User registration/login works
- [ ] Data appears in Firebase Console

## 🛠️ Useful Firebase Commands

```powershell
# Check current project
firebase projects:list

# Use specific project
firebase use career-skills-advisor-2024

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only hosting
firebase deploy --only storage

# Start Firebase emulators for local development
firebase emulators:start

# View Firebase logs
firebase functions:log
```

## 🔐 Security Best Practices

1. **Never commit service account keys to Git**
   - Add `service-account-key.json` to `.gitignore`
   - Use environment variables in production

2. **Secure your Firebase rules**
   - Test rules using Firebase Rules Playground
   - Regularly review access patterns

3. **Rotate credentials regularly**
   - Generate new service account keys periodically
   - Update API keys if compromised

## 🚀 Production Deployment

For production deployment:

1. **Firebase Hosting**:
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```

2. **Backend Deployment** (Google Cloud Run):
   ```powershell
   gcloud run deploy career-advisor-backend --source=backend --region=us-central1
   ```

## 🆘 Troubleshooting

### Common Issues:

**"Terms of Service not accepted"**
- Create project manually through Firebase Console

**"Service account key not found"**
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Check file permissions

**"Insufficient permissions"**
- Verify service account has required roles
- Check Firestore security rules

**"CORS errors"**
- Update `FRONTEND_URL` in backend .env
- Check Firebase project configuration

## 🎉 Next Steps

Once setup is complete:

1. **Customize the UI** with your branding
2. **Add more skills and careers** to the database
3. **Implement real AI models** using Vertex AI
4. **Set up monitoring and analytics**
5. **Deploy to production**

Your Career Skills Advisor is now ready for development! 🚀