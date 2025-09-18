# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Google Cloud SDK
- Firebase CLI

### Initial Setup
```bash
# Install all dependencies across the entire project
npm run setup

# Individual component setup
npm run setup:frontend  # Install frontend dependencies
npm run setup:backend   # Install backend dependencies
```

### Development Server
```bash
# Start both frontend and backend in development mode
npm run dev

# Start individual services
npm run dev:frontend    # React dev server on http://localhost:3000
npm run dev:backend     # Express API server on http://localhost:3001
```

### Building
```bash
# Build both frontend and backend
npm run build

# Build individual components
npm run build:frontend  # Create production React build
npm run build:backend   # Compile TypeScript backend to JavaScript
```

### Testing
```bash
# Run all tests
npm run test

# Run component-specific tests
npm run test:frontend   # React component and unit tests
npm run test:backend    # Backend API and service tests

# Backend test variations
cd backend
npm run test:watch      # Run tests in watch mode
```

### Code Quality
```bash
# Lint all code
npm run lint

# Lint and fix issues
npm run lint:frontend && cd frontend && npm run lint:fix
npm run lint:backend && cd backend && npm run lint:fix
```

### AI/ML Development
```bash
# Python ML environment setup
cd ai-models
pip install -r requirements.txt

# Deploy ML models to Vertex AI (requires Google Cloud authentication)
python deploy_models.py
```

### Single Test Execution
```bash
# Run specific test file (backend)
cd backend && npm test -- --testPathPattern=routes/auth.test.ts

# Run specific test suite (frontend)
cd frontend && npm test -- --testNamePattern="Career Assessment"
```

## High-Level Architecture

### Project Structure
This is a **full-stack AI-powered career advisory platform** with three main components:
- `frontend/` - React TypeScript application with Material-UI
- `backend/` - Node.js Express API with TypeScript
- `ai-models/` - Python ML models and Google Cloud Vertex AI integration

### Technology Stack Overview
**Frontend**: React 18 + TypeScript + Material-UI + Firebase Auth  
**Backend**: Express.js + TypeScript + Firebase Admin + Google Cloud APIs  
**AI/ML**: Google Cloud Vertex AI + AutoML + Natural Language API + Python ML stack  
**Database**: Cloud Firestore (NoSQL document database)  
**Infrastructure**: Google Cloud Run + Firebase Hosting

### Core Data Flow
1. **User Authentication**: Firebase Auth handles user sessions with JWT tokens
2. **Skills Assessment**: Frontend collects user data → Backend validates → AI models analyze via Vertex AI
3. **Career Recommendations**: AI processing generates personalized career paths and skill recommendations
4. **Real-time Updates**: Firestore provides live data synchronization between components

### Backend API Design
The backend follows RESTful API patterns with these main endpoints:
- `/api/v1/auth` - Authentication and user management
- `/api/v1/assessments` - Skills assessment processing
- `/api/v1/recommendations` - AI-generated career recommendations  
- `/api/v1/skills` - Skills catalog and metadata
- `/api/v1/careers` - Career information and market data

Route implementations are planned but not yet created (see commented imports in `backend/src/index.ts`).

### AI/ML Integration Architecture
- **Google Cloud Vertex AI**: Custom career matching models
- **Natural Language API**: Resume analysis and text processing
- **AutoML**: Automated model training for career predictions
- **Python Stack**: TensorFlow, PyTorch, scikit-learn for model development

### Environment Configuration
The application requires multiple environment configurations:
- **Backend**: Google Cloud service account credentials, Firebase config, API keys
- **Frontend**: Firebase client config, API base URL
- **AI Models**: Google Cloud project ID, Vertex AI region settings

### Development Patterns
- **TypeScript Path Aliases**: Backend uses `@/*` imports for clean module resolution
- **Monorepo Structure**: Root-level scripts orchestrate frontend/backend operations
- **Concurrent Development**: `npm run dev` starts both services simultaneously
- **Strict TypeScript**: Both frontend and backend use strict TypeScript compilation

### Security Architecture
- **Firebase Authentication**: JWT token-based auth with role-based access control
- **API Security**: Helmet middleware, CORS configuration, input validation with Joi
- **Cloud Security**: Service account permissions, Firestore security rules

### Deployment Architecture
- **Backend**: Google Cloud Run with auto-scaling
- **Frontend**: Firebase Hosting with CDN
- **AI Models**: Vertex AI model endpoints
- **Database**: Firestore with automatic scaling
- **CI/CD**: Google Cloud Build with automated triggers

### Current Development State
The project is in **early development phase**:
- Basic backend server structure is set up with health check endpoint
- Package configurations and dependencies are established
- Route handlers are planned but not implemented (see TODO comments in backend)
- AI model training scripts and deployment procedures are outlined
- Frontend structure is configured but implementation is minimal

When working with this codebase, prioritize implementing the missing route handlers in the backend and connecting them to the corresponding Vertex AI services for the core career advisory functionality.