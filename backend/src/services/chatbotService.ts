import { logger } from '../utils/logger';
import { EnhancedChatbotService } from './enhancedChatbotService';

// Interfaces
interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sessionId: string;
  metadata?: any;
}

interface ChatRequest {
  message: string;
  sessionId: string;
  userId?: string;
  context?: any;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  confidence: number;
  intent: string;
  suggestedActions?: string[];
  suggestions?: string[];
}

interface Feedback {
  messageId: string;
  rating: number;
  feedback?: string;
  sessionId: string;
  timestamp: Date;
}

// In-memory storage for development (replace with database in production)
const conversations: Map<string, ChatMessage[]> = new Map();
const feedbackStore: Feedback[] = [];

export class ChatbotService {
  private knowledgeBase: Map<string, any>;
  private intents: Map<string, any>;
  private enhancedChatbot: EnhancedChatbotService;

  constructor() {
    this.knowledgeBase = this.initializeKnowledgeBase();
    this.intents = this.initializeIntents();
    this.enhancedChatbot = new EnhancedChatbotService();
    logger.info('ChatbotService initialized with enhanced AI capabilities');
  }

  /**
   * Generate AI response for user message using enhanced chatbot service
   */
  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { message, sessionId, userId, context } = request;
      
      // Store user message in conversation history (legacy support)
      this.storeMessage({
        id: this.generateId(),
        message,
        sender: 'user',
        timestamp: new Date(),
        sessionId
      });

      // Create user profile from context
      const userProfile = {
        userId,
        ...context?.userProfile
      };

      // Use enhanced chatbot service for response generation
      const enhancedResponse = await this.enhancedChatbot.generateResponse(
        message, 
        sessionId, 
        userProfile
      );

      // Store bot response (legacy support)
      this.storeMessage({
        id: this.generateId(),
        message: enhancedResponse.message,
        sender: 'bot',
        timestamp: new Date(),
        sessionId,
        metadata: { 
          intent: enhancedResponse.intent, 
          confidence: enhancedResponse.confidence,
          suggestedActions: enhancedResponse.suggestedActions,
          sentiment: enhancedResponse.sentiment
        }
      });

      logger.info('Enhanced chatbot response generated', { 
        intent: enhancedResponse.intent, 
        confidence: enhancedResponse.confidence, 
        messageLength: enhancedResponse.message.length,
        sentiment: enhancedResponse.sentiment
      });

      // Convert enhanced response to legacy format for backward compatibility
      return {
        response: enhancedResponse.message,
        sessionId,
        confidence: enhancedResponse.confidence,
        intent: enhancedResponse.intent,
        suggestedActions: enhancedResponse.suggestedActions || [],
        suggestions: enhancedResponse.quickReplies || []
      };
    } catch (error) {
      logger.error('Error generating enhanced chatbot response', error);
      return this.getFallbackResponse(request.sessionId);
    }
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId: string): Promise<ChatMessage[]> {
    return conversations.get(sessionId) || [];
  }

  /**
   * Submit feedback for chatbot response
   */
  async submitFeedback(feedback: Feedback): Promise<void> {
    feedbackStore.push(feedback);
    logger.info('Feedback submitted', { 
      rating: feedback.rating, 
      sessionId: feedback.sessionId 
    });
  }

  /**
   * Get suggested questions/topics
   */
  async getSuggestions(): Promise<string[]> {
    return [
      "How do I choose the right career path?",
      "What skills are in high demand in tech?",
      "How can I transition to a new industry?",
      "What's the average salary for data scientists?",
      "How do I improve my resume?",
      "What are the best programming languages to learn?",
      "How do I prepare for technical interviews?",
      "What soft skills are most important?",
      "How do I build a professional network?",
      "What are emerging career opportunities?"
    ];
  }

  /**
   * Clear conversation history
   */
  async clearConversation(sessionId: string): Promise<void> {
    conversations.delete(sessionId);
    this.enhancedChatbot.clearConversation(sessionId);
    logger.info('Conversation cleared', { sessionId });
  }

  /**
   * Get enhanced conversation context
   */
  getEnhancedConversationContext(sessionId: string): any {
    return this.enhancedChatbot.getConversationContext(sessionId);
  }

  /**
   * Update user profile for enhanced personalization
   */
  updateUserProfile(sessionId: string, profileUpdate: any): void {
    this.enhancedChatbot.updateUserProfile(sessionId, profileUpdate);
  }

  /**
   * Get full enhanced chatbot response (for advanced features)
   */
  async getEnhancedResponse(request: ChatRequest): Promise<any> {
    const { message, sessionId, userId, context } = request;
    
    const userProfile = {
      userId,
      ...context?.userProfile
    };

    return await this.enhancedChatbot.generateResponse(message, sessionId, userProfile);
  }

  // Private helper methods

  private initializeKnowledgeBase(): Map<string, any> {
    const kb = new Map();

    // Career guidance topics
    kb.set('career_choice', {
      responses: [
        "Choosing the right career involves understanding your strengths, interests, and market demand. Consider taking our skills assessment to get personalized recommendations!",
        "Great question! I'd recommend exploring different career paths based on your skills and interests. What field are you most curious about?",
        "Career selection is crucial for long-term satisfaction. Let's start by identifying your key skills and interests. What do you enjoy doing most?"
      ],
      suggestions: ["Take skills assessment", "Explore career paths", "View salary information"]
    });

    kb.set('skills_development', {
      responses: [
        "Skill development is key to career growth! Based on current market trends, here are some high-demand skills to consider developing.",
        "I can help you identify skill gaps and create a learning roadmap. What's your current field or target career?",
        "Continuous learning is essential in today's job market. Let me suggest some skills that are particularly valuable right now."
      ],
      suggestions: ["View trending skills", "Create learning plan", "Find courses"]
    });

    kb.set('job_search', {
      responses: [
        "Job searching can be overwhelming, but I'm here to help! Let's start by optimizing your approach based on your target role.",
        "Effective job searching involves multiple strategies. I can help you with resume optimization, networking tips, and interview preparation.",
        "The job market is competitive, but with the right strategy, you can stand out. What specific aspect of job searching would you like help with?"
      ],
      suggestions: ["Resume tips", "Interview preparation", "Networking advice"]
    });

    kb.set('salary_information', {
      responses: [
        "Salary ranges vary by location, experience, and industry. I can provide current market data for specific roles.",
        "Understanding compensation is important for career decisions. What role or industry are you interested in?",
        "Salary information helps in negotiation and career planning. Let me share some insights about compensation trends."
      ],
      suggestions: ["View salary data", "Compare roles", "Negotiation tips"]
    });

    kb.set('education_training', {
      responses: [
        "Education and training are investments in your future. I can help you find the most effective learning paths for your goals.",
        "There are many ways to gain new skills - from formal education to online courses. What's your preferred learning style?",
        "Staying current with education and training is crucial. Let me suggest some options based on your career goals."
      ],
      suggestions: ["Find courses", "Certification programs", "Degree options"]
    });

    return kb;
  }

  private initializeIntents(): Map<string, any> {
    const intents = new Map();

    // Define intent patterns and keywords
    intents.set('career_choice', {
      keywords: ['career', 'job', 'profession', 'choose', 'path', 'field', 'industry', 'work'],
      patterns: [/what.*career/i, /choose.*job/i, /career.*path/i, /profession/i]
    });

    intents.set('skills_development', {
      keywords: ['skill', 'learn', 'develop', 'improve', 'training', 'course', 'education'],
      patterns: [/learn.*skill/i, /develop.*skill/i, /skill.*gap/i, /training/i]
    });

    intents.set('job_search', {
      keywords: ['job', 'search', 'apply', 'resume', 'interview', 'hiring', 'employment'],
      patterns: [/job.*search/i, /find.*job/i, /apply/i, /resume/i, /interview/i]
    });

    intents.set('salary_information', {
      keywords: ['salary', 'pay', 'compensation', 'wage', 'income', 'money', 'earning'],
      patterns: [/salary/i, /pay/i, /compensation/i, /wage/i, /earn/i]
    });

    intents.set('education_training', {
      keywords: ['education', 'degree', 'certification', 'course', 'training', 'study', 'learn'],
      patterns: [/education/i, /degree/i, /certification/i, /course/i, /study/i]
    });

    return intents;
  }

  private analyzeIntent(message: string): string {
    const messageLower = message.toLowerCase();
    
    let bestMatch = 'general';
    let maxScore = 0;

    for (const [intent, data] of this.intents) {
      let score = 0;

      // Check keyword matches
      for (const keyword of data.keywords) {
        if (messageLower.includes(keyword)) {
          score += 1;
        }
      }

      // Check pattern matches
      for (const pattern of data.patterns) {
        if (pattern.test(message)) {
          score += 2; // Patterns get higher weight
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = intent;
      }
    }

    return maxScore > 0 ? bestMatch : 'general';
  }

  private async generateAIResponse(message: string, intent: string, context?: any): Promise<string> {
    // Get responses from knowledge base
    const intentData = this.knowledgeBase.get(intent);
    
    if (intentData && intentData.responses) {
      // Select random response for variety
      const responses = intentData.responses;
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      // Personalize response based on context
      return this.personalizeResponse(response, context);
    }

    // Fallback responses for general queries
    const generalResponses = [
      "That's a great question! I'm here to help with career guidance, skills development, and job search advice. Could you tell me more about what you're looking for?",
      "I'd be happy to help you with your career-related questions. Can you provide more details about your specific situation or goals?",
      "I specialize in career advice and skills development. What aspect of your professional journey would you like to discuss?",
      "Let me help you with that! I can assist with career planning, skill assessment, job search strategies, and more. What's your main concern?"
    ];

    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }

  private personalizeResponse(response: string, context?: any): string {
    if (!context) return response;

    // Add personalization based on context
    if (context.userProfile) {
      const { experience, skills, industry } = context.userProfile;
      
      if (experience && response.includes('experience')) {
        return response + ` Given your ${experience} level of experience, I'd especially recommend focusing on advanced opportunities.`;
      }
      
      if (skills && skills.length > 0) {
        return response + ` Based on your skills in ${skills.slice(0, 2).join(' and ')}, you have great potential!`;
      }
    }

    return response;
  }

  private calculateConfidence(message: string, intent: string): number {
    // Simple confidence calculation based on intent matching
    const intentData = this.intents.get(intent);
    
    if (!intentData) return 0.5;

    const messageLower = message.toLowerCase();
    let matchCount = 0;

    // Count keyword matches
    for (const keyword of intentData.keywords) {
      if (messageLower.includes(keyword)) {
        matchCount++;
      }
    }

    // Count pattern matches
    for (const pattern of intentData.patterns) {
      if (pattern.test(message)) {
        matchCount += 2;
      }
    }

    // Calculate confidence (0.0 to 1.0)
    const confidence = Math.min(0.3 + (matchCount * 0.15), 0.95);
    return Math.round(confidence * 100) / 100;
  }

  private getSuggestedActions(intent: string): string[] {
    const intentData = this.knowledgeBase.get(intent);
    return intentData?.suggestions || [
      "Explore our AI-powered recommendations",
      "Take a skills assessment",
      "View career paths"
    ];
  }

  private getFollowUpSuggestions(intent: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      career_choice: [
        "What skills are you strongest in?",
        "What industry interests you most?",
        "Would you like to explore specific career paths?"
      ],
      skills_development: [
        "What skills would you like to develop?",
        "How much time can you dedicate to learning?",
        "Are you looking for free or paid courses?"
      ],
      job_search: [
        "What type of role are you seeking?",
        "Do you need help with your resume?",
        "Would you like interview tips?"
      ],
      salary_information: [
        "What role are you interested in?",
        "Which location or region?",
        "What's your experience level?"
      ],
      education_training: [
        "What field do you want to study?",
        "Are you looking for online or in-person options?",
        "What's your budget for education?"
      ]
    };

    return suggestions[intent] || [
      "How can I help you further?",
      "Would you like specific recommendations?",
      "Any other questions about your career?"
    ];
  }

  private getFallbackResponse(sessionId: string): ChatResponse {
    return {
      response: "I apologize, but I'm having trouble processing your request right now. Please try rephrasing your question, or ask me about career guidance, skills development, or job search advice.",
      sessionId,
      confidence: 0.1,
      intent: 'error',
      suggestedActions: [
        "Try rephrasing your question",
        "Ask about career paths",
        "Explore our main features"
      ],
      suggestions: [
        "How do I choose a career?",
        "What skills should I learn?",
        "Help me with job searching"
      ]
    };
  }

  private storeMessage(message: ChatMessage): void {
    const sessionMessages = conversations.get(message.sessionId) || [];
    sessionMessages.push(message);
    conversations.set(message.sessionId, sessionMessages);
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}