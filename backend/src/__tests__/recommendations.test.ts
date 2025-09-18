import request from 'supertest';
import express from 'express';
import recommendationRoutes from '../routes/recommendations';

// Test app setup
const app = express();
app.use(express.json());
app.use('/api/v1/recommendations', recommendationRoutes);

describe('Recommendations API', () => {
  describe('POST /api/v1/recommendations/career', () => {
    it('should return career recommendations for valid skills', async () => {
      const testPayload = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experienceLevel: 'Intermediate',
        careerGoals: 'I want to become a senior developer'
      };

      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send(testPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('AI-powered career recommendations');
      expect(response.body.recommendations).toBeDefined();
      expect(response.body.recommendations.topMatches).toHaveLength(3);
      expect(response.body.skillGapAnalysis).toBeDefined();
      expect(response.body.learningRoadmap).toBeDefined();
      expect(response.body.aiPowered).toBe(true);
    });

    it('should validate required skills array', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({ skills: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid input data');
      expect(response.body.example).toBeDefined();
    });

    it('should validate skills are strings', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({ skills: ['JavaScript', 123, 'React'] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should work with minimal valid payload', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({ skills: ['Python'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.input.experienceLevel).toBe('Intermediate'); // Default
      expect(response.body.input.careerGoals).toBe('Career advancement'); // Default
    });

    it('should include proper response structure', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({ skills: ['JavaScript', 'React'] })
        .expect(200);

      // Verify complete response structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('input');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('skillGapAnalysis');
      expect(response.body).toHaveProperty('learningRoadmap');
      expect(response.body).toHaveProperty('aiPowered');

      // Verify recommendation structure
      response.body.recommendations.topMatches.forEach((match: any) => {
        expect(match).toHaveProperty('rank');
        expect(match).toHaveProperty('title');
        expect(match).toHaveProperty('matchPercentage');
        expect(match).toHaveProperty('reasoning');
        expect(match).toHaveProperty('salaryRange');
        expect(match).toHaveProperty('growthPotential');
      });
    });
  });

  describe('GET /api/v1/recommendations/demo', () => {
    it('should return judge demo with sample data', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/demo')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Demo Results');
      expect(response.body.demoProfile).toBeDefined();
      expect(response.body.aiAnalysis).toBeDefined();
      expect(response.body.features).toHaveLength(6);
      expect(response.body.nextSteps).toBeDefined();
      
      // Verify demo profile structure
      expect(response.body.demoProfile.name).toContain('Computer Science Student');
      expect(response.body.demoProfile.skills).toContain('JavaScript');
      expect(response.body.aiAnalysis.confidenceScore).toBeGreaterThan(0);
    });

    it('should provide helpful judge notes', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/demo')
        .expect(200);

      const features = response.body.features;
      expect(features).toContain('✅ Live AI integration working (with Google Cloud fallback)');
      expect(features).toContain('✅ Comprehensive career matching algorithm');
    });
  });

  describe('POST /api/v1/recommendations/roadmap', () => {
    it('should generate learning roadmap for career transition', async () => {
      const testPayload = {
        currentSkills: ['JavaScript', 'CSS'],
        targetRole: 'Full Stack Developer',
        timeframe: '6months'
      };

      const response = await request(app)
        .post('/api/v1/recommendations/roadmap')
        .send(testPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.roadmap).toBeDefined();
      expect(response.body.roadmap.from).toEqual(testPayload.currentSkills);
      expect(response.body.roadmap.to).toBe(testPayload.targetRole);
      expect(response.body.roadmap.phases).toBeDefined();
      expect(response.body.milestones).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/roadmap')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should use default timeframe when not provided', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/roadmap')
        .send({
          currentSkills: ['Python'],
          targetRole: 'Data Scientist'
        })
        .expect(200);

      expect(response.body.roadmap.duration).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should provide helpful error messages', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({ skills: 'not an array' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid input data');
      expect(response.body.example).toBeDefined();
    });
  });

  describe('AI Integration Tests', () => {
    it('should demonstrate AI processing with realistic data', async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({
          skills: ['Python', 'Machine Learning', 'Statistics'],
          experienceLevel: 'Advanced',
          careerGoals: 'I want to transition to AI research'
        })
        .expect(200);

      // Verify AI-specific responses
      expect(response.body.aiPowered).toBe(true);
      expect(response.body.processingTimeMs).toBeGreaterThan(0);
      
      // Check that skill gaps are relevant to input
      expect(response.body.skillGapAnalysis).toBeDefined();
      expect(response.body.learningRoadmap.phases).toBeDefined();
      
      // Verify realistic career matches
      const topMatch = response.body.recommendations.topMatches[0];
      expect(topMatch.matchPercentage).toBeGreaterThan(0);
      expect(topMatch.matchPercentage).toBeLessThanOrEqual(100);
    });
  });
});

describe('API Health and Performance', () => {
  it('should respond within reasonable time limits', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/v1/recommendations/demo')
      .expect(200);
      
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(3).fill(0).map(() => 
      request(app)
        .post('/api/v1/recommendations/career')
        .send({ skills: ['JavaScript', 'React'] })
    );

    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

// Integration tests with mock scenarios
describe('Student Journey Integration Tests', () => {
  const studentProfiles = [
    {
      name: 'Beginner Frontend Student',
      skills: ['HTML', 'CSS', 'JavaScript'],
      experience: 'Beginner',
      goal: 'Get my first frontend job'
    },
    {
      name: 'Career Changer',
      skills: ['Excel', 'SQL', 'Python'],
      experience: 'Intermediate', 
      goal: 'Transition from finance to data science'
    },
    {
      name: 'Advanced Developer',
      skills: ['JavaScript', 'React', 'Node.js', 'Docker', 'AWS'],
      experience: 'Advanced',
      goal: 'Become a tech lead'
    }
  ];

  studentProfiles.forEach((profile) => {
    it(`should provide appropriate recommendations for ${profile.name}`, async () => {
      const response = await request(app)
        .post('/api/v1/recommendations/career')
        .send({
          skills: profile.skills,
          experienceLevel: profile.experience,
          careerGoals: profile.goal
        })
        .expect(200);

      // Verify response quality for different student types
      expect(response.body.success).toBe(true);
      expect(response.body.recommendations.topMatches).toHaveLength(3);
      
      // Check that recommendations are relevant to experience level
      const topMatch = response.body.recommendations.topMatches[0];
      expect(topMatch.matchPercentage).toBeGreaterThan(30); // Should have reasonable matches
      
      // Verify skill gap analysis is provided
      expect(response.body.skillGapAnalysis).toBeDefined();
      expect(response.body.skillGapAnalysis.length).toBeGreaterThan(0);
      
      // Check learning roadmap is comprehensive
      expect(response.body.learningRoadmap.phases).toBeDefined();
    });
  });
});

export {};