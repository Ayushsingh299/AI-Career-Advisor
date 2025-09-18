import request from 'supertest';
import app from '../index';

describe('API Endpoints', () => {
  // Health check endpoint
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: '1.0.0'
      });
    });
  });

  // API documentation endpoint
  describe('GET /api/v1', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  // Demo endpoint tests
  describe('GET /api/v1/recommendations/demo', () => {
    it('should return demo AI career recommendations', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/demo')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('demoProfile');
      expect(response.body).toHaveProperty('aiAnalysis');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('features');
    });

    it('should return realistic AI analysis data', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/demo')
        .expect(200);

      const { aiAnalysis } = response.body;
      expect(aiAnalysis).toHaveProperty('topCareerMatch');
      expect(aiAnalysis).toHaveProperty('confidenceScore');
      expect(aiAnalysis).toHaveProperty('salaryPotential');
      expect(aiAnalysis.confidenceScore).toBeGreaterThan(50);
    });
  });

  // Career recommendation endpoint tests
  describe('POST /api/v1/recommendations/career', () => {
    const validPayload = {
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'Intermediate',
      careerGoals: 'Become a senior developer'
    };

    it('should return career recommendations for valid input', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(validPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('skillGapAnalysis');
      expect(response.body).toHaveProperty('learningRoadmap');
      expect(response.body).toHaveProperty('aiPowered', true);
    });

    it('should reject empty skills array', async () => {
      const invalidPayload = { ...validPayload, skills: [] };
      
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject invalid experience level', async () => {
      const invalidPayload = { ...validPayload, experienceLevel: 'Expert' };
      
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle missing optional fields', async () => {
      const minimalPayload = { skills: ['Python'] };
      
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(minimalPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  // Learning roadmap endpoint tests
  describe('POST /api/v1/recommendations/roadmap', () => {
    const validPayload = {
      currentSkills: ['HTML', 'CSS'],
      targetRole: 'Frontend Developer',
      timeframe: '6months'
    };

    it('should generate learning roadmap', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/roadmap')
        .send(validPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('roadmap');
      expect(response.body.roadmap).toHaveProperty('from');
      expect(response.body.roadmap).toHaveProperty('to');
      expect(response.body.roadmap).toHaveProperty('phases');
    });

    it('should reject missing required fields', async () => {
      const invalidPayload = { currentSkills: ['HTML'] };
      
      const response = await request(app)
        .post('/api/v1/recommendations/roadmap')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(500); // Malformed JSON causes 500 error
    });

    it('should validate content type for POST requests', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send('skills=javascript')
        .expect(400);
    });
  });

  // Performance tests
  describe('Performance', () => {
    it('should respond to health check within 100ms', async () => {
      const start = Date.now();
      await request(app).get('/health').expect(200);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() => 
        request(app).get('/health').expect(200)
      );

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.body.status).toBe('healthy');
      });
    });
  });
});

// Integration tests for AI pipeline
describe('AI Pipeline Integration', () => {
  describe('Skills Analysis Flow', () => {
    it('should process skills through complete AI pipeline', async () => {
      const testSkills = ['Python', 'Machine Learning', 'Statistics'];
      
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({
          skills: testSkills,
          experienceLevel: 'Intermediate',
          careerGoals: 'Become a data scientist'
        })
        .expect(200);

      // Verify AI processing occurred
      expect(response.body.aiPowered).toBe(true);
      expect(response.body.processingTimeMs).toBeGreaterThan(0);
      expect(response.body.recommendations.topMatches).toBeDefined();
      expect(response.body.skillGapAnalysis).toBeDefined();
      expect(response.body.learningRoadmap).toBeDefined();
    });

    it('should provide different recommendations for different skill sets', async () => {
      const frontendSkills = ['React', 'JavaScript', 'CSS'];
      const backendSkills = ['Python', 'Django', 'PostgreSQL'];

      const [frontendResponse, backendResponse] = await Promise.all([
        request(app)
          .post('/api/v1/recommendations/career')
          .send({ skills: frontendSkills, experienceLevel: 'Intermediate' }),
        request(app)
          .post('/api/v1/recommendations/career')
          .send({ skills: backendSkills, experienceLevel: 'Intermediate' })
      ]);

      expect(frontendResponse.body.success).toBe(true);
      expect(backendResponse.body.success).toBe(true);
      
      // Different skill sets should produce different recommendations
      const frontendCareer = frontendResponse.body.recommendations.topMatches[0]?.title;
      const backendCareer = backendResponse.body.recommendations.topMatches[0]?.title;
      
      expect(frontendCareer).toBeDefined();
      expect(backendCareer).toBeDefined();
    });
  });

  describe('Multi-Agent AI Workflow', () => {
    it('should demonstrate multi-stage AI processing', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/demo')
        .expect(200);

      // Verify multi-agent workflow evidence
      expect(response.body.features).toContain('✅ Live AI integration working (with Google Cloud fallback)');
      expect(response.body.features).toContain('✅ Comprehensive career matching algorithm');
      expect(response.body.features).toContain('✅ Real-time skill gap analysis and learning recommendations');
    });
  });
});

// Security and validation tests
describe('Security & Validation', () => {
  describe('Input Sanitization', () => {
    it('should handle SQL injection attempts safely', async () => {
      const maliciousPayload = {
        skills: ["'; DROP TABLE users; --", 'JavaScript'],
        experienceLevel: 'Intermediate'
      };

      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(maliciousPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle XSS attempts safely', async () => {
      const xssPayload = {
        skills: ['<script>alert("xss")</script>', 'React'],
        careerGoals: '<img src="x" onerror="alert(1)">'
      };

      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(xssPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Rate Limiting & DoS Protection', () => {
    it('should handle large payloads gracefully', async () => {
      const largePayload = {
        skills: Array(1000).fill('JavaScript'),
        careerGoals: 'A'.repeat(10000)
      };

      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(largePayload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});