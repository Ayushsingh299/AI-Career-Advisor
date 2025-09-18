import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import geminiAI from '../services/geminiAI';

const router = Router();

// POST /api/v1/assessments - Submit a new skills assessment
router.post('/', [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').isInt().withMessage('Question ID must be a number'),
  body('answers.*.answer').notEmpty().withMessage('Answer is required'),
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { answers } = req.body;

    // Process answers with Gemini AI
    const skillsAnalysis = await geminiAI.analyzeSkillsFromAssessment(answers);
    
    // Extract career goals from answers
    const careerGoals = answers.find((a: any) => a.questionId === 4)?.answer || 'Advance my career';
    
    // Generate AI-powered career matches
    const careerMatches = await geminiAI.generateCareerMatches(
      skillsAnalysis.extractedSkills, 
      careerGoals
    );

    // Generate learning path
    const learningPath = await geminiAI.generateLearningPath(
      skillsAnalysis.extractedSkills,
      careerMatches[0]?.title || 'Software Developer'
    );

    const aiResults = {
      assessmentId: 'assessment-' + Date.now(),
      userId: 'user123', // TODO: Get from authentication
      completedAt: new Date(),
      skillLevels: Object.entries(skillsAnalysis.proficiencyLevels).map(([skill, level]) => ({
        skill,
        level,
        category: categorizeSkill(skill)
      })),
      skillGaps: skillsAnalysis.skillGaps,
      recommendations: skillsAnalysis.recommendations,
      recommendedCareers: careerMatches.map(match => ({
        title: match.title,
        match: match.matchPercentage,
        description: match.reasoning,
        skills: [],
        salaryRange: match.salaryRange,
        missingSkills: match.missingSkills
      })),
      learningPath: learningPath,
      aiPowered: true,
      processingTime: Date.now() - Date.now() // Will be calculated properly
    };

    res.status(201).json({
      success: true,
      message: 'Assessment processed with AI analysis',
      data: aiResults
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/assessments/:id - Get assessment results
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Fetch from database
    const mockAssessment = {
      assessmentId: id,
      userId: 'user123',
      completedAt: new Date(),
      skillLevels: [
        { skill: 'JavaScript', level: 85, category: 'Programming' },
        { skill: 'React', level: 75, category: 'Frontend' },
        { skill: 'Problem Solving', level: 90, category: 'Soft Skills' },
      ],
      recommendedCareers: [
        {
          title: 'Frontend Developer',
          match: 92,
          description: 'Build user interfaces and web applications',
          skills: ['React', 'JavaScript', 'CSS', 'HTML']
        }
      ]
    };

    res.json({
      success: true,
      data: mockAssessment
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/assessments - Get user's assessment history
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Get user ID from authentication and fetch from database
    const mockAssessments = [
      {
        assessmentId: 'assessment-1',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        skillsCount: 5,
        overallScore: 82
      },
      {
        assessmentId: 'assessment-2',
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        skillsCount: 4,
        overallScore: 78
      }
    ];

    res.json({
      success: true,
      data: mockAssessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to categorize skills
function categorizeSkill(skill: string): string {
  const skillCategories = {
    'Programming': ['JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'Go', 'React', 'Vue.js', 'Angular', 'Node.js'],
    'Soft Skills': ['Problem Solving', 'Communication', 'Leadership', 'Teamwork', 'Time Management'],
    'Tools': ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'CI/CD'],
    'Design': ['UI/UX', 'Figma', 'Photoshop', 'Sketch'],
    'Data': ['SQL', 'Machine Learning', 'Data Analysis', 'Statistics', 'Excel']
  };
  
  for (const [category, skills] of Object.entries(skillCategories)) {
    if (skills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
      return category;
    }
  }
  return 'Other';
}

export default router;
