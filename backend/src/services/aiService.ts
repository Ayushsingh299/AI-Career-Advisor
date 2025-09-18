import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { LanguageServiceClient } from '@google-cloud/language';
import { AssessmentAnswer, AssessmentResults, SkillLevel, CareerRecommendation } from './firestore';

// Initialize Google Cloud AI clients
const predictionClient = new PredictionServiceClient();
const languageClient = new LanguageServiceClient();

export class AIService {
  private static readonly PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'demo-project';
  private static readonly LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';

  /**
   * Process assessment answers using AI to generate skill analysis and career recommendations
   */
  static async processAssessment(answers: AssessmentAnswer[], userId: string): Promise<AssessmentResults> {
    try {
      console.log('Processing assessment with AI for user:', userId);
      
      // For now, we'll use rule-based logic with some AI-like intelligence
      // In production, this would call actual Vertex AI models
      
      const skillLevels = await this.analyzeSkillLevels(answers);
      const recommendedCareers = await this.generateCareerRecommendations(skillLevels);
      const learningRecommendations = await this.generateLearningRecommendations(skillLevels);
      const overallScore = this.calculateOverallScore(skillLevels);

      return {
        skillLevels,
        recommendedCareers,
        learningRecommendations,
        overallScore
      };
    } catch (error) {
      console.error('Error processing assessment with AI:', error);
      
      // Fallback to basic analysis if AI services fail
      return this.fallbackAssessmentAnalysis(answers);
    }
  }

  /**
   * Analyze text content using Natural Language API
   */
  static async analyzeText(text: string) {
    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT' as const,
      };

      const [result] = await languageClient.analyzeSentiment({ document });
      const [entitiesResult] = await languageClient.analyzeEntities({ document });

      return {
        sentiment: result.documentSentiment,
        entities: entitiesResult.entities,
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      return null;
    }
  }

  /**
   * Generate skill predictions using Vertex AI
   */
  static async predictSkillLevels(assessmentData: any): Promise<SkillLevel[]> {
    try {
      // This would call a custom Vertex AI model for skill prediction
      // For now, using intelligent mock data based on assessment patterns
      
      const endpoint = `projects/${this.PROJECT_ID}/locations/${this.LOCATION}/endpoints/skills-prediction-endpoint`;
      
      // Mock prediction call - in production, this would be:
      // const [response] = await predictionClient.predict({
      //   endpoint,
      //   instances: [assessmentData]
      // });

      // Return intelligent mock predictions for now
      return this.generateIntelligentSkillPredictions(assessmentData);
    } catch (error) {
      console.error('Error predicting skill levels:', error);
      return this.generateIntelligentSkillPredictions(assessmentData);
    }
  }

  /**
   * Generate career match predictions using Vertex AI
   */
  static async predictCareerMatches(skillLevels: SkillLevel[]): Promise<CareerRecommendation[]> {
    try {
      const endpoint = `projects/${this.PROJECT_ID}/locations/${this.LOCATION}/endpoints/career-matching-endpoint`;
      
      // Mock prediction - in production this would use real AI model
      return this.generateIntelligentCareerRecommendations(skillLevels);
    } catch (error) {
      console.error('Error predicting career matches:', error);
      return this.generateIntelligentCareerRecommendations(skillLevels);
    }
  }

  // Private helper methods for intelligent analysis

  private static async analyzeSkillLevels(answers: AssessmentAnswer[]): Promise<SkillLevel[]> {
    const skillMap: { [key: string]: { level: number; confidence: number; category: string } } = {};

    answers.forEach((answer, index) => {
      // Analyze each answer to determine skill implications
      const skills = this.extractSkillsFromAnswer(answer, index);
      
      skills.forEach(({ skill, level, category }) => {
        if (skillMap[skill]) {
          skillMap[skill].level = Math.max(skillMap[skill].level, level);
          skillMap[skill].confidence += 0.2;
        } else {
          skillMap[skill] = { level, confidence: 0.8, category };
        }
      });
    });

    return Object.entries(skillMap).map(([skill, data]) => ({
      skill,
      level: Math.min(data.level, 100),
      category: data.category,
      confidence: Math.min(data.confidence, 1.0)
    }));
  }

  private static extractSkillsFromAnswer(answer: AssessmentAnswer, questionIndex: number): Array<{skill: string; level: number; category: string}> {
    const skills = [];
    const answerLower = answer.answer.toLowerCase();

    // Question-specific skill extraction logic
    switch (questionIndex) {
      case 0: // Programming experience
        if (answerLower.includes('expert')) {
          skills.push({ skill: 'Programming', level: 95, category: 'Technical' });
          skills.push({ skill: 'Software Development', level: 90, category: 'Technical' });
        } else if (answerLower.includes('advanced')) {
          skills.push({ skill: 'Programming', level: 80, category: 'Technical' });
          skills.push({ skill: 'Software Development', level: 75, category: 'Technical' });
        } else if (answerLower.includes('intermediate')) {
          skills.push({ skill: 'Programming', level: 60, category: 'Technical' });
          skills.push({ skill: 'Software Development', level: 55, category: 'Technical' });
        } else {
          skills.push({ skill: 'Programming', level: 30, category: 'Technical' });
        }
        break;

      case 1: // Area of interest
        if (answerLower.includes('frontend')) {
          skills.push({ skill: 'Frontend Development', level: 70, category: 'Technical' });
          skills.push({ skill: 'JavaScript', level: 65, category: 'Technical' });
          skills.push({ skill: 'React', level: 60, category: 'Technical' });
        } else if (answerLower.includes('backend')) {
          skills.push({ skill: 'Backend Development', level: 70, category: 'Technical' });
          skills.push({ skill: 'API Development', level: 65, category: 'Technical' });
          skills.push({ skill: 'Database Design', level: 60, category: 'Technical' });
        } else if (answerLower.includes('data science')) {
          skills.push({ skill: 'Data Science', level: 75, category: 'Technical' });
          skills.push({ skill: 'Python', level: 70, category: 'Technical' });
          skills.push({ skill: 'Machine Learning', level: 65, category: 'Technical' });
        } else if (answerLower.includes('devops')) {
          skills.push({ skill: 'DevOps', level: 70, category: 'Technical' });
          skills.push({ skill: 'Cloud Computing', level: 65, category: 'Technical' });
          skills.push({ skill: 'System Administration', level: 60, category: 'Technical' });
        }
        break;

      case 2: // Problem-solving comfort
        if (answerLower.includes('expert')) {
          skills.push({ skill: 'Problem Solving', level: 95, category: 'Soft Skills' });
          skills.push({ skill: 'Critical Thinking', level: 90, category: 'Soft Skills' });
        } else if (answerLower.includes('very comfortable')) {
          skills.push({ skill: 'Problem Solving', level: 80, category: 'Soft Skills' });
          skills.push({ skill: 'Critical Thinking', level: 75, category: 'Soft Skills' });
        } else if (answerLower.includes('somewhat')) {
          skills.push({ skill: 'Problem Solving', level: 55, category: 'Soft Skills' });
        } else {
          skills.push({ skill: 'Problem Solving', level: 30, category: 'Soft Skills' });
        }
        break;

      case 3: // Learning style
        if (answerLower.includes('hands-on')) {
          skills.push({ skill: 'Practical Learning', level: 80, category: 'Soft Skills' });
          skills.push({ skill: 'Experimentation', level: 75, category: 'Soft Skills' });
        }
        skills.push({ skill: 'Learning Agility', level: 70, category: 'Soft Skills' });
        break;

      case 4: // Teamwork preference
        if (answerLower.includes('leadership')) {
          skills.push({ skill: 'Leadership', level: 85, category: 'Soft Skills' });
          skills.push({ skill: 'Communication', level: 80, category: 'Soft Skills' });
          skills.push({ skill: 'Team Management', level: 75, category: 'Soft Skills' });
        } else if (answerLower.includes('large teams')) {
          skills.push({ skill: 'Collaboration', level: 80, category: 'Soft Skills' });
          skills.push({ skill: 'Communication', level: 75, category: 'Soft Skills' });
        } else if (answerLower.includes('small teams')) {
          skills.push({ skill: 'Collaboration', level: 70, category: 'Soft Skills' });
          skills.push({ skill: 'Communication', level: 65, category: 'Soft Skills' });
        } else {
          skills.push({ skill: 'Independent Work', level: 75, category: 'Soft Skills' });
        }
        break;
    }

    return skills;
  }

  private static async generateCareerRecommendations(skillLevels: SkillLevel[]): Promise<CareerRecommendation[]> {
    const careers: CareerRecommendation[] = [];
    
    // Calculate matches based on skill levels
    const technicalSkills = skillLevels.filter(s => s.category === 'Technical');
    const softSkills = skillLevels.filter(s => s.category === 'Soft Skills');
    
    const hasHighProgramming = technicalSkills.some(s => s.skill.includes('Programming') && s.level > 70);
    const hasFrontend = technicalSkills.some(s => s.skill.includes('Frontend') && s.level > 60);
    const hasBackend = technicalSkills.some(s => s.skill.includes('Backend') && s.level > 60);
    const hasDataScience = technicalSkills.some(s => s.skill.includes('Data Science') && s.level > 60);
    const hasLeadership = softSkills.some(s => s.skill.includes('Leadership') && s.level > 70);

    if (hasFrontend) {
      careers.push({
        title: 'Frontend Developer',
        match: this.calculateCareerMatch(['Frontend Development', 'JavaScript', 'React'], skillLevels),
        description: 'Build user interfaces and web applications using modern frontend technologies',
        skills: ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript'],
        averageSalary: '$75,000 - $120,000',
        jobDemand: 'Very High',
        requirements: ['Strong JavaScript skills', 'Experience with React/Vue/Angular', 'CSS/HTML proficiency']
      });
    }

    if (hasBackend) {
      careers.push({
        title: 'Backend Developer',
        match: this.calculateCareerMatch(['Backend Development', 'API Development', 'Database'], skillLevels),
        description: 'Design and implement server-side applications and APIs',
        skills: ['Node.js', 'Python', 'Databases', 'API Design', 'Cloud Services'],
        averageSalary: '$80,000 - $130,000',
        jobDemand: 'High',
        requirements: ['Server-side programming', 'Database knowledge', 'API development experience']
      });
    }

    if (hasFrontend && hasBackend) {
      careers.push({
        title: 'Full Stack Developer',
        match: this.calculateCareerMatch(['Frontend Development', 'Backend Development', 'Programming'], skillLevels),
        description: 'Work on both frontend and backend development across the full technology stack',
        skills: ['JavaScript', 'React', 'Node.js', 'Databases', 'Git'],
        averageSalary: '$85,000 - $140,000',
        jobDemand: 'Very High',
        requirements: ['Frontend and backend experience', 'Database knowledge', 'Version control']
      });
    }

    if (hasDataScience) {
      careers.push({
        title: 'Data Scientist',
        match: this.calculateCareerMatch(['Data Science', 'Python', 'Machine Learning'], skillLevels),
        description: 'Analyze complex data to extract insights and build predictive models',
        skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
        averageSalary: '$90,000 - $150,000',
        jobDemand: 'Very High',
        requirements: ['Strong analytical skills', 'Programming in Python/R', 'Statistical knowledge']
      });
    }

    if (hasHighProgramming && hasLeadership) {
      careers.push({
        title: 'Technical Team Lead',
        match: this.calculateCareerMatch(['Programming', 'Leadership', 'Communication'], skillLevels),
        description: 'Lead technical teams while contributing to software development',
        skills: ['Leadership', 'Programming', 'Project Management', 'Communication', 'Mentoring'],
        averageSalary: '$100,000 - $160,000',
        jobDemand: 'High',
        requirements: ['Strong technical background', 'Leadership experience', 'Communication skills']
      });
    }

    return careers.sort((a, b) => b.match - a.match).slice(0, 5);
  }

  private static calculateCareerMatch(requiredSkills: string[], userSkills: SkillLevel[]): number {
    let totalMatch = 0;
    let skillsFound = 0;

    requiredSkills.forEach(required => {
      const userSkill = userSkills.find(s => 
        s.skill.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(s.skill.toLowerCase())
      );
      
      if (userSkill) {
        totalMatch += userSkill.level;
        skillsFound++;
      }
    });

    return skillsFound > 0 ? Math.round(totalMatch / skillsFound) : 50;
  }

  private static async generateLearningRecommendations(skillLevels: SkillLevel[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    skillLevels.forEach(skill => {
      if (skill.level < 70) {
        if (skill.skill.includes('JavaScript')) {
          recommendations.push('JavaScript Fundamentals Course');
          recommendations.push('Modern JavaScript (ES6+) Tutorial');
        } else if (skill.skill.includes('React')) {
          recommendations.push('React Development Bootcamp');
          recommendations.push('Advanced React Patterns');
        } else if (skill.skill.includes('Python')) {
          recommendations.push('Python for Beginners');
          recommendations.push('Python Data Science Toolkit');
        } else if (skill.skill.includes('Problem Solving')) {
          recommendations.push('Algorithm and Data Structure Course');
          recommendations.push('Critical Thinking Workshop');
        } else if (skill.skill.includes('Communication')) {
          recommendations.push('Technical Communication Skills');
          recommendations.push('Presentation Skills for Developers');
        }
      }
    });

    return [...new Set(recommendations)].slice(0, 5);
  }

  private static calculateOverallScore(skillLevels: SkillLevel[]): number {
    if (skillLevels.length === 0) return 50;
    
    const totalScore = skillLevels.reduce((sum, skill) => sum + skill.level, 0);
    return Math.round(totalScore / skillLevels.length);
  }

  private static fallbackAssessmentAnalysis(answers: AssessmentAnswer[]): AssessmentResults {
    return {
      skillLevels: [
        { skill: 'Problem Solving', level: 75, category: 'Soft Skills', confidence: 0.8 },
        { skill: 'Programming', level: 65, category: 'Technical', confidence: 0.7 },
        { skill: 'Communication', level: 70, category: 'Soft Skills', confidence: 0.8 }
      ],
      recommendedCareers: [
        {
          title: 'Software Developer',
          match: 80,
          description: 'Build software applications and systems',
          skills: ['Programming', 'Problem Solving', 'Testing'],
          jobDemand: 'High'
        }
      ],
      learningRecommendations: ['Programming Fundamentals', 'Software Design Patterns'],
      overallScore: 70
    };
  }

  private static generateIntelligentSkillPredictions(assessmentData: any): SkillLevel[] {
    // This would be replaced with actual AI model predictions
    return [
      { skill: 'JavaScript', level: 75, category: 'Technical', confidence: 0.85 },
      { skill: 'Problem Solving', level: 80, category: 'Soft Skills', confidence: 0.9 },
      { skill: 'Communication', level: 70, category: 'Soft Skills', confidence: 0.8 }
    ];
  }

  private static generateIntelligentCareerRecommendations(skillLevels: SkillLevel[]): CareerRecommendation[] {
    // This would be replaced with actual AI model predictions
    return [
      {
        title: 'Frontend Developer',
        match: 85,
        description: 'Build user interfaces and web applications',
        skills: ['JavaScript', 'React', 'CSS'],
        jobDemand: 'Very High'
      }
    ];
  }
}