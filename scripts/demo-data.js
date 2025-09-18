#!/usr/bin/env node

/**
 * Demo Data Generator for AI Career Skills Advisor
 * 
 * This script generates comprehensive sample data for demonstration purposes
 * including user profiles, assessment results, career paths, and more.
 */

const fs = require('fs');
const path = require('path');

// Demo Users
const DEMO_USERS = [
  {
    id: 'demo-user-1',
    email: 'sarah.tech@example.com',
    name: 'Sarah Johnson',
    title: 'Frontend Developer',
    bio: 'Passionate frontend developer with 3 years of experience building modern web applications',
    location: 'San Francisco, CA',
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript', 'Git'],
    experience: [
      {
        company: 'TechStart Inc.',
        position: 'Frontend Developer',
        duration: '2021 - Present',
        description: 'Building responsive React applications for B2B clients'
      }
    ],
    education: {
      degree: 'BS Computer Science',
      institution: 'UC Berkeley',
      year: '2021'
    },
    assessmentScore: 85,
    careerGoal: 'Senior Frontend Developer'
  },
  {
    id: 'demo-user-2',
    email: 'mike.data@example.com',
    name: 'Mike Chen',
    title: 'Data Analyst',
    bio: 'Data-driven professional with expertise in Python and machine learning',
    location: 'Seattle, WA',
    skills: ['Python', 'SQL', 'Pandas', 'Matplotlib', 'Statistics', 'Excel'],
    experience: [
      {
        company: 'DataCorp',
        position: 'Junior Data Analyst',
        duration: '2022 - Present',
        description: 'Analyzing customer data to drive business decisions'
      }
    ],
    education: {
      degree: 'MS Data Science',
      institution: 'University of Washington',
      year: '2022'
    },
    assessmentScore: 78,
    careerGoal: 'Senior Data Scientist'
  },
  {
    id: 'demo-user-3',
    email: 'alex.product@example.com',
    name: 'Alex Rivera',
    title: 'Product Manager',
    bio: 'Strategic product manager with a background in both technical and business domains',
    location: 'Austin, TX',
    skills: ['Strategy', 'Analytics', 'Agile', 'User Research', 'SQL', 'Figma'],
    experience: [
      {
        company: 'ProductCo',
        position: 'Associate Product Manager',
        duration: '2020 - Present',
        description: 'Managing product roadmap for SaaS platform'
      }
    ],
    education: {
      degree: 'MBA',
      institution: 'UT Austin',
      year: '2020'
    },
    assessmentScore: 92,
    careerGoal: 'VP of Product'
  }
];

// Sample Assessment Questions
const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    type: 'multiple-choice',
    category: 'Technical Skills',
    question: 'Which programming language are you most proficient in?',
    options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Other'],
    weight: 10
  },
  {
    id: 2,
    type: 'scale',
    category: 'Problem Solving',
    question: 'Rate your problem-solving abilities (1-10)',
    min: 1,
    max: 10,
    weight: 15
  },
  {
    id: 3,
    type: 'multiple-choice',
    category: 'Team Collaboration',
    question: 'How do you prefer to work?',
    options: ['Independently', 'In small teams (2-4)', 'In large teams (5+)', 'Mixed approach'],
    weight: 8
  },
  {
    id: 4,
    type: 'text',
    category: 'Career Goals',
    question: 'Describe your ideal role in 5 years',
    weight: 12
  },
  {
    id: 5,
    type: 'multiple-select',
    category: 'Technologies',
    question: 'Which technologies have you worked with? (Select all that apply)',
    options: ['React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'],
    weight: 10
  }
];

// Career Progression Paths
const CAREER_PATHS = [
  {
    id: 'frontend-to-fullstack',
    title: 'Frontend to Full-Stack Developer',
    description: 'Transition from frontend development to full-stack capabilities',
    currentRole: 'Frontend Developer',
    targetRole: 'Full-Stack Developer',
    duration: '12-18 months',
    steps: [
      {
        phase: 'Backend Fundamentals',
        duration: '3-4 months',
        skills: ['Node.js', 'Express.js', 'RESTful APIs'],
        resources: ['Node.js Course', 'Express.js Documentation', 'REST API Best Practices']
      },
      {
        phase: 'Database Integration',
        duration: '2-3 months',
        skills: ['SQL', 'PostgreSQL', 'MongoDB'],
        resources: ['Database Design Course', 'SQL Practice', 'MongoDB University']
      },
      {
        phase: 'DevOps Basics',
        duration: '3-4 months',
        skills: ['Docker', 'Git', 'CI/CD'],
        resources: ['Docker Tutorial', 'Git Advanced', 'GitHub Actions']
      },
      {
        phase: 'Full-Stack Projects',
        duration: '4-6 months',
        skills: ['System Design', 'Testing', 'Deployment'],
        resources: ['Build Full-Stack Apps', 'System Design Primer', 'Testing Best Practices']
      }
    ],
    difficulty: 'Intermediate',
    marketDemand: 'High',
    salaryIncrease: '15-25%'
  },
  {
    id: 'analyst-to-scientist',
    title: 'Data Analyst to Data Scientist',
    description: 'Advance from data analysis to machine learning and predictive modeling',
    currentRole: 'Data Analyst',
    targetRole: 'Data Scientist',
    duration: '18-24 months',
    steps: [
      {
        phase: 'Advanced Python',
        duration: '2-3 months',
        skills: ['Advanced Python', 'NumPy', 'SciPy'],
        resources: ['Python for Data Science', 'NumPy Tutorial', 'Scientific Python']
      },
      {
        phase: 'Machine Learning',
        duration: '6-8 months',
        skills: ['Scikit-learn', 'TensorFlow', 'PyTorch'],
        resources: ['ML Course by Andrew Ng', 'Hands-On ML', 'Deep Learning Specialization']
      },
      {
        phase: 'Statistics & Math',
        duration: '4-5 months',
        skills: ['Statistics', 'Linear Algebra', 'Calculus'],
        resources: ['Statistics for Data Science', 'Khan Academy Math', 'Statistical Inference']
      },
      {
        phase: 'MLOps & Deployment',
        duration: '6-8 months',
        skills: ['MLflow', 'Kubeflow', 'Model Deployment'],
        resources: ['MLOps Zoomcamp', 'Model Deployment Guide', 'Production ML Systems']
      }
    ],
    difficulty: 'Advanced',
    marketDemand: 'Very High',
    salaryIncrease: '30-50%'
  }
];

// Market Trends Data
const MARKET_TRENDS = {
  hotSkills: [
    { skill: 'Artificial Intelligence', growth: '+42%', demand: 'Very High' },
    { skill: 'Cloud Computing', growth: '+35%', demand: 'Very High' },
    { skill: 'Cybersecurity', growth: '+28%', demand: 'High' },
    { skill: 'Data Science', growth: '+22%', demand: 'Very High' },
    { skill: 'DevOps', growth: '+20%', demand: 'High' },
    { skill: 'Mobile Development', growth: '+18%', demand: 'High' },
    { skill: 'React', growth: '+15%', demand: 'High' },
    { skill: 'Python', growth: '+12%', demand: 'Very High' }
  ],
  salaryRanges: {
    'Frontend Developer': { min: 75000, max: 120000, median: 95000 },
    'Backend Developer': { min: 80000, max: 130000, median: 105000 },
    'Full Stack Developer': { min: 85000, max: 140000, median: 110000 },
    'Data Scientist': { min: 95000, max: 165000, median: 130000 },
    'DevOps Engineer': { min: 90000, max: 150000, median: 120000 },
    'Product Manager': { min: 100000, max: 180000, median: 140000 },
    'UX Designer': { min: 70000, max: 110000, median: 90000 },
    'Software Architect': { min: 130000, max: 200000, median: 165000 }
  },
  remoteWork: {
    percentage: 85,
    fullyRemote: 45,
    hybrid: 40,
    trends: 'Remote work opportunities continue to grow, especially in tech sector'
  },
  jobGrowth: {
    'Software Development': '+22%',
    'Data Science': '+35%',
    'Cybersecurity': '+33%',
    'Cloud Computing': '+28%',
    'AI/ML': '+40%'
  }
};

// Sample Resume Templates Content
const RESUME_SAMPLES = {
  formats: ['Modern', 'Executive', 'Creative', 'Academic', 'Technical'],
  sections: ['Contact', 'Summary', 'Experience', 'Skills', 'Education', 'Projects', 'Certifications'],
  tips: [
    'Use action verbs to describe achievements',
    'Quantify results with specific metrics',
    'Tailor content to job requirements',
    'Keep formatting clean and consistent',
    'Include relevant keywords for ATS optimization'
  ]
};

// Learning Resources Database
const LEARNING_RESOURCES = {
  platforms: [
    { name: 'Coursera', type: 'MOOC', specialties: ['Data Science', 'Business', 'Computer Science'] },
    { name: 'Udemy', type: 'Online Courses', specialties: ['Programming', 'Design', 'Marketing'] },
    { name: 'Pluralsight', type: 'Tech Training', specialties: ['Software Development', 'IT', 'Data'] },
    { name: 'LinkedIn Learning', type: 'Professional', specialties: ['Business Skills', 'Technology', 'Creative'] },
    { name: 'FreeCodeCamp', type: 'Free', specialties: ['Web Development', 'Data Science', 'Programming'] }
  ],
  courses: {
    'Frontend Developer': [
      'React - The Complete Guide',
      'Advanced CSS and Sass',
      'JavaScript ES6+ Masterclass',
      'Modern Web Design',
      'Testing React Applications'
    ],
    'Data Scientist': [
      'Machine Learning A-Z',
      'Python for Data Science',
      'Deep Learning Specialization',
      'Statistics for Data Science',
      'SQL for Data Analysis'
    ],
    'Product Manager': [
      'Product Management Fundamentals',
      'User Research Methods',
      'Data-Driven Product Management',
      'Agile Product Development',
      'Strategic Product Leadership'
    ]
  }
};

// Company Database for Job Market Research
const COMPANY_DATABASE = {
  topEmployers: [
    {
      name: 'Google',
      size: 'Large',
      industry: 'Technology',
      locations: ['Mountain View', 'Seattle', 'New York'],
      openRoles: 1200,
      averageSalary: 165000,
      culture: 'Innovation-focused, collaborative, competitive'
    },
    {
      name: 'Microsoft',
      size: 'Large',
      industry: 'Technology',
      locations: ['Redmond', 'San Francisco', 'Austin'],
      openRoles: 800,
      averageSalary: 155000,
      culture: 'Inclusive, growth mindset, work-life balance'
    },
    {
      name: 'Airbnb',
      size: 'Medium',
      industry: 'Travel Tech',
      locations: ['San Francisco', 'Remote'],
      openRoles: 150,
      averageSalary: 145000,
      culture: 'Mission-driven, creative, global perspective'
    }
  ],
  startupTrends: {
    hotSectors: ['AI/ML', 'Fintech', 'HealthTech', 'Climate Tech', 'EdTech'],
    fundingTrends: 'AI startups raised $25B in 2024, 40% increase from 2023',
    jobGrowth: 'Startup job postings up 18% year-over-year'
  }
};

// Generate demo data files
function generateDemoData() {
  const demoDir = path.join(__dirname, '..', 'demo-data');
  
  // Create demo-data directory if it doesn't exist
  if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir, { recursive: true });
  }

  const files = {
    'users.json': DEMO_USERS,
    'assessment-questions.json': ASSESSMENT_QUESTIONS,
    'career-paths.json': CAREER_PATHS,
    'market-trends.json': MARKET_TRENDS,
    'resume-samples.json': RESUME_SAMPLES,
    'learning-resources.json': LEARNING_RESOURCES,
    'company-database.json': COMPANY_DATABASE
  };

  Object.entries(files).forEach(([filename, data]) => {
    const filePath = path.join(demoDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Generated ${filename}`);
  });

  // Generate summary report
  const summaryReport = {
    generatedAt: new Date().toISOString(),
    totalUsers: DEMO_USERS.length,
    totalQuestions: ASSESSMENT_QUESTIONS.length,
    totalCareerPaths: CAREER_PATHS.length,
    totalCompanies: COMPANY_DATABASE.topEmployers.length,
    dataSetsSummary: {
      users: 'Complete user profiles with skills and career goals',
      assessments: 'Multi-category assessment questions with weights',
      careerPaths: 'Detailed progression paths with learning resources',
      marketTrends: 'Current industry trends and salary data',
      resumeSamples: 'Professional resume templates and tips',
      learningResources: 'Curated learning platforms and courses',
      companies: 'Major employers and startup ecosystem data'
    },
    usage: {
      frontend: 'Import data for demo mode and UI testing',
      backend: 'Use for API responses and database seeding',
      presentations: 'Showcase real-world data and user scenarios'
    }
  };

  fs.writeFileSync(
    path.join(demoDir, 'summary-report.json'), 
    JSON.stringify(summaryReport, null, 2)
  );

  console.log('\n🎉 Demo data generation complete!');
  console.log(`📁 Files saved to: ${demoDir}`);
  console.log(`📊 Total datasets: ${Object.keys(files).length + 1}`);
  console.log('💡 Use this data for demos, testing, and presentations');
}

// Run if called directly
if (require.main === module) {
  generateDemoData();
}

module.exports = { generateDemoData };