import { GoogleAuth } from 'google-auth-library';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface SkillsAnalysis {
  extractedSkills: string[];
  proficiencyLevels: Record<string, number>;
  skillGaps: string[];
  recommendations: string[];
}

interface CareerMatch {
  title: string;
  matchPercentage: number;
  reasoning: string;
  missingSkills: string[];
  salaryRange: string;
}

class GeminiAIService {
  private auth: GoogleAuth;
  private projectId: string;
  private location: string;
  
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'career-advisor-demo';
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  /**
   * Analyze skills from assessment responses using Gemini AI
   */
  async analyzeSkillsFromAssessment(assessmentAnswers: any[]): Promise<SkillsAnalysis> {
    const prompt = `
    Analyze the following career assessment responses and extract detailed skills information:
    
    Assessment Responses: ${JSON.stringify(assessmentAnswers)}
    
    Please provide a detailed analysis in the following JSON format:
    {
      "extractedSkills": ["skill1", "skill2", ...],
      "proficiencyLevels": {"skill1": 75, "skill2": 90, ...},
      "skillGaps": ["missing_skill1", "missing_skill2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...]
    }
    
    Consider:
    - Technical skills mentioned or implied
    - Soft skills based on work style preferences
    - Experience level from responses
    - Career goals alignment
    
    Provide proficiency levels as percentages (0-100) based on the responses.
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return this.parseSkillsAnalysis(response);
    } catch (error) {
      console.error('Gemini AI skills analysis failed:', error);
      // Fallback to rule-based analysis
      return this.fallbackSkillsAnalysis(assessmentAnswers);
    }
  }

  /**
   * Generate career matches using Gemini AI
   */
  async generateCareerMatches(userSkills: string[], userGoals: string): Promise<CareerMatch[]> {
    const prompt = `
    Based on the following user profile, suggest the top 5 career matches:
    
    User Skills: ${userSkills.join(', ')}
    Career Goals: ${userGoals}
    
    Please provide career recommendations in the following JSON format:
    [
      {
        "title": "Career Title",
        "matchPercentage": 85,
        "reasoning": "Why this career matches",
        "missingSkills": ["skill1", "skill2"],
        "salaryRange": "$80,000 - $120,000"
      }
    ]
    
    Consider:
    - Current job market trends
    - Skill transferability
    - Growth potential
    - Salary expectations
    - Remote work availability
    
    Provide realistic match percentages based on skill alignment.
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return this.parseCareerMatches(response);
    } catch (error) {
      console.error('Gemini AI career matching failed:', error);
      // Fallback to predefined matches
      return this.fallbackCareerMatches(userSkills);
    }
  }

  /**
   * Analyze and improve resume content using Gemini AI
   */
  async analyzeResume(resumeText: string, targetRole?: string): Promise<any> {
    const prompt = `
    Analyze the following resume and provide improvement suggestions:
    
    Resume Content: ${resumeText}
    ${targetRole ? `Target Role: ${targetRole}` : ''}
    
    Please provide analysis in the following JSON format:
    {
      "atsScore": 75,
      "strengths": ["strength1", "strength2", ...],
      "improvements": ["improvement1", "improvement2", ...],
      "missingKeywords": ["keyword1", "keyword2", ...],
      "suggestedBulletPoints": ["• bullet1", "• bullet2", ...],
      "overallFeedback": "Detailed feedback text"
    }
    
    Focus on:
    - ATS compatibility
    - Keyword optimization
    - Quantified achievements
    - Industry best practices
    - Formatting suggestions
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return this.parseResumeAnalysis(response);
    } catch (error) {
      console.error('Gemini AI resume analysis failed:', error);
      return this.fallbackResumeAnalysis(resumeText);
    }
  }

  /**
   * Generate personalized cover letter using Gemini AI
   */
  async generateCoverLetter(userProfile: any, jobDescription: string, company: string): Promise<string> {
    const prompt = `
    Generate a personalized cover letter for the following:
    
    User Profile: ${JSON.stringify(userProfile)}
    Job Description: ${jobDescription}
    Company: ${company}
    
    Requirements:
    - Professional tone
    - Highlight relevant skills and experience
    - Show enthusiasm for the role
    - Include specific company research
    - 3-4 paragraphs
    - ATS-friendly format
    
    Please write a compelling cover letter that matches the user's background to the job requirements.
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return this.extractTextFromResponse(response);
    } catch (error) {
      console.error('Gemini AI cover letter generation failed:', error);
      return this.fallbackCoverLetter(userProfile, company);
    }
  }

  /**
   * Generate learning path recommendations using Gemini AI
   */
  async generateLearningPath(currentSkills: string[], targetRole: string): Promise<any> {
    const prompt = `
    Create a personalized learning path for career advancement:
    
    Current Skills: ${currentSkills.join(', ')}
    Target Role: ${targetRole}
    
    Please provide a structured learning path in JSON format:
    {
      "duration": "6-12 months",
      "phases": [
        {
          "name": "Phase 1",
          "duration": "2-3 months",
          "skills": ["skill1", "skill2"],
          "resources": [
            {
              "title": "Course/Resource Name",
              "provider": "Platform",
              "type": "course|book|practice",
              "priority": "high|medium|low"
            }
          ]
        }
      ],
      "milestones": ["milestone1", "milestone2"],
      "estimatedCost": "$200-500"
    }
    
    Focus on:
    - Progressive skill building
    - Practical application
    - Industry-recognized certifications
    - Cost-effective resources
    `;

    try {
      const response = await this.callGeminiAPI(prompt);
      return this.parseLearningPath(response);
    } catch (error) {
      console.error('Gemini AI learning path generation failed:', error);
      return this.fallbackLearningPath(currentSkills, targetRole);
    }
  }

  /**
   * Call Gemini API with authentication
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    // For demo purposes, we'll use a mock response
    // In production, this would make actual API calls to Google Cloud Vertex AI
    
    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const authClient = await this.auth.getClient();
        const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-pro:generateContent`;
        
        const requestBody = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 2048
          }
        };

        const response = await authClient.request({
          url,
          method: 'POST',
          data: requestBody
        });

        const geminiResponse = response.data as GeminiResponse;
        return geminiResponse.candidates[0]?.content?.parts[0]?.text || '';
      } catch (error) {
        console.error('Actual Gemini API call failed:', error);
        throw error;
      }
    } else {
      // Demo mode with intelligent mock responses
      return this.generateMockAIResponse(prompt);
    }
  }

  /**
   * Generate intelligent mock responses for demo purposes
   */
  private generateMockAIResponse(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (prompt.includes('skills analysis')) {
          resolve(JSON.stringify({
            extractedSkills: ['JavaScript', 'React', 'Problem Solving', 'Teamwork', 'Node.js'],
            proficiencyLevels: {
              'JavaScript': 85,
              'React': 75,
              'Problem Solving': 90,
              'Teamwork': 80,
              'Node.js': 65
            },
            skillGaps: ['TypeScript', 'System Design', 'Leadership'],
            recommendations: [
              'Consider learning TypeScript for better code quality',
              'Develop system design skills for senior roles',
              'Take on leadership opportunities in current projects'
            ]
          }));
        } else if (prompt.includes('career matches')) {
          resolve(JSON.stringify([
            {
              title: 'Senior Frontend Developer',
              matchPercentage: 92,
              reasoning: 'Strong JavaScript and React skills align perfectly with this role',
              missingSkills: ['TypeScript', 'Testing Frameworks'],
              salaryRange: '$90,000 - $130,000'
            },
            {
              title: 'Full Stack Developer',
              matchPercentage: 85,
              reasoning: 'Frontend skills are strong, backend experience would complement well',
              missingSkills: ['Databases', 'API Design'],
              salaryRange: '$95,000 - $140,000'
            },
            {
              title: 'Technical Lead',
              matchPercentage: 78,
              reasoning: 'Technical skills are good, leadership experience needed',
              missingSkills: ['Team Management', 'Architecture'],
              salaryRange: '$120,000 - $160,000'
            }
          ]));
        } else if (prompt.includes('resume')) {
          resolve(JSON.stringify({
            atsScore: 87,
            strengths: ['Clear technical skills', 'Quantified achievements', 'Relevant experience'],
            improvements: ['Add more action verbs', 'Include certifications', 'Optimize for keywords'],
            missingKeywords: ['Agile', 'CI/CD', 'Cloud platforms'],
            suggestedBulletPoints: [
              '• Developed responsive React applications serving 10K+ daily users',
              '• Implemented automated testing reducing bug reports by 40%',
              '• Collaborated with cross-functional teams in Agile environment'
            ],
            overallFeedback: 'Strong technical resume with good quantified results. Consider adding more industry keywords and highlighting leadership experiences.'
          }));
        } else if (prompt.includes('learning path')) {
          resolve(JSON.stringify({
            duration: '8-12 months',
            phases: [
              {
                name: 'Advanced Frontend Skills',
                duration: '3-4 months',
                skills: ['TypeScript', 'Advanced React', 'Testing'],
                resources: [
                  {
                    title: 'TypeScript Deep Dive',
                    provider: 'Udemy',
                    type: 'course',
                    priority: 'high'
                  }
                ]
              }
            ],
            milestones: ['Complete TypeScript certification', 'Build full-stack project'],
            estimatedCost: '$300-600'
          }));
        } else {
          resolve('Generated personalized content based on your profile and preferences.');
        }
      }, 1000); // Simulate API delay
    });
  }

  // Helper methods for parsing responses
  private parseSkillsAnalysis(response: string): SkillsAnalysis {
    try {
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackSkillsAnalysis([]);
    }
  }

  private parseCareerMatches(response: string): CareerMatch[] {
    try {
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackCareerMatches([]);
    }
  }

  private parseResumeAnalysis(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackResumeAnalysis('');
    }
  }

  private parseLearningPath(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      return this.fallbackLearningPath([], '');
    }
  }

  private extractTextFromResponse(response: string): string {
    try {
      const parsed = JSON.parse(response);
      return parsed.content || response;
    } catch (error) {
      return response;
    }
  }

  // Fallback methods for when AI fails
  private fallbackSkillsAnalysis(assessmentAnswers: any[]): SkillsAnalysis {
    return {
      extractedSkills: ['JavaScript', 'Problem Solving', 'Communication'],
      proficiencyLevels: { 'JavaScript': 80, 'Problem Solving': 85, 'Communication': 75 },
      skillGaps: ['Leadership', 'System Design'],
      recommendations: ['Develop leadership skills', 'Learn system design patterns']
    };
  }

  private fallbackCareerMatches(userSkills: string[]): CareerMatch[] {
    return [
      {
        title: 'Software Developer',
        matchPercentage: 85,
        reasoning: 'Good technical foundation',
        missingSkills: ['Advanced frameworks'],
        salaryRange: '$70,000 - $110,000'
      }
    ];
  }

  private fallbackResumeAnalysis(resumeText: string): any {
    return {
      atsScore: 75,
      strengths: ['Technical skills listed', 'Work experience included'],
      improvements: ['Add quantified achievements', 'Include more keywords'],
      missingKeywords: ['Agile', 'Leadership'],
      suggestedBulletPoints: ['• Improved system performance by X%'],
      overallFeedback: 'Resume has potential, needs optimization for ATS systems.'
    };
  }

  private fallbackLearningPath(currentSkills: string[], targetRole: string): any {
    return {
      duration: '6-9 months',
      phases: [
        {
          name: 'Skill Enhancement',
          duration: '3 months',
          skills: ['Advanced programming', 'System design'],
          resources: [{ title: 'Online Course', provider: 'Coursera', type: 'course', priority: 'high' }]
        }
      ],
      milestones: ['Complete certification'],
      estimatedCost: '$200-400'
    };
  }

  private fallbackCoverLetter(userProfile: any, company: string): string {
    return `Dear Hiring Manager,

I am writing to express my strong interest in joining ${company}. With my background in software development and passion for technology, I am excited about the opportunity to contribute to your team's success.

In my previous experience, I have developed skills in modern web technologies and demonstrated the ability to deliver quality solutions. I am particularly drawn to ${company}'s commitment to innovation and would love to bring my problem-solving abilities to help drive your initiatives forward.

I would welcome the opportunity to discuss how my experience and enthusiasm can contribute to ${company}'s continued success. Thank you for considering my application.

Sincerely,
${userProfile.name || 'Your Name'}`;
  }
}

export default new GeminiAIService();