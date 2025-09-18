import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin (suppress warning in development)
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS not set. Firebase features may not work.');
  }
  // In development, we'll use mock Firebase features
  console.log('🚀 Running in development mode - Firebase features mocked');
} else {
  try {
    initializeApp({
      credential: cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error.message);
  }
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Career Skills Advisor API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      skills: '/api/v1/skills',
      careers: '/api/v1/careers',
      assessments: '/api/v1/assessments',
      resume: '/api/v1/resume',
      recommendations: '/api/v1/recommendations',
      judgeDemo: '/api/v1/recommendations/demo'
    }
  });
});

// Route imports
import authRoutes from './routes/auth';
import skillsRoutes from './routes/skills';
import assessmentRoutes from './routes/assessments';
import careersRoutes from './routes/careers';
import resumeRoutes from './routes/resume';
import recommendationRoutes from './routes/recommendations';
// TODO: Add remaining routes
// import userRoutes from './routes/users';

// Apply routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/careers', careersRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
// TODO: Add remaining routes when created
// app.use('/api/v1/users', userRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log(`🚀 Career Skills Advisor API running on port ${port}`);
    console.log(`📊 Health check available at http://localhost:${port}/health`);
    console.log(`🔗 API documentation at http://localhost:${port}/api/v1`);
    console.log(`🔥 Server ready to accept connections...`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
} else {
  console.log('Running in test mode - server not started');
}

export default app;
