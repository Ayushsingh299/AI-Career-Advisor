import { Router, Request, Response } from 'express';

const router = Router();

// Sample career database
const CAREERS_DATABASE = [
  {
    id: 'frontend-dev',
    title: 'Frontend Developer',
    category: 'Software Development',
    description: 'Design and build user interfaces for web and mobile applications',
    averageSalary: '$75,000 - $120,000',
    growthRate: '+13% (2023-2033)',
    requiredSkills: ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript', 'UI/UX Design'],
    preferredSkills: ['Vue.js', 'Angular', 'Sass', 'Webpack', 'Testing Frameworks'],
    industries: ['Technology', 'E-commerce', 'Fintech', 'Healthcare', 'Media'],
    workEnvironment: 'Remote-friendly, collaborative teams, fast-paced development cycles',
    dayInLife: [
      'Review and plan daily development tasks',
      'Code new features and components',
      'Collaborate with designers on UI/UX',
      'Test and debug applications',
      'Participate in code reviews'
    ]
  },
  {
    id: 'full-stack-dev',
    title: 'Full Stack Developer',
    category: 'Software Development',
    description: 'Work on both frontend and backend systems, handling end-to-end development',
    averageSalary: '$80,000 - $140,000',
    growthRate: '+15% (2023-2033)',
    requiredSkills: ['JavaScript', 'Node.js', 'React', 'Databases', 'RESTful APIs', 'Git'],
    preferredSkills: ['Python', 'Docker', 'AWS', 'MongoDB', 'GraphQL', 'DevOps'],
    industries: ['Startups', 'Technology', 'Consulting', 'SaaS', 'Enterprise'],
    workEnvironment: 'Versatile role, high autonomy, cross-functional collaboration',
    dayInLife: [
      'Design system architecture',
      'Develop API endpoints',
      'Build user interfaces',
      'Optimize database queries',
      'Deploy and monitor applications'
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Analyze complex data to derive insights and build predictive models',
    averageSalary: '$95,000 - $165,000',
    growthRate: '+22% (2023-2033)',
    requiredSkills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization'],
    preferredSkills: ['R', 'TensorFlow', 'PyTorch', 'Tableau', 'Spark', 'A/B Testing'],
    industries: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Government'],
    workEnvironment: 'Research-focused, analytical thinking, interdisciplinary teams',
    dayInLife: [
      'Collect and clean datasets',
      'Perform exploratory data analysis',
      'Build and train ML models',
      'Create data visualizations',
      'Present insights to stakeholders'
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'Product & Strategy',
    description: 'Drive product strategy, roadmap, and cross-functional execution',
    averageSalary: '$90,000 - $160,000',
    growthRate: '+18% (2023-2033)',
    requiredSkills: ['Strategy', 'Analytics', 'Communication', 'User Research', 'Agile'],
    preferredSkills: ['SQL', 'Wireframing', 'A/B Testing', 'Project Management', 'Market Research'],
    industries: ['Technology', 'SaaS', 'E-commerce', 'Fintech', 'Gaming'],
    workEnvironment: 'Cross-functional leadership, strategic thinking, customer-focused',
    dayInLife: [
      'Analyze user feedback and metrics',
      'Define product requirements',
      'Coordinate with engineering teams',
      'Conduct market research',
      'Present to executives and stakeholders'
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Infrastructure & Operations',
    description: 'Automate development processes and manage cloud infrastructure',
    averageSalary: '$85,000 - $145,000',
    growthRate: '+20% (2023-2033)',
    requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms', 'Scripting'],
    preferredSkills: ['Terraform', 'Ansible', 'Monitoring Tools', 'Security', 'Networking'],
    industries: ['Technology', 'Cloud Services', 'Enterprise', 'Startups', 'Consulting'],
    workEnvironment: 'Automation-focused, on-call responsibilities, infrastructure ownership',
    dayInLife: [
      'Monitor system performance',
      'Automate deployment pipelines',
      'Manage cloud infrastructure',
      'Troubleshoot production issues',
      'Implement security measures'
    ]
  }
];

// GET /api/v1/careers - Get all available careers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, skills, salaryMin, salaryMax } = req.query;
    
    let filteredCareers = [...CAREERS_DATABASE];
    
    // Filter by category
    if (category) {
      filteredCareers = filteredCareers.filter(career => 
        career.category.toLowerCase().includes((category as string).toLowerCase())
      );
    }
    
    // Filter by skills
    if (skills) {
      const skillList = (skills as string).split(',').map(s => s.trim());
      filteredCareers = filteredCareers.filter(career =>
        skillList.some(skill =>
          career.requiredSkills.some(reqSkill =>
            reqSkill.toLowerCase().includes(skill.toLowerCase())
          ) ||
          career.preferredSkills.some(prefSkill =>
            prefSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    res.json({
      success: true,
      data: {
        careers: filteredCareers,
        totalCount: filteredCareers.length,
        filters: {
          categories: [...new Set(CAREERS_DATABASE.map(c => c.category))],
          industries: [...new Set(CAREERS_DATABASE.flatMap(c => c.industries))],
          skillsPool: [...new Set(CAREERS_DATABASE.flatMap(c => [...c.requiredSkills, ...c.preferredSkills]))]
        }
      }
    });
  } catch (error) {
    console.error('Get careers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/careers/:id - Get specific career details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const career = CAREERS_DATABASE.find(c => c.id === id);
    
    if (!career) {
      res.status(404).json({
        success: false,
        message: 'Career not found'
      });
      return;
    }
    
    // Add related careers
    const relatedCareers = CAREERS_DATABASE
      .filter(c => c.id !== id && c.category === career.category)
      .slice(0, 3);
    
    res.json({
      success: true,
      data: {
        ...career,
        relatedCareers: relatedCareers.map(c => ({
          id: c.id,
          title: c.title,
          category: c.category,
          averageSalary: c.averageSalary
        }))
      }
    });
  } catch (error) {
    console.error('Get career error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/v1/careers/match - Get career matches based on skills
router.post('/match', async (req: Request, res: Response) => {
  try {
    const { skills, preferences = {} } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      res.status(400).json({
        success: false,
        message: 'Skills array is required'
      });
      return;
    }
    
    // Calculate match scores
    const careerMatches = CAREERS_DATABASE.map(career => {
      let matchScore = 0;
      let skillsMatched = 0;
      
      // Check required skills
      career.requiredSkills.forEach(reqSkill => {
        if (skills.some(skill => skill.toLowerCase() === reqSkill.toLowerCase())) {
          matchScore += 10; // Higher weight for required skills
          skillsMatched++;
        }
      });
      
      // Check preferred skills
      career.preferredSkills.forEach(prefSkill => {
        if (skills.some(skill => skill.toLowerCase() === prefSkill.toLowerCase())) {
          matchScore += 5; // Lower weight for preferred skills
          skillsMatched++;
        }
      });
      
      // Calculate percentage match
      const totalSkills = career.requiredSkills.length + career.preferredSkills.length;
      const matchPercentage = Math.min(Math.round((matchScore / (totalSkills * 10)) * 100), 100);
      
      return {
        ...career,
        matchPercentage,
        skillsMatched,
        totalSkills,
        matchedSkills: skills.filter(skill =>
          career.requiredSkills.some(reqSkill => reqSkill.toLowerCase() === skill.toLowerCase()) ||
          career.preferredSkills.some(prefSkill => prefSkill.toLowerCase() === skill.toLowerCase())
        ),
        missingRequiredSkills: career.requiredSkills.filter(reqSkill =>
          !skills.some(skill => skill.toLowerCase() === reqSkill.toLowerCase())
        )
      };
    });
    
    // Sort by match percentage and filter out low matches
    const sortedMatches = careerMatches
      .filter(match => match.matchPercentage >= 20)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        matches: sortedMatches,
        summary: {
          totalCareersAnalyzed: CAREERS_DATABASE.length,
          relevantMatches: sortedMatches.length,
          topMatch: sortedMatches[0] || null,
          averageMatch: sortedMatches.length > 0 
            ? Math.round(sortedMatches.reduce((sum, match) => sum + match.matchPercentage, 0) / sortedMatches.length)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Career matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;