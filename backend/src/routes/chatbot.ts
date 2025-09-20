import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ChatbotService } from '../services/chatbotService';
import { logger } from '../utils/logger';

const router = express.Router();
const chatbotService = new ChatbotService();

// Chat message interface
interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sessionId?: string;
  metadata?: any;
}

interface ChatRequest extends Request {
  body: {
    message: string;
    sessionId?: string;
    userId?: string;
    context?: any;
  };
}

/**
 * @route POST /api/v1/chatbot/message
 * @desc Send message to chatbot and get AI response
 * @access Public
 */
router.post('/message', [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string'),
  body('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
], async (req: ChatRequest, res: Response): Promise<any> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Invalid input data'
      });
    }

    const { message, sessionId, userId, context } = req.body;

    logger.info('Chatbot message received', { 
      message: message.substring(0, 100), 
      sessionId, 
      userId 
    });

    // Generate bot response using AI service
    const botResponse = await chatbotService.generateResponse({
      message,
      sessionId: sessionId || generateSessionId(),
      userId,
      context
    });

    // Create response with conversation history
    const response = {
      success: true,
      data: {
        conversation: [
          {
            id: generateMessageId(),
            message,
            sender: 'user' as const,
            timestamp: new Date(),
            sessionId: botResponse.sessionId
          },
          {
            id: generateMessageId(),
            message: botResponse.response,
            sender: 'bot' as const,
            timestamp: new Date(),
            sessionId: botResponse.sessionId,
            metadata: {
              confidence: botResponse.confidence,
              intent: botResponse.intent,
              suggestedActions: botResponse.suggestedActions
            }
          }
        ],
        sessionId: botResponse.sessionId,
        suggestions: botResponse.suggestions || []
      },
      message: 'Message processed successfully'
    };

    logger.info('Chatbot response generated', { 
      sessionId: botResponse.sessionId,
      intent: botResponse.intent,
      confidence: botResponse.confidence
    });

    res.json(response);
  } catch (error: any) {
    logger.error('Error processing chatbot message', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/v1/chatbot/conversation/:sessionId
 * @desc Get conversation history for a session
 * @access Public
 */
router.get('/conversation/:sessionId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const conversation = await chatbotService.getConversationHistory(sessionId);

    res.json({
      success: true,
      data: {
        conversation,
        sessionId
      },
      message: 'Conversation history retrieved'
    });
  } catch (error) {
    logger.error('Error retrieving conversation history', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation history'
    });
  }
});

/**
 * @route POST /api/v1/chatbot/feedback
 * @desc Submit feedback for chatbot response
 * @access Public
 */
router.post('/feedback', [
  body('messageId').notEmpty().withMessage('Message ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 500 }).withMessage('Feedback must be under 500 characters')
], async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { messageId, rating, feedback, sessionId } = req.body;

    await chatbotService.submitFeedback({
      messageId,
      rating,
      feedback,
      sessionId,
      timestamp: new Date()
    });

    logger.info('Chatbot feedback submitted', { messageId, rating, sessionId });

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    logger.error('Error submitting chatbot feedback', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

/**
 * @route GET /api/v1/chatbot/suggestions
 * @desc Get suggested questions/topics
 * @access Public
 */
router.get('/suggestions', async (req: Request, res: Response): Promise<any> => {
  try {
    const suggestions = await chatbotService.getSuggestions();

    res.json({
      success: true,
      data: { suggestions },
      message: 'Suggestions retrieved successfully'
    });
  } catch (error) {
    logger.error('Error retrieving suggestions', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve suggestions'
    });
  }
});

/**
 * @route DELETE /api/v1/chatbot/conversation/:sessionId
 * @desc Clear conversation history
 * @access Public
 */
router.delete('/conversation/:sessionId', async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId } = req.params;

    await chatbotService.clearConversation(sessionId);

    res.json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing conversation', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation'
    });
  }
});

// Utility functions
function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export default router;