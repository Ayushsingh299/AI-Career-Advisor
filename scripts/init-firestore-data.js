const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to set GOOGLE_APPLICATION_CREDENTIALS)
try {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
    ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : null;
    
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    console.log('🔧 Using default Firebase configuration...');
    initializeApp();
  }
} catch (error) {
  console.log('⚠️  Firebase initialization failed, using emulator mode');
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  initializeApp();
}

const db = getFirestore();

// Sample Skills Data
const skillsData = [
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Programming Languages',
    description: 'Dynamic programming language for web development',
    difficulty: 'Intermediate',
    demandLevel: 'High',
    trending: true,
    demandGrowth: 15,
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
      averageSalary: '$75,000',
      jobOpenings: '25,000+',
      demandGrowth: '+15%'
    }
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend Frameworks',
    description: 'JavaScript library for building user interfaces',
    difficulty: 'Intermediate',
    demandLevel: 'Very High',
    trending: true,
    demandGrowth: 25,
    relatedSkills: ['JavaScript', 'Redux', 'Next.js'],
    learningPath: [
      'Component basics',
      'Props and state',
      'Event handling',
      'Lifecycle methods',
      'Hooks',
      'State management'
    ],
    marketTrends: {
      averageSalary: '$80,000',
      jobOpenings: '30,000+',
      demandGrowth: '+25%'
    }
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Programming Languages',
    description: 'Versatile programming language for various applications',
    difficulty: 'Beginner',
    demandLevel: 'Very High',
    trending: true,
    demandGrowth: 20,
    relatedSkills: ['Django', 'Flask', 'Data Science', 'Machine Learning'],
    learningPath: [
      'Python syntax',
      'Data structures',
      'Functions and modules',
      'Object-oriented programming',
      'Libraries and frameworks',
      'Advanced topics'
    ],
    marketTrends: {
      averageSalary: '$85,000',
      jobOpenings: '40,000+',
      demandGrowth: '+20%'
    }
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    category: 'AI/ML',
    description: 'Algorithms that learn from data to make predictions',
    difficulty: 'Advanced',
    demandLevel: 'Very High',
    trending: true,
    demandGrowth: 45,
    relatedSkills: ['Python', 'TensorFlow', 'PyTorch', 'Statistics'],
    learningPath: [
      'Statistics fundamentals',
      'Supervised learning',
      'Unsupervised learning',
      'Neural networks',
      'Deep learning',
      'Model deployment'
    ],
    marketTrends: {
      averageSalary: '$110,000',
      jobOpenings: '15,000+',
      demandGrowth: '+45%'
    }
  }
];

// Sample Careers Data
const careersData = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Software Development',
    description: 'Build user interfaces and web applications using modern frontend technologies',
    requiredSkills: ['JavaScript', 'React', 'CSS', 'HTML'],
    optionalSkills: ['TypeScript', 'Redux', 'Testing'],
    experienceLevel: 'Entry to Mid-level',
    averageSalary: '$75,000 - $120,000',
    salaryRange: {
      min: 75000,
      max: 120000,
      currency: 'USD'
    },
    jobDemand: 'Very High',
    demandGrowth: '+25%',
    workEnvironment: ['Remote', 'Hybrid', 'On-site'],
    responsibilities: [
      'Develop responsive web applications',
      'Implement user interface designs',
      'Optimize application performance',
      'Collaborate with backend developers',
      'Write clean, maintainable code'
    ],
    careerPath: [
      'Junior Frontend Developer',
      'Frontend Developer',
      'Senior Frontend Developer',
      'Lead Frontend Developer',
      'Frontend Architecture'
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Analyze complex data to extract insights and build predictive models',
    requiredSkills: ['Python', 'Statistics', 'Machine Learning', 'SQL'],
    optionalSkills: ['R', 'TensorFlow', 'Tableau', 'Big Data'],
    experienceLevel: 'Mid to Senior level',
    averageSalary: '$90,000 - $150,000',
    salaryRange: {
      min: 90000,
      max: 150000,
      currency: 'USD'
    },
    jobDemand: 'Very High',
    demandGrowth: '+35%',
    workEnvironment: ['Remote', 'Hybrid'],
    responsibilities: [
      'Analyze large datasets',
      'Build predictive models',
      'Create data visualizations',
      'Present findings to stakeholders',
      'Implement machine learning solutions'
    ],
    careerPath: [
      'Junior Data Analyst',
      'Data Scientist',
      'Senior Data Scientist',
      'Principal Data Scientist',
      'Chief Data Officer'
    ]
  }
];

// Sample Learning Resources
const learningResourcesData = [
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals Course',
    provider: 'CodeAcademy',
    type: 'Course',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    duration: '20 hours',
    rating: 4.8,
    price: 'Free',
    url: 'https://codecademy.com/javascript',
    description: 'Learn JavaScript basics including variables, functions, and DOM manipulation'
  },
  {
    id: 'react-bootcamp',
    title: 'React Development Bootcamp',
    provider: 'Udemy',
    type: 'Course',
    skill: 'React',
    difficulty: 'Intermediate',
    duration: '40 hours',
    rating: 4.9,
    price: '$89',
    url: 'https://udemy.com/react-bootcamp',
    description: 'Comprehensive React course covering hooks, state management, and modern patterns'
  },
  {
    id: 'python-data-science',
    title: 'Python for Data Science',
    provider: 'Coursera',
    type: 'Specialization',
    skill: 'Python',
    difficulty: 'Intermediate',
    duration: '60 hours',
    rating: 4.7,
    price: '$49/month',
    url: 'https://coursera.org/python-data-science',
    description: 'Learn Python programming for data analysis and machine learning applications'
  }
];

async function initializeFirestoreData() {
  console.log('🚀 Initializing Firestore with sample data...');

  try {
    // Add Skills Data
    console.log('📚 Adding skills data...');
    for (const skill of skillsData) {
      await db.collection('skills').doc(skill.id).set(skill);
      console.log(`✅ Added skill: ${skill.name}`);
    }

    // Add Careers Data
    console.log('💼 Adding careers data...');
    for (const career of careersData) {
      await db.collection('careers').doc(career.id).set(career);
      console.log(`✅ Added career: ${career.title}`);
    }

    // Add Learning Resources
    console.log('🎓 Adding learning resources...');
    for (const resource of learningResourcesData) {
      await db.collection('learning_resources').doc(resource.id).set(resource);
      console.log(`✅ Added resource: ${resource.title}`);
    }

    // Add Market Trends
    console.log('📈 Adding market trends...');
    const marketTrends = [
      {
        id: 'ai-boom-2024',
        title: 'AI Skills Surge',
        description: 'Machine learning and AI skills seeing unprecedented demand',
        category: 'Technology Trends',
        impactLevel: 'Very High',
        timeframe: '2024-2025',
        affectedSkills: ['Machine Learning', 'Python', 'Data Science'],
        growthRate: '+45%'
      },
      {
        id: 'remote-work-trend',
        title: 'Remote Work Normalization',
        description: '85% of tech roles now offer remote or hybrid options',
        category: 'Work Environment',
        impactLevel: 'High',
        timeframe: '2024-ongoing',
        affectedSkills: ['Communication', 'Self-management', 'Digital Collaboration'],
        growthRate: '+15%'
      }
    ];

    for (const trend of marketTrends) {
      await db.collection('market_trends').doc(trend.id).set(trend);
      console.log(`✅ Added trend: ${trend.title}`);
    }

    console.log('🎉 Firestore initialization completed successfully!');
    console.log('📊 Data added:');
    console.log(`   - ${skillsData.length} skills`);
    console.log(`   - ${careersData.length} careers`);
    console.log(`   - ${learningResourcesData.length} learning resources`);
    console.log(`   - ${marketTrends.length} market trends`);

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeFirestoreData()
    .then(() => {
      console.log('✨ All done! Your Career Skills Advisor is ready to go.');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeFirestoreData };