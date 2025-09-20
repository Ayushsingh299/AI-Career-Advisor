import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Fab,
  Collapse
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Close as CloseIcon,
  ChatBubble as ChatIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// Animations
const typing = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 380,
  height: 600,
  zIndex: 1300,
  boxShadow: theme.shadows[10],
  borderRadius: 16,
  overflow: 'hidden',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    width: '95vw',
    height: '80vh',
    bottom: 10,
    right: '2.5vw',
    left: '2.5vw'
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const MessagesContainer = styled(Box)(() => ({
  height: 400,
  overflowY: 'auto',
  padding: '12px',
  background: '#f8f9fa',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '3px',
  },
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isBot'
})<{ isBot: boolean }>(({ theme, isBot }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  justifyContent: isBot ? 'flex-start' : 'flex-end',
  animation: `${fadeIn} 0.3s ease-out`
}));

const BubbleContent = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isBot'
})<{ isBot: boolean }>(({ theme, isBot }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: '75%',
  backgroundColor: isBot ? theme.palette.background.default : theme.palette.primary.main,
  color: isBot ? theme.palette.text.primary : theme.palette.primary.contrastText,
  borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
  boxShadow: theme.shadows[1],
  position: 'relative'
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  '& .dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    margin: '0 2px',
    animation: `${typing} 1.5s infinite ease-in-out`,
    '&:nth-of-type(2)': { animationDelay: '0.2s' },
    '&:nth-of-type(3)': { animationDelay: '0.4s' }
  }
}));

const ChatFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1300,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  }
}));

// Interfaces
interface Message {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    confidence?: number;
    intent?: string;
    suggestedActions?: string[];
  };
}

interface ChatbotProps {
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    messageId: string | null;
  }>({ open: false, messageId: null });
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        message: "Hi there! I'm your AI Career Advisor. I'm here to help you with career guidance, skills development, job search advice, and more. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      loadSuggestions();
    }
  }, [isOpen, messages.length]);

  const loadSuggestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chatbot/suggestions`);
      if (response.data.success) {
        setSuggestions(response.data.data.suggestions.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      message: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/chatbot/message`, {
        message: text,
        sessionId
      });


      if (response.data.success) {
        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          message: response.data.data.conversation[1].message,
          sender: 'bot',
          timestamp: new Date(),
          metadata: response.data.data.conversation[1].metadata
        };

        setMessages(prev => [...prev, botMessage]);
        
        if (response.data.data.suggestions) {
          setSuggestions(response.data.data.suggestions.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const openFeedback = (messageId: string) => {
    setFeedbackDialog({ open: true, messageId });
    setRating(null);
    setFeedbackText('');
  };

  const submitFeedback = async () => {
    if (!feedbackDialog.messageId || !rating) return;

    try {
      await axios.post(`${API_BASE_URL}/api/v1/chatbot/feedback`, {
        messageId: feedbackDialog.messageId,
        rating,
        feedback: feedbackText,
        sessionId
      });
      
      setFeedbackDialog({ open: false, messageId: null });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const clearConversation = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/chatbot/conversation/${sessionId}`);
      setMessages([]);
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 100);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  if (!isOpen) {
    return (
      <ChatFab
        color="primary"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <ChatIcon sx={{ color: 'white' }} />
      </ChatFab>
    );
  }

  return (
    <>
      <ChatContainer>
        {/* Header */}
        <ChatHeader>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.contrastText', color: 'primary.main', mr: 1 }}>
              <BotIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                AI Career Advisor
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Online • Ready to help
              </Typography>
            </Box>
          </Box>
          <Box>
            <Tooltip title="Clear conversation">
              <IconButton
                onClick={clearConversation}
                sx={{ color: 'primary.contrastText', mr: 1 }}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close chat">
              <IconButton
                onClick={() => setIsOpen(false)}
                sx={{ color: 'primary.contrastText' }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ChatHeader>

        {/* Messages */}
        <MessagesContainer>
          <List sx={{ padding: 0 }}>
            {messages.map((message) => (
              <MessageBubble key={message.id} isBot={message.sender === 'bot'}>
                <Box display="flex" alignItems="flex-start" gap={1}>
                  {message.sender === 'bot' && (
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  
                  <Box>
                    <BubbleContent isBot={message.sender === 'bot'}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.message}
                      </Typography>
                      
                      {message.metadata && (
                        <Box mt={1} display="flex" gap={0.5}>
                          {message.metadata.confidence && (
                            <Chip
                              size="small"
                              label={`${Math.round(message.metadata.confidence * 100)}% confident`}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      )}
                    </BubbleContent>
                    
                    {message.sender === 'bot' && message.id !== 'welcome' && (
                      <Box mt={0.5} display="flex" justifyContent="flex-start" gap={0.5}>
                        <Tooltip title="Helpful response">
                          <IconButton
                            size="small"
                            onClick={() => openFeedback(message.id)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <ThumbUpIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Not helpful">
                          <IconButton
                            size="small"
                            onClick={() => openFeedback(message.id)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <ThumbDownIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                  
                  {message.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <UserIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              </MessageBubble>
            ))}
            
            {isLoading && (
              <MessageBubble isBot={true}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <BotIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <BubbleContent isBot={true}>
                  <TypingIndicator>
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </TypingIndicator>
                </BubbleContent>
              </MessageBubble>
            )}
          </List>
          <div ref={messagesEndRef} />
        </MessagesContainer>

        {/* Suggestions */}
        <Collapse in={suggestions.length > 0 && !isLoading}>
          <Box p={1} bgcolor="background.default">
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Suggested questions:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{ 
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Collapse>

        {/* Input */}
        <Box p={2} bgcolor="background.paper" borderTop={1} borderColor="divider">
          <Box display="flex" gap={1}>
            <TextField
              ref={inputRef}
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 20,
                }
              }}
            />
            <IconButton
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground'
                }
              }}
            >
              {isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </ChatContainer>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog.open} onClose={() => setFeedbackDialog({ open: false, messageId: null })}>
        <DialogTitle>Rate this response</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Typography variant="body2" color="text.secondary">
              How helpful was this response?
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
            />
            <TextField
              multiline
              rows={3}
              placeholder="Optional: Tell us more about your experience"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog({ open: false, messageId: null })}>
            Cancel
          </Button>
          <Button onClick={submitFeedback} variant="contained" disabled={!rating}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Chatbot;