import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/v1/skills - Get all skills catalog
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Fetch from database
    const mockSkills = [
      {
        id: 1,
        name: 'JavaScript',
        category: 'Programming Languages',
        description: 'Dynamic programming language for web development',
        difficulty: 'Intermediate',
        demandLevel: 'High',
        relatedSkills: ['TypeScript', 'React', 'Node.js']
      },
      {
        id: 2,
        name: 'React',
        category: 'Frontend Frameworks',
        description: 'JavaScript library for building user interfaces',
        difficulty: 'Intermediate',
        demandLevel: 'Very High',
        relatedSkills: ['JavaScript', 'Redux', 'Next.js']
      },
      {
        id: 3,
        name: 'Node.js',
        category: 'Backend Technologies',
        description: 'JavaScript runtime for server-side development',
        difficulty: 'Intermediate',
        demandLevel: 'High',
        relatedSkills: ['Express', 'MongoDB', 'REST APIs']
      },
      {
        id: 4,
        name: 'Python',
        category: 'Programming Languages',
        description: 'Versatile programming language for various applications',
        difficulty: 'Beginner',
        demandLevel: 'Very High',
        relatedSkills: ['Django', 'Flask', 'Data Science', 'Machine Learning']
      },
      {
        id: 5,
        name: 'Machine Learning',
        category: 'AI/ML',
        description: 'Algorithms that learn from data to make predictions',
        difficulty: 'Advanced',
        demandLevel: 'Very High',
        relatedSkills: ['Python', 'TensorFlow', 'PyTorch', 'Statistics']
      },
      {
        id: 6,
        name: 'Problem Solving',
        category: 'Soft Skills',
        description: 'Ability to analyze and solve complex problems',
        difficulty: 'Intermediate',
        demandLevel: 'Essential',
        relatedSkills: ['Critical Thinking', 'Analytical Skills', 'Creativity']
      },
      {
        id: 7,
        name: 'Communication',
        category: 'Soft Skills',
        description: 'Effective verbal and written communication abilities',
        difficulty: 'Intermediate',
        demandLevel: 'Essential',
        relatedSkills: ['Presentation', 'Writing', 'Active Listening']
      }
    ];

    // Filter by category if provided
    const { category } = req.query;
    let filteredSkills = mockSkills;
    if (category) {
      filteredSkills = mockSkills.filter(skill => 
        skill.category.toLowerCase().includes((category as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredSkills,
      meta: {
        total: filteredSkills.length,
        categories: [...new Set(mockSkills.map(skill => skill.category))]
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/skills/:id - Get specific skill details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Fetch from database
    const mockSkill = {
      id: parseInt(id),
      name: 'JavaScript',
      category: 'Programming Languages',
      description: 'Dynamic programming language primarily used for web development',
      difficulty: 'Intermediate',
      demandLevel: 'High',
      relatedSkills: ['TypeScript', 'React', 'Node.js'],
      learningPath: [
        'Basic syntax and variables',
        'Functions and scope',
        'Objects and arrays',
        'DOM manipulation',
        'Asynchronous programming',
        'ES6+ features'
      ],
      marketTrends: {
        demandGrowth: '+15%',
        averageSalary: '$75,000',
        jobOpenings: '25,000+'
      },
      resources: [
        {
          type: 'Course',
          title: 'JavaScript Fundamentals',
          provider: 'CodeAcademy',
          url: 'https://example.com'
        },
        {
          type: 'Book',
          title: 'Eloquent JavaScript',
          author: 'Marijn Haverbeke',
          url: 'https://example.com'
        }
      ]
    };

    res.json({
      success: true,
      data: mockSkill
    });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/skills/trending - Get trending skills
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const trendingSkills = [
      {
        name: 'Artificial Intelligence',
        growth: '+45%',
        category: 'AI/ML',
        jobDemand: 'Very High'
      },
      {
        name: 'React',
        growth: '+25%',
        category: 'Frontend',
        jobDemand: 'Very High'
      },
      {
        name: 'Cloud Computing',
        growth: '+35%',
        category: 'Infrastructure',
        jobDemand: 'High'
      },
      {
        name: 'Cybersecurity',
        growth: '+30%',
        category: 'Security',
        jobDemand: 'Very High'
      }
    ];

    res.json({
      success: true,
      data: trendingSkills
    });
  } catch (error) {
    console.error('Get trending skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;