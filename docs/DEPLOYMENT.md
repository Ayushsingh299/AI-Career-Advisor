# Deployment Guide

## Prerequisites

Before deploying the Career Skills Advisor, ensure you have:

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed and configured
3. **Firebase CLI** installed
4. **Node.js 18+** and **Python 3.9+**
5. **Docker** (optional, for containerized deployment)

## Google Cloud Setup

### 1. Create a New Project

```bash
# Create a new Google Cloud project
gcloud projects create career-skills-advisor --name="Career Skills Advisor"

# Set the project as default
gcloud config set project career-skills-advisor
```

### 2. Enable Required APIs

```bash
# Enable all required Google Cloud APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable language.googleapis.com
gcloud services enable automl.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firebase.googleapis.com
```

### 3. Create Service Account

```bash
# Create service account for the application
gcloud iam service-accounts create career-advisor-sa \
    --description="Service account for Career Skills Advisor" \
    --display-name="Career Advisor Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding career-skills-advisor \
    --member="serviceAccount:career-advisor-sa@career-skills-advisor.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding career-skills-advisor \
    --member="serviceAccount:career-advisor-sa@career-skills-advisor.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding career-skills-advisor \
    --member="serviceAccount:career-advisor-sa@career-skills-advisor.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download service account key
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=career-advisor-sa@career-skills-advisor.iam.gserviceaccount.com
```

## Firebase Setup

### 1. Initialize Firebase

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project directory
firebase init

# Select the following services:
# - Firestore
# - Storage
# - Hosting (for frontend)
# - Functions (for cloud functions)
```

### 2. Configure Firestore

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Environment Configuration

### 1. Backend Environment

Create `backend/.env` file based on `.env.example`:

```bash
# Copy environment template
cp .env.example backend/.env

# Edit the environment file with your actual values
# - Google Cloud project ID
# - Firebase configuration
# - API keys
# - Security secrets
```

### 2. Frontend Environment

Create `frontend/.env` file:

```bash
# Firebase configuration for frontend
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=career-skills-advisor.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=career-skills-advisor
REACT_APP_FIREBASE_STORAGE_BUCKET=career-skills-advisor.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Backend API URL
REACT_APP_API_BASE_URL=https://your-backend-url.run.app
```

## Deployment Steps

### 1. Build and Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Google Cloud Run
gcloud run deploy career-advisor-backend \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production"
```

### 2. Deploy AI Models

```bash
# Navigate to ai-models directory
cd ai-models

# Install Python dependencies
pip install -r requirements.txt

# Deploy models to Vertex AI
python deploy_models.py

# Or using gcloud CLI
gcloud ai models deploy MODEL_ID \
    --region=us-central1 \
    --display-name="career-skills-model"
```

### 3. Build and Deploy Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 4. Deploy Cloud Functions

```bash
# Navigate to cloud-functions directory
cd cloud-functions

# Deploy all functions
firebase deploy --only functions
```

## CI/CD Pipeline

### Google Cloud Build Configuration

Create `cloudbuild.yaml` in the root directory:

```yaml
steps:
  # Build backend
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'backend'

  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'backend'

  # Build frontend
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'frontend'

  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'frontend'

  # Deploy backend to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'career-advisor-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/career-advisor-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

  # Deploy frontend to Firebase Hosting
  - name: 'gcr.io/cloud-builders/firebase'
    args: ['deploy', '--only', 'hosting']
    dir: 'frontend'
```

### Set up Build Triggers

```bash
# Create build trigger for main branch
gcloud builds triggers create github \
    --repo-name=career-skills-advisor \
    --repo-owner=your-github-username \
    --branch-pattern=main \
    --build-config=cloudbuild.yaml
```

## Monitoring and Logging

### 1. Enable Monitoring

```bash
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com

# Create uptime checks
gcloud alpha monitoring uptime create career-advisor-uptime \
    --hostname=your-backend-url.run.app \
    --path=/health
```

### 2. Set up Alerting

```bash
# Create notification channel (email)
gcloud alpha monitoring channels create \
    --display-name="Career Advisor Alerts" \
    --type=email \
    --channel-labels=email_address=your-email@example.com

# Create alerting policy
gcloud alpha monitoring policies create \
    --policy-from-file=monitoring-policy.yaml
```

## Security Configuration

### 1. Configure CORS

Ensure your backend CORS settings only allow your frontend domain:

```javascript
app.use(cors({
  origin: ['https://your-app.web.app', 'https://your-custom-domain.com'],
  credentials: true
}));
```

### 2. Set up SSL/TLS

```bash
# For custom domain on Firebase Hosting
firebase hosting:channel:create your-domain

# For Cloud Run (automatic with custom domain mapping)
gcloud run domain-mappings create \
    --service=career-advisor-backend \
    --domain=api.your-domain.com \
    --region=us-central1
```

## Production Checklist

- [ ] All environment variables are set correctly
- [ ] Service account permissions are properly configured
- [ ] Firestore security rules are deployed
- [ ] SSL certificates are configured
- [ ] Monitoring and alerting are set up
- [ ] Backup strategy is implemented
- [ ] Rate limiting is configured
- [ ] Error tracking is enabled
- [ ] Performance monitoring is active
- [ ] Security headers are configured

## Rollback Procedures

### Backend Rollback

```bash
# List previous revisions
gcloud run revisions list --service=career-advisor-backend

# Roll back to previous revision
gcloud run services update-traffic career-advisor-backend \
    --to-revisions=career-advisor-backend-00001-abc=100
```

### Frontend Rollback

```bash
# List hosting versions
firebase hosting:versions:list

# Rollback to previous version
firebase hosting:rollback
```

## Scaling Configuration

### Backend Auto-scaling

```bash
# Configure Cloud Run scaling
gcloud run services update career-advisor-backend \
    --max-instances=100 \
    --min-instances=1 \
    --concurrency=80
```

### Database Scaling

Firestore automatically scales, but consider:
- Index optimization
- Query optimization
- Data partitioning strategies

## Cost Optimization

- Use Cloud Run min-instances=0 for cost savings
- Implement efficient caching strategies
- Monitor and optimize AI API usage
- Use Cloud Storage lifecycle policies
- Regular cost analysis and optimization