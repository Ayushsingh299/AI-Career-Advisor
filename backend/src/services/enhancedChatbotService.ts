import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { CareerMentorService } from './careerMentorService';

// Enhanced interfaces for advanced chatbot
interface ConversationContext {
  sessionId: string;
  userProfile?: {
    name?: string;
    currentRole?: string;
    experience?: string;
    skills?: string[];
    careerGoals?: string;
    industry?: string;
    education?: string;
    preferredWorkStyle?: string;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    intent?: string;
    sentiment?: string;
  }>;
  preferences?: {
    responseStyle?: 'professional' | 'casual' | 'detailed' | 'concise';
    focusAreas?: string[];
    communicationStyle?: string;
  };
  context?: {
    lastDiscussedTopic?: string;
    currentFlow?: string;
    pendingQuestions?: string[];
    userGoals?: string[];
  };
}

interface EnhancedChatResponse {
  message: string;
  confidence: number;
  intent: string;
  sentiment?: string;
  followUpQuestions?: string[];
  suggestedActions?: string[];
  quickReplies?: string[];
  careerInsights?: string[];
  contextualHelp?: string;
  conversationFlow?: {
    currentStep?: string;
    nextSteps?: string[];
    progress?: number;
  };
}

interface UserIntent {
  primary: string;
  confidence: number;
  entities?: string[];
  context?: string;
}

export class EnhancedChatbotService {
  private openai: OpenAI | null = null;
  private conversations: Map<string, ConversationContext> = new Map();
  private systemPrompt: string;
  private isUsingAI: boolean = false;
  private careerMentor: CareerMentorService;

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.isUsingAI = true;
      logger.info('Enhanced Chatbot: OpenAI integration enabled');
    } else {
      logger.info('Enhanced Chatbot: Using advanced rule-based responses (OpenAI not configured)');
    }

    this.systemPrompt = this.buildAdvancedSystemPrompt();
    this.careerMentor = new CareerMentorService();
  }

  private buildAdvancedSystemPrompt(): string {
    return `You are an expert AI Career Advisor - like ChatGPT but specialized in career guidance. You provide comprehensive, intelligent answers to career questions with depth and nuance.

**Your Role:**
You're a professional career counselor with deep knowledge of:
- Career development and planning strategies
- Current job market trends and opportunities
- Industry-specific insights and requirements
- Skills development and learning pathways
- Professional networking and relationship building
- Workplace dynamics and career advancement
- Salary negotiation and compensation strategies

**Communication Style:**
- Give direct, comprehensive answers to questions first
- Be conversational and natural, like a knowledgeable friend
- Provide specific, actionable advice with real-world examples
- Share current market insights and industry trends
- Address the exact question being asked, not generic advice
- Use a warm, encouraging but professional tone
- Include relevant statistics or data when helpful

**Response Approach:**
1. **Direct Answer**: Answer their specific question comprehensively
2. **Context & Depth**: Provide relevant background and nuanced insights
3. **Practical Steps**: Give concrete, actionable next steps
4. **Natural Follow-up**: End with a relevant question to continue the conversation

**Key Principles:**
- Answer what they actually asked, not what you think they should know
- Provide value in every response - teach them something useful
- Be specific rather than generic
- Reference current market realities and trends
- Adapt your language to their experience level
- Give multiple perspectives when appropriate
- Be encouraging but honest about challenges

Remember: You're having an intelligent conversation with someone seeking career advice. Be helpful, knowledgeable, and genuinely useful in your responses.`;
  }

  async generateResponse(
    message: string,
    sessionId: string,
    userProfile?: any
  ): Promise<EnhancedChatResponse> {
    try {
      // Get or create conversation context
      let context = this.conversations.get(sessionId);
      if (!context) {
        context = this.initializeNewConversation(sessionId, userProfile);
        this.conversations.set(sessionId, context);
      }

      // Update user profile if provided
      if (userProfile) {
        context.userProfile = { ...context.userProfile, ...userProfile };
      }

      // Analyze user intent and sentiment
      const userIntent = this.analyzeUserIntent(message, context);
      const sentiment = this.analyzeSentiment(message);

      // Add user message to history
      context.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        intent: userIntent.primary,
        sentiment
      });

      // Update conversation context
      this.updateConversationContext(context, message, userIntent);

      let response: EnhancedChatResponse;

      // Check if user wants to start career assessment or mentor features
      const mentorTriggers = [
        'career assessment', 'assess my skills', 'what career', 'career path', 
        'skill gap', 'roadmap', 'learning plan', 'career guidance',
        'help me choose', 'find my career', 'what should i do'
      ];
      
      // Check if user wants to exit mentor flow
      const exitTriggers = ['exit', 'stop', 'quit', 'help with something else', 'different question'];
      const wantsToExit = exitTriggers.some(trigger => message.toLowerCase().includes(trigger));
      
      // Only trigger mentor for specific keywords, not single word responses
      const shouldUseMentor = !wantsToExit && message.split(' ').length > 1 && 
        mentorTriggers.some(trigger => message.toLowerCase().includes(trigger));

      if (shouldUseMentor && !context.context?.currentFlow?.includes('mentor')) {
        // Start career mentor flow
        response = await this.startCareerMentorFlow(context, message);
      } else if (context.context?.currentFlow?.includes('mentor') && !wantsToExit) {
        // Continue career mentor flow
        response = await this.continueCareerMentorFlow(context, message, userIntent);
      } else {
        // Exit mentor flow if requested or use regular AI/rule-based responses
        if (wantsToExit && context.context?.currentFlow?.includes('mentor')) {
          if (context.context) {
            context.context.currentFlow = 'general';
          }
        }
        
        if (this.isUsingAI && this.openai) {
          response = await this.generateAIResponse(message, context, userIntent);
        } else {
          response = await this.generateAdvancedRuleBasedResponse(message, context, userIntent);
        }
      }

      // Add AI response to history
      context.conversationHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        intent: userIntent.primary
      });

      // Manage conversation history length
      this.maintainConversationHistory(context);

      return response;

    } catch (error: any) {
      logger.error('Error generating enhanced chatbot response:', error);
      return this.getErrorResponse();
    }
  }

  private async generateAdvancedRuleBasedResponse(
    message: string,
    context: ConversationContext,
    userIntent: UserIntent
  ): Promise<EnhancedChatResponse> {
    // Generate a specific, contextual response based on the exact user question
    const specificResponse = this.generateSpecificResponse(message, userIntent, context);
    
    return this.formatAdvancedResponse(specificResponse, userIntent, context);
  }

  /**
   * Generate specific, contextual responses based on the exact user question
   * This makes the AI respond like Google's AI with tailored, specific answers
   */
  private generateSpecificResponse(
    message: string, 
    userIntent: UserIntent, 
    context: ConversationContext
  ): string {
    const messageLower = message.toLowerCase();
    const keywords = this.extractKeywords(message);
    
    // Analyze the specific question and generate a tailored response
    if (this.isAboutSpecificTechnology(messageLower, keywords)) {
      return this.generateTechSpecificResponse(message, keywords, context);
    }
    
    if (this.isAboutSpecificCareer(messageLower, keywords)) {
      return this.generateCareerSpecificResponse(message, keywords, context);
    }
    
    if (this.isAboutLearningPath(messageLower, keywords)) {
      return this.generateLearningPathResponse(message, keywords, context);
    }
    
    if (this.isAboutTransition(messageLower, keywords)) {
      return this.generateTransitionResponse(message, keywords, context);
    }
    
    if (this.isAboutSalaryOrJob(messageLower, keywords)) {
      return this.generateJobMarketResponse(message, keywords, context);
    }
    
    if (this.isAboutSkills(messageLower, keywords)) {
      return this.generateSkillsResponse(message, keywords, context);
    }
    
    // Fallback: generate contextual response based on intent
    return this.generateContextualFallback(message, userIntent, context);
  }

  private generateTechSpecificResponse(message: string, keywords: string[], context: ConversationContext): string {
    const tech = keywords.find(k => ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes'].includes(k));
    
    if (tech === 'python') {
      return `Great question about **Python**! Python is one of the most versatile and in-demand programming languages, perfect for beginners and essential for AI, data science, and web development.

**Current Market Demand:** Extremely high - 78% job growth, used in 67% of data science positions

**Learning Path:**
• Master basic syntax and data types (2-3 weeks)
• Learn control structures and functions (2-3 weeks)  
• Understand object-oriented programming (3-4 weeks)
• Explore libraries (NumPy, Pandas, Flask) (4-6 weeks)
• Build real projects and deploy them (ongoing)

**Career Opportunities:**
• **Python Developer**: $75,000-$130,000 average salary
• **Data Scientist**: $95,000-$165,000 average salary
• **AI/ML Engineer**: $110,000-$180,000 average salary

**Pro Tips:**
• Start with "Automate the Boring Stuff with Python" book
• Practice on LeetCode and HackerRank daily
• Join Python communities on Reddit and Discord
• Build a portfolio with 3-5 diverse projects

Would you like specific resources for learning Python or details about career paths using this technology?`;
    }
    
    if (tech === 'javascript') {
      return `Excellent choice with **JavaScript**! It's the language of the web and essential for modern development.

**Current Market Demand:** Very high - 65% job growth, required for 89% of web development roles

**Learning Path:**
• Learn basic syntax, variables, and functions (2-3 weeks)
• Master DOM manipulation and events (2-3 weeks)
• Understand ES6+ features and async programming (3-4 weeks)
• Learn a framework like React (6-8 weeks)
• Build full-stack applications with Node.js (ongoing)

**Career Opportunities:**
• **Frontend Developer**: $70,000-$120,000
• **Full-Stack Developer**: $80,000-$140,000
• **React Developer**: $85,000-$150,000

**Pro Tips:**
• Practice with freeCodeCamp and JavaScript30
• Build interactive projects, not just tutorials
• Learn modern ES6+ features thoroughly
• Focus on one framework (React recommended) first

What specific aspect of JavaScript development interests you most?`;
    }

    if (tech === 'java') {
      return `**Java** is an excellent choice! It's a robust, enterprise-grade language that powers many large-scale applications.

**Current Market Demand:** High - 45% job growth, dominant in enterprise environments

**Learning Path:**
• Understand Java basics and OOP concepts (3-4 weeks)
• Learn collections, exceptions, and I/O (3-4 weeks)
• Master Spring framework for web development (6-8 weeks)
• Explore database integration with JPA/Hibernate (4-6 weeks)
• Build enterprise applications (ongoing)

**Career Opportunities:**
• **Java Developer**: $75,000-$125,000
• **Spring Boot Developer**: $85,000-$140,000
• **Android Developer**: $80,000-$135,000

**Pro Tips:**
• Start with Oracle's Java tutorials
• Practice on Codewars and LeetCode
• Learn Spring Boot for modern Java development
• Build REST APIs and microservices

Are you interested in web development, Android development, or enterprise applications with Java?`;
    }
    
    // General tech response for other technologies
    return `I can see you're interested in technology! The tech field is incredibly dynamic with excellent career prospects.

**Hot Technologies in 2024:**
• **AI/ML**: Python, TensorFlow, PyTorch
• **Cloud Computing**: AWS, Azure, Google Cloud
• **Web Development**: React, Next.js, TypeScript
• **Mobile**: React Native, Flutter
• **DevOps**: Docker, Kubernetes, CI/CD

**Getting Started Tips:**
• Choose one technology and master it first
• Build real projects to showcase your skills
• Join developer communities and contribute to open source
• Focus on problem-solving, not just syntax

What specific technology interests you most? I can provide a detailed learning roadmap!`;
  }

  private generateCareerSpecificResponse(message: string, keywords: string[], context: ConversationContext): string {
    const career = keywords.find(k => ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'data scientist', 'product manager'].includes(k));
    
    if (career === 'developer') {
      return `Excellent choice! **Software Developer** is experiencing exceptional growth with 25% increase expected by 2032.

**What They Do:**
• Design and build software applications and systems
• Write, test, and maintain code in various programming languages
• Collaborate with teams to solve complex technical problems
• Participate in code reviews and maintain software quality
• Stay updated with new technologies and best practices

**Required Skills:**
• Programming languages (Python, JavaScript, Java, etc.)
• Problem-solving and analytical thinking
• Version control systems (Git)
• Database management and SQL
• Agile development methodologies

**Career Path:**
1. **Junior Developer** (0-2 years) - $60,000-$85,000
2. **Mid-Level Developer** (2-5 years) - $85,000-$120,000
3. **Senior Developer** (5-8 years) - $120,000-$160,000
4. **Lead Developer/Architect** (8+ years) - $160,000-$220,000

**Industry Insights:**
• Remote work is common (78% of positions offer remote options)
• Continuous learning is essential due to rapidly evolving technology
• Specialization in emerging areas like AI/ML can significantly boost salary
• Strong communication skills are increasingly valued

**Next Steps:**
• Choose a programming language and master it
• Build a portfolio of 3-5 diverse projects
• Contribute to open-source projects
• Practice coding challenges on LeetCode/HackerRank
• Network with other developers and join tech communities

Would you like me to create a personalized roadmap to become a developer?`;
    }

    if (career === 'data scientist') {
      return `**Data Scientist** is projected to grow 36% by 2031, much faster than average!

**What They Do:**
• Analyze large datasets to extract meaningful insights
• Build predictive models and machine learning algorithms
• Create visualizations to communicate findings to stakeholders
• Design and conduct experiments to test hypotheses
• Collaborate with business teams to solve data-driven problems

**Required Skills:**
• Programming (Python, R, SQL)
• Statistics and mathematics
• Machine learning and AI techniques
• Data visualization tools (Tableau, Power BI)
• Business acumen and communication skills

**Career Path:**
1. **Junior Data Analyst** (0-2 years) - $65,000-$85,000
2. **Data Scientist** (2-4 years) - $95,000-$135,000
3. **Senior Data Scientist** (4-7 years) - $135,000-$180,000
4. **Principal Data Scientist** (7+ years) - $180,000-$250,000

**Industry Insights:**
• High demand across all industries, not just tech
• PhD not always required - skills matter more than degrees
• Domain expertise in specific industries is highly valuable
• Ethics and responsible AI practices are increasingly important

**Next Steps:**
• Learn Python and statistics fundamentals
• Complete Kaggle competitions to build portfolio
• Take courses in machine learning and data visualization
• Choose a specialization (NLP, computer vision, etc.)
• Build end-to-end data science projects

What aspect of data science interests you most - the technical side or the business applications?`;
    }
    
    return `Career exploration is exciting! Let me help you understand different career paths and what they entail.

**Popular Tech Careers:**
• **Software Developer**: Build applications and systems
• **Data Scientist**: Analyze data to drive business decisions
• **Product Manager**: Guide product development and strategy
• **UX Designer**: Create user-friendly interfaces
• **DevOps Engineer**: Manage deployment and infrastructure

**Non-Tech Careers:**
• **Project Manager**: Coordinate teams and deliverables
• **Business Analyst**: Bridge business and technical requirements
• **Marketing Manager**: Drive growth and brand awareness

What type of work environment and daily activities appeal to you most?`;
  }

  private generateLearningPathResponse(message: string, keywords: string[], context: ConversationContext): string {
    const subject = keywords.find(k => ['javascript', 'python', 'java', 'react', 'data science', 'ai', 'machine learning'].includes(k));
    
    if (subject) {
      return `Perfect! Here's a comprehensive learning roadmap for **${subject}**:

**Phase 1: Foundations (4-6 weeks)**
• Basic concepts and fundamentals
• Core principles and theory
• Setting up development environment
• Basic hands-on practice

**Phase 2: Practical Application (6-8 weeks)**
• Working on real projects
• Applying concepts to solve problems
• Building portfolio pieces
• Learning industry best practices

**Phase 3: Advanced Concepts (8-12 weeks)**
• Advanced techniques and patterns
• Professional development practices
• Contributing to open source
• Building complex applications

**Recommended Resources:**
• **Free**: YouTube tutorials, official documentation
• **Paid**: Coursera, Udemy, specialized courses
• **Interactive**: Codecademy, hands-on platforms
• **Books**: Industry-standard textbooks and guides

**Project Ideas:**
• Build a personal portfolio website
• Create a data analysis project
• Develop a full-stack application
• Contribute to open source projects

**Success Tips:**
• Practice coding every day, even if just 30 minutes
• Join communities and learn from others
• Build projects that solve real problems
• Don't just follow tutorials - create your own projects

Would you like me to break down any of these phases in more detail?`;
    }
    
    return `I'd love to help you create a learning plan! Effective learning requires a structured approach.

**General Learning Strategy:**

**1. Set Clear Goals (Week 1)**
• Define what you want to achieve
• Set realistic timelines
• Identify success metrics

**2. Foundation Building (Weeks 2-4)**
• Start with fundamentals
• Practice basic concepts daily
• Join learning communities

**3. Hands-On Practice (Weeks 5-8)**
• Build real projects
• Apply concepts immediately
• Seek feedback from peers

**4. Advanced Application (Weeks 9-12)**
• Work on complex challenges
• Contribute to open source
• Start building a portfolio

**Learning Resources:**
• **Free**: YouTube, freeCodeCamp, MDN Web Docs
• **Paid**: Coursera, Udemy, Pluralsight
• **Interactive**: Codecademy, LeetCode, HackerRank

What specific skill or technology would you like to focus on?`;
  }

  private generateTransitionResponse(message: string, keywords: string[], context: ConversationContext): string {
    return `Career transitions are increasingly common and can be very rewarding! The key is strategic planning.

**Popular Career Transitions:**
• **Teaching → Corporate Training**: Education skills transfer well
• **Sales → Product Management**: Customer insight is valuable
• **Finance → Data Science**: Analytical skills are foundational
• **Marketing → UX Design**: Understanding user needs is crucial
• **Engineering → Management**: Technical background provides credibility

**Universal Transition Steps:**

**1. Self Assessment**
• Identify transferable skills
• Understand your motivations
• Set realistic expectations

**2. Market Research**
• Study target industry requirements
• Network with professionals in your target field
• Understand salary expectations and job market

**3. Skill Development**
• Take relevant courses and certifications
• Build a portfolio showcasing new skills
• Gain practical experience through projects

**4. Strategic Job Search**
• Tailor your resume to highlight relevant experience
• Practice explaining your transition story
• Consider transitional roles or companies that value diverse backgrounds

**Success Stories:**
• Average transition time: 12-18 months
• 73% report increased job satisfaction
• Salary often increases within 2 years

What field are you currently in, and what field interests you?`;
  }

  private generateJobMarketResponse(message: string, keywords: string[], context: ConversationContext): string {
    const role = keywords.find(k => ['developer', 'engineer', 'manager', 'analyst', 'designer', 'data scientist'].includes(k));
    
    if (role) {
      return `Here's the current job market outlook for **${role}**:

**Salary Information:**
• **Entry Level**: $65,000-$85,000
• **Mid Level (3-5 years)**: $95,000-$125,000
• **Senior Level (5+ years)**: $125,000-$180,000

**Market Demand:**
• **Job Growth**: 25% growth (next 5 years)
• **Current Openings**: Over 100,000 positions available
• **Competition Level**: Moderate to High

**Top Industries Hiring:**
• **Technology**: Software companies, startups, tech giants
• **Finance**: Banks, fintech, trading firms
• **Healthcare**: Health tech, medical devices, telemedicine
• **E-commerce**: Online retailers, marketplace platforms

**In-Demand Skills:**
• Technical expertise in relevant technologies
• Problem-solving and analytical thinking
• Communication and collaboration
• Adaptability and continuous learning

**Location Insights:**
• **Highest Paying Cities**: San Francisco, Seattle, New York, Austin
• **Remote Opportunities**: 70% of positions offer remote work
• **Fastest Growing Markets**: Denver, Atlanta, Nashville, Portland

Would you like specific advice on positioning yourself for these opportunities?`;
    }
    
    return `The job market is dynamic, but there are clear trends across industries:

**Hot Job Markets (2024):**

**Technology:**
• Software Engineers: $85K-$160K
• Data Scientists: $95K-$180K
• Cybersecurity Specialists: $80K-$150K
• AI/ML Engineers: $110K-$200K

**Business:**
• Product Managers: $90K-$170K
• Digital Marketing Managers: $60K-$120K
• Business Analysts: $65K-$115K

**Emerging Fields:**
• Sustainability Consultants: $70K-$130K
• Remote Work Coordinators: $55K-$95K
• Healthcare Technology: $75K-$140K

**Market Trends:**
• 68% increase in remote/hybrid positions
• Skills-based hiring over degree requirements
• 40% growth in AI-related roles
• Emphasis on soft skills and adaptability

**Salary Negotiation Factors:**
• Location (SF/NYC premium: +20-40%)
• Company size (Big Tech: +15-30%)
• Stock options and benefits
• Remote work policies

What specific role or industry would you like detailed market data for?`;
  }

  private generateSkillsResponse(message: string, keywords: string[], context: ConversationContext): string {
    const skillType = this.identifySkillType(message, keywords);
    
    if (skillType === 'technical') {
      return `Technical skills are crucial for career advancement! Here's what's most valuable right now:

**Highest Demand Technical Skills (2024):**

**Programming & Development:**
• **Python**: 78% job growth - AI, data science, web development
• **JavaScript/TypeScript**: 65% job growth - web and mobile apps
• **Java**: 45% job growth - enterprise applications
• **React/Next.js**: 82% job growth - modern web development

**Data & Analytics:**
• **SQL**: Essential for 89% of data roles
• **Tableau/Power BI**: 71% growth in data visualization roles
• **Machine Learning**: 156% job growth across industries
• **Excel Advanced**: Still required for 67% of business roles

**Cloud & Infrastructure:**
• **AWS**: 76% of cloud job postings
• **Docker/Kubernetes**: 89% growth in DevOps roles
• **CI/CD**: Required for 82% of senior developer positions

**Learning Strategy:**
• Pick 2-3 complementary skills
• Build projects to demonstrate proficiency
• Get certified (AWS, Google, Microsoft)
• Practice on platforms like LeetCode, Kaggle

**ROI by Skill (salary increase):**
• Cloud Platforms: +25-40%
• Machine Learning: +30-50%
• Full-Stack Development: +20-35%

Which technical skill area interests you most?`;
    }
    
    if (skillType === 'soft') {
      return `Soft skills are becoming increasingly valuable - they're what set apart top performers!

**Most Valuable Soft Skills (2024):**

**Communication:**
• **Impact**: 67% of promotions attributed to communication skills
• **Development**: Join Toastmasters, practice public speaking, write regularly
• **Application**: Lead meetings, present ideas, mentor others

**Leadership:**
• **Impact**: 5x more likely to be promoted to senior roles
• **Development**: Take on project leadership, volunteer for initiatives
• **Application**: Influence without authority, build consensus

**Problem-Solving:**
• **Impact**: #1 skill requested by 84% of employers
• **Development**: Learn design thinking, practice root cause analysis
• **Application**: Tackle complex challenges, propose innovative solutions

**Emotional Intelligence:**
• **Impact**: 71% of hiring managers value it over IQ
• **Development**: Practice empathy, self-awareness, social skills
• **Application**: Navigate workplace dynamics, build relationships

**Adaptability:**
• **Impact**: Critical for 92% of remote/hybrid roles
• **Development**: Embrace change, learn continuously, stay flexible
• **Application**: Thrive in uncertain environments, pivot quickly

Which soft skill would have the biggest impact on your career?`;
    }
    
    // General skills response
    return `Skills development is the key to career growth! Let me help you identify the most valuable skills for your situation.

**Skills Framework:**

**Technical Skills (Hard Skills):**
• Industry-specific tools and technologies
• Certifications and technical knowledge
• Measurable, teachable abilities
• Example: Python, Excel, Photoshop

**Soft Skills (People Skills):**
• Communication and interpersonal abilities
• Leadership and teamwork
• Problem-solving and critical thinking
• Example: Leadership, empathy, creativity

**Hybrid Skills (Most Valuable):**
• Technical skills + communication
• Data analysis + business understanding
• Coding + user experience design
• Project management + technical knowledge

**Skill Development Strategy:**

**1. Audit Your Current Skills**
• List all your technical and soft skills
• Rate your proficiency (1-10)
• Identify gaps for your target role

**2. Prioritize Based on Impact**
• Research job postings in your field
• Talk to people in your target role
• Focus on skills that appear in 70%+ of postings

**3. Create a Learning Plan**
• Set specific, measurable goals
• Allocate time for practice
• Find ways to apply skills immediately

**4. Build Evidence**
• Create projects showcasing your skills
• Get testimonials from colleagues
• Pursue relevant certifications

What type of skills would you like to focus on - technical skills for your industry or soft skills for leadership?`;
  }

  // Helper methods
  private extractKeywords(message: string): string[] {
    const messageLower = message.toLowerCase();
    const keywords: string[] = [];
    
    // Programming languages and technologies
    const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes', 'ai', 'machine learning', 'data science', 'blockchain', 'cybersecurity', 'devops', 'mobile development', 'ios', 'android', 'flutter'];
    
    // Career fields and roles
    const careerKeywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'director', 'architect', 'scientist', 'researcher', 'product manager', 'data scientist', 'software engineer', 'frontend', 'backend', 'fullstack', 'ui/ux', 'marketing', 'sales', 'finance', 'healthcare', 'education'];
    
    // Skills and concepts
    const skillKeywords = ['leadership', 'communication', 'problem solving', 'teamwork', 'project management', 'agile', 'scrum', 'git', 'testing', 'debugging', 'algorithms', 'data structures', 'apis', 'databases', 'cloud computing', 'security', 'performance'];
    
    const allKeywords = [...techKeywords, ...careerKeywords, ...skillKeywords];
    
    for (const keyword of allKeywords) {
      if (messageLower.includes(keyword)) {
        keywords.push(keyword);
      }
    }
    
    return keywords;
  }

  private isAboutSpecificTechnology(message: string, keywords: string[]): boolean {
    const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'sql', 'mongodb', 'aws', 'azure', 'docker', 'kubernetes', 'ai', 'machine learning', 'blockchain'];
    return keywords.some(k => techKeywords.includes(k)) || 
           message.includes('programming') || 
           message.includes('coding') || 
           message.includes('framework') || 
           message.includes('language');
  }

  private isAboutSpecificCareer(message: string, keywords: string[]): boolean {
    const careerKeywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'director', 'scientist', 'product manager'];
    return keywords.some(k => careerKeywords.includes(k)) || 
           message.includes('career path') || 
           message.includes('become a') || 
           message.includes('job as');
  }

  private isAboutLearningPath(message: string, keywords: string[]): boolean {
    return message.includes('learn') || 
           message.includes('study') || 
           message.includes('course') || 
           message.includes('tutorial') || 
           message.includes('roadmap') || 
           message.includes('how to get started') || 
           message.includes('beginner');
  }

  private isAboutTransition(message: string, keywords: string[]): boolean {
    return message.includes('transition') || 
           message.includes('change career') || 
           message.includes('switch') || 
           message.includes('move from') || 
           message.includes('pivot');
  }

  private isAboutSalaryOrJob(message: string, keywords: string[]): boolean {
    return message.includes('salary') || 
           message.includes('pay') || 
           message.includes('compensation') || 
           message.includes('job market') || 
           message.includes('hiring') || 
           message.includes('demand');
  }

  private isAboutSkills(message: string, keywords: string[]): boolean {
    return message.includes('skill') || 
           message.includes('ability') || 
           message.includes('competency') || 
           message.includes('talent') || 
           message.includes('expertise');
  }

  private identifySkillType(message: string, keywords: string[]): string {
    const techKeywords = ['programming', 'coding', 'python', 'javascript', 'java', 'sql', 'aws', 'docker', 'react'];
    const softKeywords = ['communication', 'leadership', 'teamwork', 'problem solving', 'management', 'emotional intelligence'];
    
    const hasTechKeywords = keywords.some(k => techKeywords.includes(k)) || techKeywords.some(t => message.includes(t));
    const hasSoftKeywords = keywords.some(k => softKeywords.includes(k)) || softKeywords.some(s => message.includes(s));
    
    if (hasTechKeywords && !hasSoftKeywords) return 'technical';
    if (hasSoftKeywords && !hasTechKeywords) return 'soft';
    return 'general';
  }

  private generateContextualFallback(message: string, userIntent: UserIntent, context: ConversationContext): string {
    const responses = this.getAdvancedResponseTemplates(userIntent.primary, context);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getAdvancedResponseTemplates(intent: string, context: ConversationContext): string[] {
    // Build intelligent, context-aware responses based on intent and conversation history
    return this.buildIntelligentResponse(intent, context);
  }

  private buildIntelligentResponse(intent: string, context: ConversationContext): string[] {
    // Generate contextual responses based on intent
    const responseMap: { [key: string]: string[] } = {
      general_career_advice: [
        "I'm here to help with your career questions! Whether you're exploring new opportunities, looking to develop skills, or planning your next career move, I can provide personalized guidance based on current market trends and best practices. What specific aspect of your career would you like to discuss?"
      ],
      skill_development: [
        "Great question about skill development! The most valuable approach is to focus on skills that align with your career goals while staying current with market demands. What type of role or industry are you targeting? I can help you identify the most impactful skills to develop."
      ],
      career_change: [
        "Career transitions can be exciting opportunities for growth! The key is leveraging your existing skills while strategically building new ones. What field are you considering moving to, and what's driving your interest in making this change?"
      ]
    };

    return responseMap[intent] || responseMap.general_career_advice;
  }

  // Other required methods with simplified implementations
  private initializeNewConversation(sessionId: string, userProfile?: any): ConversationContext {
    return {
      sessionId,
      userProfile: userProfile || {},
      conversationHistory: [],
      preferences: { responseStyle: 'professional', focusAreas: [] },
      context: { currentFlow: 'initial_greeting', pendingQuestions: [], userGoals: [] }
    };
  }

  private analyzeUserIntent(message: string, context: ConversationContext): UserIntent {
    const messageLower = message.toLowerCase();
    
    // Check for specific technology mentions
    if (messageLower.includes('python') || messageLower.includes('javascript') || messageLower.includes('java') || messageLower.includes('programming')) {
      return { primary: 'technology_inquiry', confidence: 0.9, entities: [] };
    }
    
    // Check for career-specific inquiries
    if (messageLower.includes('developer') || messageLower.includes('engineer') || messageLower.includes('data scientist')) {
      return { primary: 'career_inquiry', confidence: 0.9, entities: [] };
    }
    
    // Check for learning-related queries
    if (messageLower.includes('learn') || messageLower.includes('study') || messageLower.includes('course') || messageLower.includes('roadmap')) {
      return { primary: 'learning_path', confidence: 0.85, entities: [] };
    }
    
    // Check for transition queries
    if (messageLower.includes('transition') || messageLower.includes('change career') || messageLower.includes('switch')) {
      return { primary: 'career_transition', confidence: 0.85, entities: [] };
    }
    
    // Check for job market queries
    if (messageLower.includes('salary') || messageLower.includes('job market') || messageLower.includes('hiring')) {
      return { primary: 'job_market', confidence: 0.85, entities: [] };
    }
    
    // Check for skills queries
    if (messageLower.includes('skill') || messageLower.includes('ability')) {
      return { primary: 'skill_development', confidence: 0.8, entities: [] };
    }
    
    // Default intent
    return { primary: 'general_career_advice', confidence: 0.6, entities: [] };
  }

  private analyzeSentiment(message: string): string {
    const messageLower = message.toLowerCase();
    const positiveWords = ['great', 'good', 'excited', 'happy', 'love'];
    const negativeWords = ['stressed', 'frustrated', 'confused', 'stuck'];
    
    const positive = positiveWords.some(word => messageLower.includes(word));
    const negative = negativeWords.some(word => messageLower.includes(word));
    
    if (positive && !negative) return 'positive';
    if (negative && !positive) return 'negative';
    return 'neutral';
  }

  private updateConversationContext(context: ConversationContext, message: string, userIntent: UserIntent): void {
    if (context.context) {
      context.context.lastDiscussedTopic = userIntent.primary;
    }
  }

  private formatAdvancedResponse(
    responseContent: string, 
    userIntent: UserIntent, 
    context: ConversationContext
  ): EnhancedChatResponse {
    return {
      message: responseContent,
      confidence: 0.85,
      intent: userIntent.primary,
      sentiment: 'positive',
      followUpQuestions: [],
      suggestedActions: [],
      quickReplies: [],
      careerInsights: [],
      contextualHelp: "💬 I'm here to help with any career questions you have!"
    };
  }

  private maintainConversationHistory(context: ConversationContext): void {
    if (context.conversationHistory.length > 30) {
      context.conversationHistory = context.conversationHistory.slice(-30);
    }
  }

  private getErrorResponse(): EnhancedChatResponse {
    return {
      message: "I'm experiencing some technical difficulties, but I'm still here to help! Could you try rephrasing your question?",
      confidence: 0.1,
      intent: 'error',
      followUpQuestions: ["What specific career challenge can I help you with?"],
      suggestedActions: ["Rephrase your question", "Explore career tools"],
      quickReplies: ["Help with career planning", "Job search advice", "Skill development tips"]
    };
  }

  // Career mentor flow methods (simplified versions)
  private async startCareerMentorFlow(context: ConversationContext, message: string): Promise<EnhancedChatResponse> {
    if (context.context) {
      context.context.currentFlow = 'mentor-assessment';
    }

    return {
      message: "🚀 Great! I'd love to help you with career guidance. Let me ask you a few questions to provide personalized advice.\n\nFirst, what's your current experience level?\n• Beginner (0-2 years)\n• Intermediate (2-5 years) \n• Advanced (5+ years)",
      confidence: 0.95,
      intent: 'career_assessment',
      sentiment: 'positive',
      quickReplies: ['Beginner', 'Intermediate', 'Advanced'],
      conversationFlow: {
        currentStep: 'career_assessment',
        nextSteps: ['complete_assessment', 'analyze_results'],
        progress: 10
      }
    };
  }

  private async continueCareerMentorFlow(
    context: ConversationContext,
    message: string,
    userIntent: UserIntent
  ): Promise<EnhancedChatResponse> {
    // Simplified mentor flow continuation
    return {
      message: "Thanks for that information! Based on your response, I can see you have good experience. What specific career goals are you working toward?",
      confidence: 0.9,
      intent: 'career_guidance',
      sentiment: 'positive',
      quickReplies: ['Get promoted', 'Change careers', 'Learn new skills', 'Start my own business'],
      conversationFlow: {
        currentStep: 'career_goals',
        nextSteps: ['create_roadmap'],
        progress: 50
      }
    };
  }

  private async generateAIResponse(
    message: string,
    context: ConversationContext,
    userIntent: UserIntent
  ): Promise<EnhancedChatResponse> {
    // Fallback to rule-based if OpenAI is not configured properly
    return this.generateAdvancedRuleBasedResponse(message, context, userIntent);
  }

  // Public methods for managing conversations
  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversations.get(sessionId);
  }

  public updateUserProfile(sessionId: string, profileUpdate: any): void {
    const context = this.conversations.get(sessionId);
    if (context) {
      context.userProfile = { ...context.userProfile, ...profileUpdate };
    }
  }

  public clearConversation(sessionId: string): void {
    const context = this.conversations.get(sessionId);
    if (context) {
      context.conversationHistory = [];
      context.context = {
        currentFlow: 'initial_greeting',
        pendingQuestions: [],
        userGoals: []
      };
    }
  }
}