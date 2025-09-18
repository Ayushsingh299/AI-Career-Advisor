import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "How would you rate your programming experience?",
    options: ["Beginner", "Intermediate", "Advanced", "Expert"]
  },
  {
    id: 2,
    question: "Which area interests you most?",
    options: ["Frontend Development", "Backend Development", "Data Science", "DevOps"]
  },
  {
    id: 3,
    question: "How comfortable are you with problem-solving?",
    options: ["Not comfortable", "Somewhat comfortable", "Very comfortable", "Expert level"]
  },
  {
    id: 4,
    question: "What is your preferred learning style?",
    options: ["Visual learner", "Hands-on practice", "Reading documentation", "Video tutorials"]
  },
  {
    id: 5,
    question: "How do you handle working in teams?",
    options: ["Prefer solo work", "Small teams", "Large teams", "Leadership roles"]
  }
];

const Assessment: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: Send assessment data to backend
      console.log('Assessment answers:', answers);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to dashboard with results
      navigate('/dashboard', { state: { assessmentCompleted: true } });
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isCompleted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" gutterBottom color="primary">
              Assessment Complete!
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for completing the skills assessment. 
              Our AI is now analyzing your responses to generate personalized recommendations.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{ mt: 4 }}
            >
              View My Results
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        Skills Assessment
      </Typography>
      
      <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
        Answer these questions to help us understand your current skills and career interests.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Question {currentQuestion + 1} of {questions.length}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ fontSize: '1.2rem', fontWeight: 'bold', mb: 3 }}>
              {currentQ.question}
            </FormLabel>
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
            >
              {currentQ.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!answers[currentQ.id]}
        >
          {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </Box>

      {!answers[currentQ.id] && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select an answer to continue.
        </Alert>
      )}
    </Container>
  );
};

export default Assessment;