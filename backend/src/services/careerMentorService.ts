import { logger } from '../utils/logger';

// Enhanced interfaces for Career Mentor Bot
interface UserProfile {
  userId?: string;
  name?: string;
  currentSkills: string[];
  interests: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  education?: string;
  currentRole?: string;
  careerGoals: string[];
  preferredLearningStyle: 'hands-on' | 'structured' | 'self-paced' | 'mentored';
  timeCommitment: 'part-time' | 'full-time' | 'weekends';
  location?: string;
  salaryExpectation?: string;
  workPreference: 'remote' | 'hybrid' | 'on-site' | 'flexible';
}

interface SkillGap {
  skill: string;
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  priority: 'critical' | 'important' | 'nice-to-have';
  timeToLearn: string; // e.g., "2-3 months"
  resources: LearningResource[];
}

interface LearningResource {
  title: string;
  type: 'course' | 'book' | 'tutorial' | 'practice' | 'certification';
  provider: string;
  url: string;
  duration: string;
  cost: 'free' | 'paid';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  averageSalary: {
    entry: number;
    mid: number;
    senior: number;
  };
  jobGrowth: string; // e.g., "22% by 2030"
  requiredSkills: string[];
  optionalSkills: string[];
  industries: string[];
  workEnvironment: string[];
  matchScore: number; // 0-100 based on user profile
}

interface PersonalizedRoadmap {
  careerPath: CareerPath;
  timeline: string;
  phases: RoadmapPhase[];
  totalEstimatedTime: string;
  skillGaps: SkillGap[];
  nextSteps: string[];
  milestones: Milestone[];
}

interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  description: string;
  skills: string[];
  resources: LearningResource[];
  projects: string[];
  completed: boolean;
}

interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  skills: string[];
  completed: boolean;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'skill-rating' | 'text' | 'multi-select';
  options?: string[];
  category: 'skills' | 'interests' | 'experience' | 'goals' | 'preferences';
  followUp?: string;
}

interface MentorResponse {
  message: string;
  type: 'assessment' | 'analysis' | 'roadmap' | 'career-cards' | 'guidance';
  data?: {
    question?: AssessmentQuestion;
    careerPaths?: CareerPath[];
    roadmap?: PersonalizedRoadmap;
    skillGaps?: SkillGap[];
    nextQuestion?: AssessmentQuestion;
    progress?: number;
  };
  quickReplies?: string[];
  interactive?: boolean;
}

export class CareerMentorService {
  private careerDatabase: CareerPath[] = [];
  private assessmentQuestions: AssessmentQuestion[] = [];
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.initializeCareerDatabase();
    this.initializeAssessmentQuestions();
    logger.info('Career Mentor Service initialized');
  }

  async startCareerAssessment(sessionId: string): Promise<MentorResponse> {
    // Start with the first assessment question
    const firstQuestion = this.assessmentQuestions[0];
    
    return {
      message: "Hi! I'm your AI Career Mentor. I'll help you discover the perfect career path by understanding your skills, interests, and goals. This will take about 5 minutes.\n\nLet's start with understanding your background:",
      type: 'assessment',
      data: {
        question: firstQuestion,
        progress: 0
      },
      interactive: true,
      quickReplies: firstQuestion.options || []
    };
  }

  async processAssessmentAnswer(
    sessionId: string, 
    questionId: string, 
    answer: string | string[]
  ): Promise<MentorResponse> {
    let profile = this.userProfiles.get(sessionId) || this.createEmptyProfile();
    
    // Update profile based on the answer
    this.updateProfileWithAnswer(profile, questionId, answer);
    this.userProfiles.set(sessionId, profile);

    // Find next question or complete assessment
    const currentIndex = this.assessmentQuestions.findIndex(q => q.id === questionId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < this.assessmentQuestions.length) {
      // Continue assessment
      const nextQuestion = this.assessmentQuestions[nextIndex];
      const progress = ((nextIndex + 1) / this.assessmentQuestions.length) * 100;

      return {
        message: "Great! " + (nextQuestion.followUp || "Next question:"),
        type: 'assessment',
        data: {
          question: nextQuestion,
          progress: Math.round(progress)
        },
        interactive: true,
        quickReplies: nextQuestion.options || []
      };
    } else {
      // Assessment complete - generate analysis
      return this.generateCareerAnalysis(sessionId);
    }
  }

  async generateCareerAnalysis(sessionId: string): Promise<MentorResponse> {
    const profile = this.userProfiles.get(sessionId);
    if (!profile) {
      throw new Error('No profile found for assessment analysis');
    }

    // Find matching career paths
    const matchingCareers = this.findMatchingCareers(profile);
    
    // Generate personalized message
    const message = this.generateAnalysisMessage(profile, matchingCareers);

    return {
      message,
      type: 'career-cards',
      data: {
        careerPaths: matchingCareers.slice(0, 3), // Top 3 matches
      },
      quickReplies: [
        "Tell me more about " + matchingCareers[0]?.title,
        "Show me a roadmap",
        "What skills do I need?",
        "Compare these careers"
      ],
      interactive: true
    };
  }

  async generatePersonalizedRoadmap(
    sessionId: string, 
    careerPathId: string
  ): Promise<MentorResponse> {
    const profile = this.userProfiles.get(sessionId);
    const careerPath = this.careerDatabase.find(c => c.id === careerPathId);
    
    if (!profile || !careerPath) {
      throw new Error('Profile or career path not found');
    }

    // Analyze skill gaps
    const skillGaps = this.analyzeSkillGaps(profile, careerPath);
    
    // Generate roadmap
    const roadmap = this.createPersonalizedRoadmap(profile, careerPath, skillGaps);

    const message = `Perfect! I've created a personalized ${roadmap.timeline} roadmap to become a ${careerPath.title}.\n\nBased on your current skills (${profile.currentSkills.join(', ')}), here's your learning journey:`;

    return {
      message,
      type: 'roadmap',
      data: {
        roadmap,
        skillGaps
      },
      quickReplies: [
        "Start Phase 1",
        "Show me resources", 
        "Adjust timeline",
        "Compare with other careers"
      ],
      interactive: true
    };
  }

  async getSkillGapAnalysis(sessionId: string, careerPathId: string): Promise<MentorResponse> {
    const profile = this.userProfiles.get(sessionId);
    const careerPath = this.careerDatabase.find(c => c.id === careerPathId);
    
    if (!profile || !careerPath) {
      throw new Error('Profile or career path not found');
    }

    const skillGaps = this.analyzeSkillGaps(profile, careerPath);
    const criticalGaps = skillGaps.filter(gap => gap.priority === 'critical');
    const importantGaps = skillGaps.filter(gap => gap.priority === 'important');

    let message = `Here's your skill gap analysis for ${careerPath.title}:\n\n`;
    
    if (criticalGaps.length > 0) {
      message += `🔴 **Critical Skills to Learn:**\n`;
      criticalGaps.forEach(gap => {
        message += `• ${gap.skill} - ${gap.timeToLearn}\n`;
      });
      message += '\n';
    }

    if (importantGaps.length > 0) {
      message += `🟡 **Important Skills to Develop:**\n`;
      importantGaps.forEach(gap => {
        message += `• ${gap.skill} - ${gap.timeToLearn}\n`;
      });
    }

    message += `\nYou already have: ${profile.currentSkills.join(', ')}`;

    return {
      message,
      type: 'analysis',
      data: {
        skillGaps
      },
      quickReplies: [
        "Create learning plan",
        "Show resources",
        "Start with critical skills",
        "Choose different career"
      ],
      interactive: true
    };
  }

  // Private helper methods

  private initializeCareerDatabase(): void {
    this.careerDatabase = [
      {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Analyze complex data to help companies make better decisions using machine learning and statistical methods.',
        averageSalary: { entry: 85000, mid: 120000, senior: 165000 },
        jobGrowth: '22% by 2030 (Much faster than average)',
        requiredSkills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
        optionalSkills: ['R', 'Deep Learning', 'Big Data', 'Cloud Computing', 'Business Intelligence'],
        industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Consulting'],
        workEnvironment: ['Remote-friendly', 'Collaborative', 'Research-oriented', 'Problem-solving'],
        matchScore: 0
      },
      {
        id: 'software-engineer',
        title: 'Software Engineer',
        description: 'Design, develop, and maintain software applications and systems.',
        averageSalary: { entry: 75000, mid: 110000, senior: 150000 },
        jobGrowth: '25% by 2030 (Much faster than average)',
        requiredSkills: ['Programming', 'Problem Solving', 'Debugging', 'Version Control', 'Testing'],
        optionalSkills: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker'],
        industries: ['Technology', 'Finance', 'Healthcare', 'Gaming', 'Startups'],
        workEnvironment: ['Remote-friendly', 'Team-based', 'Creative', 'Continuous learning'],
        matchScore: 0
      },
      {
        id: 'product-manager',
        title: 'Product Manager',
        description: 'Lead product strategy and development, working with cross-functional teams.',
        averageSalary: { entry: 90000, mid: 130000, senior: 180000 },
        jobGrowth: '15% by 2030 (Faster than average)',
        requiredSkills: ['Product Strategy', 'Market Research', 'Communication', 'Analytics', 'Project Management'],
        optionalSkills: ['SQL', 'UX Design', 'Agile', 'Leadership', 'Business Intelligence'],
        industries: ['Technology', 'E-commerce', 'Finance', 'Healthcare', 'Consumer Goods'],
        workEnvironment: ['Collaborative', 'Strategic', 'Customer-focused', 'Fast-paced'],
        matchScore: 0
      },
      {
        id: 'ux-designer',
        title: 'UX/UI Designer',
        description: 'Design user-friendly interfaces and experiences for digital products.',
        averageSalary: { entry: 65000, mid: 95000, senior: 130000 },
        jobGrowth: '13% by 2030 (Faster than average)',
        requiredSkills: ['Design Thinking', 'Prototyping', 'User Research', 'Visual Design', 'Usability Testing'],
        optionalSkills: ['Figma', 'Adobe Creative Suite', 'HTML/CSS', 'JavaScript', 'Psychology'],
        industries: ['Technology', 'E-commerce', 'Finance', 'Healthcare', 'Media'],
        workEnvironment: ['Creative', 'User-focused', 'Collaborative', 'Innovation-driven'],
        matchScore: 0
      },
      {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        description: 'Bridge development and operations to improve software deployment and infrastructure.',
        averageSalary: { entry: 80000, mid: 115000, senior: 155000 },
        jobGrowth: '20% by 2030 (Much faster than average)',
        requiredSkills: ['Cloud Computing', 'Docker', 'CI/CD', 'Linux', 'Automation'],
        optionalSkills: ['Kubernetes', 'AWS', 'Azure', 'Terraform', 'Monitoring', 'Security'],
        industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
        workEnvironment: ['Technical', 'Problem-solving', 'Automation-focused', 'Remote-friendly'],
        matchScore: 0
      }
    ];
  }

  private initializeAssessmentQuestions(): void {
    this.assessmentQuestions = [
      {
        id: 'experience-level',
        question: "What's your current experience level with technology/programming?",
        type: 'multiple-choice',
        options: ['Complete beginner', 'Some experience', 'Intermediate', 'Advanced', 'Expert'],
        category: 'experience',
        followUp: 'Perfect! This helps me understand your starting point.'
      },
      {
        id: 'current-skills',
        question: "Which of these skills do you currently have? (Select all that apply)",
        type: 'multi-select',
        options: ['Python', 'JavaScript', 'Java', 'SQL', 'HTML/CSS', 'React', 'Node.js', 'Machine Learning', 'Data Analysis', 'Project Management', 'Design', 'Marketing', 'None of these'],
        category: 'skills',
        followUp: 'Great! I can see what you\'re working with.'
      },
      {
        id: 'interests',
        question: "What type of work interests you most?",
        type: 'multiple-choice',
        options: [
          'Analyzing data and finding patterns',
          'Building apps and websites', 
          'Designing user experiences',
          'Managing teams and products',
          'Solving technical infrastructure problems',
          'Working with AI and machine learning'
        ],
        category: 'interests',
        followUp: 'Excellent! This shows me what motivates you.'
      },
      {
        id: 'career-goals',
        question: "What's your main career goal?",
        type: 'multiple-choice',
        options: [
          'Land my first tech job',
          'Switch to a new tech field', 
          'Get promoted in my current role',
          'Start my own business',
          'Become a technical leader',
          'Work at a top tech company'
        ],
        category: 'goals',
        followUp: 'That\'s a great goal! Let me help you get there.'
      },
      {
        id: 'learning-style',
        question: "How do you prefer to learn new skills?",
        type: 'multiple-choice',
        options: ['Hands-on projects', 'Structured courses', 'Self-paced tutorials', 'Working with a mentor', 'Reading documentation'],
        category: 'preferences',
        followUp: 'Perfect! I\'ll recommend resources that match your style.'
      },
      {
        id: 'time-commitment',
        question: "How much time can you dedicate to learning each week?",
        type: 'multiple-choice',
        options: ['5-10 hours', '10-20 hours', '20-30 hours', '30+ hours', 'Weekends only'],
        category: 'preferences',
        followUp: 'Great! This helps me create a realistic timeline for you.'
      }
    ];
  }

  private createEmptyProfile(): UserProfile {
    return {
      currentSkills: [],
      interests: [],
      experience: 'beginner',
      careerGoals: [],
      preferredLearningStyle: 'hands-on',
      timeCommitment: 'part-time',
      workPreference: 'flexible'
    };
  }

  private updateProfileWithAnswer(profile: UserProfile, questionId: string, answer: string | string[]): void {
    switch (questionId) {
      case 'experience-level':
        profile.experience = this.mapExperienceLevel(answer as string);
        break;
      case 'current-skills':
        profile.currentSkills = Array.isArray(answer) ? answer.filter(skill => skill !== 'None of these') : [answer];
        break;
      case 'interests':
        profile.interests = [answer as string];
        break;
      case 'career-goals':
        profile.careerGoals = [answer as string];
        break;
      case 'learning-style':
        profile.preferredLearningStyle = this.mapLearningStyle(answer as string);
        break;
      case 'time-commitment':
        profile.timeCommitment = this.mapTimeCommitment(answer as string);
        break;
    }
  }

  private mapExperienceLevel(answer: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const mapping: { [key: string]: 'beginner' | 'intermediate' | 'advanced' | 'expert' } = {
      'Complete beginner': 'beginner',
      'Some experience': 'beginner',
      'Intermediate': 'intermediate', 
      'Advanced': 'advanced',
      'Expert': 'expert'
    };
    return mapping[answer] || 'beginner';
  }

  private mapLearningStyle(answer: string): 'hands-on' | 'structured' | 'self-paced' | 'mentored' {
    const mapping: { [key: string]: 'hands-on' | 'structured' | 'self-paced' | 'mentored' } = {
      'Hands-on projects': 'hands-on',
      'Structured courses': 'structured',
      'Self-paced tutorials': 'self-paced',
      'Working with a mentor': 'mentored',
      'Reading documentation': 'self-paced'
    };
    return mapping[answer] || 'hands-on';
  }

  private mapTimeCommitment(answer: string): 'part-time' | 'full-time' | 'weekends' {
    if (answer.includes('30+') || answer.includes('20-30')) return 'full-time';
    if (answer.includes('Weekends')) return 'weekends';
    return 'part-time';
  }

  private findMatchingCareers(profile: UserProfile): CareerPath[] {
    return this.careerDatabase.map(career => {
      const matchScore = this.calculateMatchScore(profile, career);
      return { ...career, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateMatchScore(profile: UserProfile, career: CareerPath): number {
    let score = 0;
    
    // Skills match (40% weight)
    const skillsMatch = profile.currentSkills.filter(skill => 
      career.requiredSkills.includes(skill) || career.optionalSkills.includes(skill)
    ).length;
    score += (skillsMatch / Math.max(career.requiredSkills.length, 1)) * 40;

    // Interest match (30% weight)
    const interestMatch = this.matchInterestToCareer(profile.interests, career);
    score += interestMatch * 30;

    // Experience level match (20% weight)
    const experienceMatch = this.matchExperienceLevel(profile.experience, career);
    score += experienceMatch * 20;

    // Goal alignment (10% weight)
    const goalMatch = this.matchGoalsToCareer(profile.careerGoals, career);
    score += goalMatch * 10;

    return Math.round(score);
  }

  private matchInterestToCareer(interests: string[], career: CareerPath): number {
    const careerInterestMap: { [key: string]: string[] } = {
      'data-scientist': ['Analyzing data and finding patterns', 'Working with AI and machine learning'],
      'software-engineer': ['Building apps and websites'],
      'product-manager': ['Managing teams and products'],
      'ux-designer': ['Designing user experiences'],
      'devops-engineer': ['Solving technical infrastructure problems']
    };

    const careerInterests = careerInterestMap[career.id] || [];
    const matches = interests.filter(interest => careerInterests.includes(interest)).length;
    return matches / Math.max(interests.length, 1);
  }

  private matchExperienceLevel(experience: string, career: CareerPath): number {
    // All careers can accommodate different experience levels
    return 1.0;
  }

  private matchGoalsToCareer(goals: string[], career: CareerPath): number {
    // Simple implementation - can be enhanced
    return goals.length > 0 ? 1.0 : 0.5;
  }

  private analyzeSkillGaps(profile: UserProfile, career: CareerPath): SkillGap[] {
    const gaps: SkillGap[] = [];
    
    career.requiredSkills.forEach(skill => {
      if (!profile.currentSkills.includes(skill)) {
        gaps.push({
          skill,
          currentLevel: 0,
          requiredLevel: 70,
          priority: 'critical',
          timeToLearn: this.estimateTimeToLearn(skill, profile.timeCommitment),
          resources: this.getResourcesForSkill(skill)
        });
      }
    });

    career.optionalSkills.forEach(skill => {
      if (!profile.currentSkills.includes(skill) && !career.requiredSkills.includes(skill)) {
        gaps.push({
          skill,
          currentLevel: 0,
          requiredLevel: 50,
          priority: 'important',
          timeToLearn: this.estimateTimeToLearn(skill, profile.timeCommitment),
          resources: this.getResourcesForSkill(skill)
        });
      }
    });

    return gaps.sort((a, b) => (a.priority === 'critical' ? 0 : 1) - (b.priority === 'critical' ? 0 : 1));
  }

  private estimateTimeToLearn(skill: string, timeCommitment: string): string {
    const timeMap: { [key: string]: { [key: string]: string } } = {
      'Python': { 'part-time': '2-3 months', 'full-time': '4-6 weeks', 'weekends': '3-4 months' },
      'JavaScript': { 'part-time': '2-3 months', 'full-time': '4-6 weeks', 'weekends': '3-4 months' },
      'SQL': { 'part-time': '1-2 months', 'full-time': '2-3 weeks', 'weekends': '2-3 months' },
      'Machine Learning': { 'part-time': '4-6 months', 'full-time': '2-3 months', 'weekends': '6-8 months' },
      'React': { 'part-time': '2-3 months', 'full-time': '4-6 weeks', 'weekends': '3-4 months' }
    };

    return timeMap[skill]?.[timeCommitment] || '2-3 months';
  }

  private getResourcesForSkill(skill: string): LearningResource[] {
    const resourceMap: { [key: string]: LearningResource[] } = {
      'Python': [
        {
          title: 'Python for Everybody Specialization',
          type: 'course',
          provider: 'Coursera',
          url: 'https://coursera.org/specializations/python',
          duration: '8 weeks',
          cost: 'paid',
          difficulty: 'beginner'
        },
        {
          title: 'Automate the Boring Stuff with Python',
          type: 'book',
          provider: 'Al Sweigart',
          url: 'https://automatetheboringstuff.com/',
          duration: '6 weeks',
          cost: 'free',
          difficulty: 'beginner'
        }
      ],
      'JavaScript': [
        {
          title: 'The Complete JavaScript Course',
          type: 'course',
          provider: 'Udemy',
          url: 'https://udemy.com/course/the-complete-javascript-course/',
          duration: '12 weeks',
          cost: 'paid',
          difficulty: 'beginner'
        }
      ],
      'SQL': [
        {
          title: 'SQL for Data Science',
          type: 'course',
          provider: 'Coursera',
          url: 'https://coursera.org/learn/sql-for-data-science',
          duration: '4 weeks',
          cost: 'paid',
          difficulty: 'beginner'
        }
      ]
    };

    return resourceMap[skill] || [{
      title: `Learn ${skill}`,
      type: 'course',
      provider: 'Various',
      url: '#',
      duration: '4-8 weeks',
      cost: 'free',
      difficulty: 'beginner'
    }];
  }

  private createPersonalizedRoadmap(
    profile: UserProfile, 
    career: CareerPath, 
    skillGaps: SkillGap[]
  ): PersonalizedRoadmap {
    const phases: RoadmapPhase[] = [];
    const criticalSkills = skillGaps.filter(gap => gap.priority === 'critical').map(gap => gap.skill);
    const importantSkills = skillGaps.filter(gap => gap.priority === 'important').map(gap => gap.skill);

    // Phase 1: Foundation skills
    if (criticalSkills.length > 0) {
      phases.push({
        phase: 1,
        title: 'Foundation Skills',
        duration: this.calculatePhaseDuration(criticalSkills, profile.timeCommitment),
        description: 'Master the essential skills required for this career',
        skills: criticalSkills.slice(0, 3), // Top 3 critical skills
        resources: criticalSkills.slice(0, 3).flatMap(skill => this.getResourcesForSkill(skill)),
        projects: this.getProjectsForSkills(criticalSkills.slice(0, 3)),
        completed: false
      });
    }

    // Phase 2: Advanced skills
    if (importantSkills.length > 0) {
      phases.push({
        phase: 2,
        title: 'Advanced Skills & Specialization',
        duration: this.calculatePhaseDuration(importantSkills, profile.timeCommitment),
        description: 'Develop specialized skills and build expertise',
        skills: importantSkills,
        resources: importantSkills.flatMap(skill => this.getResourcesForSkill(skill)),
        projects: this.getProjectsForSkills(importantSkills),
        completed: false
      });
    }

    // Phase 3: Real-world experience
    phases.push({
      phase: phases.length + 1,
      title: 'Real-World Experience',
      duration: '3-6 months',
      description: 'Apply your skills through projects and gain practical experience',
      skills: ['Portfolio Development', 'Networking', 'Interview Preparation'],
      resources: [],
      projects: ['Build portfolio projects', 'Contribute to open source', 'Network with professionals'],
      completed: false
    });

    const totalMonths = phases.reduce((total, phase) => {
      const months = parseInt(phase.duration.split('-')[0]);
      return total + months;
    }, 0);

    return {
      careerPath: career,
      timeline: this.formatTimeline(totalMonths, profile.timeCommitment),
      phases,
      totalEstimatedTime: `${totalMonths}-${totalMonths + 3} months`,
      skillGaps,
      nextSteps: [
        `Start with ${phases[0]?.skills[0] || 'foundation skills'}`,
        'Set up your learning environment',
        'Join relevant communities',
        'Begin your first project'
      ],
      milestones: this.createMilestones(phases)
    };
  }

  private calculatePhaseDuration(skills: string[], timeCommitment: string): string {
    const baseMonths = Math.ceil(skills.length * (timeCommitment === 'full-time' ? 1 : timeCommitment === 'part-time' ? 2 : 3));
    return `${baseMonths}-${baseMonths + 1} months`;
  }

  private getProjectsForSkills(skills: string[]): string[] {
    const projectMap: { [key: string]: string[] } = {
      'Python': ['Build a data analysis script', 'Create a web scraper'],
      'JavaScript': ['Build a todo app', 'Create an interactive webpage'],
      'SQL': ['Design a database schema', 'Write complex queries'],
      'Machine Learning': ['Build a prediction model', 'Create a data visualization'],
      'React': ['Build a portfolio website', 'Create a dynamic web app']
    };

    return skills.flatMap(skill => projectMap[skill] || [`Practice ${skill} fundamentals`]);
  }

  private formatTimeline(months: number, timeCommitment: string): string {
    if (timeCommitment === 'full-time') {
      return `${Math.ceil(months * 0.7)}-${months} months (full-time)`;
    } else if (timeCommitment === 'weekends') {
      return `${months}-${months + 6} months (weekends only)`;
    }
    return `${months}-${months + 3} months (part-time)`;
  }

  private createMilestones(phases: RoadmapPhase[]): Milestone[] {
    return phases.map((phase, index) => ({
      title: `Complete ${phase.title}`,
      description: phase.description,
      targetDate: `Month ${(index + 1) * 3}`,
      skills: phase.skills,
      completed: false
    }));
  }

  private generateAnalysisMessage(profile: UserProfile, careers: CareerPath[]): string {
    const topCareer = careers[0];
    const skills = profile.currentSkills.length > 0 
      ? profile.currentSkills.join(', ')
      : 'your background';

    return `Perfect! Based on your skills in ${skills} and your interests, I've found some great career matches for you.\n\nYour top match is **${topCareer.title}** with a ${topCareer.matchScore}% compatibility score!\n\nHere's what makes it a great fit:\n• Average salary: $${topCareer.averageSalary.entry.toLocaleString()} - $${topCareer.averageSalary.senior.toLocaleString()}\n• Job growth: ${topCareer.jobGrowth}\n• Work environment: ${topCareer.workEnvironment.join(', ')}\n\nI can create a personalized learning roadmap to help you transition into this field. What would you like to explore first?`;
  }

  // Public methods for accessing user profiles and data
  public getUserProfile(sessionId: string): UserProfile | undefined {
    return this.userProfiles.get(sessionId);
  }

  public updateUserProfile(sessionId: string, updates: Partial<UserProfile>): void {
    const profile = this.userProfiles.get(sessionId) || this.createEmptyProfile();
    Object.assign(profile, updates);
    this.userProfiles.set(sessionId, profile);
  }

  public getCareerById(careerPathId: string): CareerPath | undefined {
    return this.careerDatabase.find(career => career.id === careerPathId);
  }
}